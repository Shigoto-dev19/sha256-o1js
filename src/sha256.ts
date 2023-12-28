import { Field } from 'o1js';
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

import { padding, parsing512, M_op, parseSha2Input } from './preprocessing.js';

/**
 *
 * Initialize the first 16 32-bit blocks and calculate the the remaining 48 blocks according to SHA-256 Standards
 * This function is seperated regarding that it serves to link preprocessing and hash computation.
 */
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

//TODO: make generic function that return two function: one for tests and one for smart contract
// The SHA-256 function of a string input
type InputOptions = Field | string ;
export function sha256<T extends InputOptions>(input: T): Field[] {
  const H = [...initialHashes];
  const parsedInput = parseSha2Input(input);
  // if (typeof input === 'string') parsedInput = Provable.witness(Field[], parseSha2Input(input));
  // else parsedInput = parseSha2Input(Field(input));
  // pad & parse input
  const padded_input = padding(parsedInput);

  const N = parsing512(padded_input);
  const N_blocks = N.length;

  for (let i = 1; i <= N_blocks; i++) {
    const M = M_op(N[i - 1]);
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
  return H;
}