import { Field, Provable } from 'o1js';
import { H as initialHashes, K } from './constants.js';
import {
  ch,
  maj,
  SIGMA0,
  SIGMA1,
  sigma0,
  sigma1,
  bitwiseAdditionMod32,
} from './functions.js';

import { padding, parsing512, M_op } from './preprocessing.js';
import { fieldToBinary, binaryToHex } from './utils.js';

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
export function my_sha256(input = '') {
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

  Provable.log('H from Fields: ', H.map(fieldToBinary));

  const binaryDigest = H.map(fieldToBinary).join('');

  return binaryDigest;
}

Provable.log(my_sha256(''));
Provable.log('o1js hash: ', binaryToHex(my_sha256('')));
// Provable.log("noble hash: ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");

// my sha256:  b27400d99eb493edfec3f6d78fe76e740b5442a71e1a4ee76edacf0067493760
// noble hash: ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad

// noble empty hash: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855

/* abc hash binary:  [
  '10111010011110000001011010111111',
  '10001111000000011100111111101010',
  '01000001010000010100000011011110',
  '01011101101011100010001000100011',
  '10110000000000110110000110100011',
  '10010110000101110111101010011100',
  '10110100000100001111111101100001',
  '11110010000000000001010110101101'
] */

/* empty hash binary:  [
  '11100011101100001100010001000010',
  '10011000111111000001110000010100',
  '10011010111110111111010011001000',
  '10011001011011111011100100100100',
  '00100111101011100100000111100100',
  '01100100100110111001001101001100',
  '10100100100101011001100100011011',
  '01111000010100101011100001010101'
] */
