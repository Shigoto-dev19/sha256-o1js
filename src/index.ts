import { Field, Provable, provable, Bool } from 'o1js';
import { H as initialHashes, K } from './constants.js';
import { ch, maj, SIGMA0, SIGMA1, sigma0, sigma1 } from './functions.js';

import {
  padding,
  parsing512,
  M_op,
  bitwiseAdditionMod32,
} from './preprocessing.js';

/// Initialize the first 16 32-bit blocks and calculate the the remaining 48 blocks according to SHA-256 Standards
/// This function is seperated regarding that it serves to link preprocessing and hash computation
function W_op(M: Field[]): Field[] {
  const W = [...M];
  for (let t = 16; t <= 63; t++) {
    W[t] = bitwiseAdditionMod32(
      sigma1(W[t - 2]),
      W[t - 7],
      sigma0(W[t - 15]),
      W[t - 16]
    );
  }
  return W;
}

// The SHA-256 function of a message containing no more that 512 bits (N=1)
export function my_sha256(input: string) {
  const H = initialHashes;
  // pad & parse input
  const padded_input = padding(input);

  const N = parsing512(padded_input);
  const N_blocks = N.length;

  for (let i = 1; i <= N_blocks; i++) {
    const M = M_op(N[i - 1]);
    Provable.log('M is: ', M);
    const W = W_op(M);

    let a = H[0];
    let b = H[1];
    let c = H[2];
    let d = H[3];
    let e = H[4];
    let f = H[5];
    let g = H[6];
    let h = H[7];

    for (let t = 0; t < 64; t++) {
      const T1 = bitwiseAdditionMod32(h, SIGMA1(e), ch(e, f, g), K[t], W[t]);
      const T2 = bitwiseAdditionMod32(SIGMA0(a), maj(a, b, c));
      h = g;
      g = f;
      f = e;
      e = bitwiseAdditionMod32(d, T1);
      d = c;
      c = b;
      b = a;
      a = bitwiseAdditionMod32(T1, T2);
    }

    H[0] = bitwiseAdditionMod32(a, H[0]);
    H[1] = bitwiseAdditionMod32(b, H[1]);
    H[2] = bitwiseAdditionMod32(c, H[2]);
    H[3] = bitwiseAdditionMod32(d, H[3]);
    H[4] = bitwiseAdditionMod32(e, H[4]);
    H[5] = bitwiseAdditionMod32(f, H[5]);
    H[6] = bitwiseAdditionMod32(g, H[6]);
    H[7] = bitwiseAdditionMod32(h, H[7]);
  }

  return H.map(x => x.toBits(32).reverse().map(y => y.toString())).flat().map((value) => (value == 'true' ? '1' : '0')).join('');
}

// Convert Binary to Hexadecimal number
export function bin2Hex(x: string) {
  let result = '';
  for (let i = 0; i < x.length; i += 4) {
    result += parseInt(x.substring(i, i + 4), 2).toString(16);
  }
  return result;
}

Provable.log(my_sha256('abc'));
Provable.log(bin2Hex(my_sha256('abc')));
Provable.log("noble hash: ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");

// my sha256:  b27400d99eb493edfec3f6d78fe76e740b5442a71e1a4ee76edacf0067493760
// noble hash: ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad