import { Bytes } from 'o1js';
import { H as initialHashWords, K } from './constants.js';
import {
  ch,
  maj,
  SIGMA0,
  SIGMA1,
  addMod32,
  prepareMessageSchedule,
} from './bitwise-functions.js';

import {
  padInput,
  parseBinaryTo512BitBlocks,
  parse512BitBlock,
  parseSha2Input,
} from './preprocessing.js';
import { wordToBytes } from './binary-utils.js';

export {
  sha256O1js,
}

function sha256O1js(input: Bytes): Bytes {
  const H = [...initialHashWords];

  const parsedInput = parseSha2Input(input);
  const paddedInput = padInput(parsedInput);

  const N = parseBinaryTo512BitBlocks(paddedInput);

  for (let i = 1; i <= N.length; i++) {
    const M = parse512BitBlock(N[i - 1]);
    const W = prepareMessageSchedule(M);

    let a = H[0];
    let b = H[1];
    let c = H[2];
    let d = H[3];
    let e = H[4];
    let f = H[5];
    let g = H[6];
    let h = H[7];

    for (let t = 0; t < 64; t++) {
      const T1 = addMod32(h, SIGMA1(e), ch(e, f, g), K[t], W[t]);
      const T2 = addMod32(SIGMA0(a), maj(a, b, c));

      h = g;
      g = f;
      f = e;
      e = addMod32(d, T1);
      d = c;
      c = b;
      b = a;
      a = addMod32(T1, T2);
    }

    H[0] = addMod32(a, H[0]);
    H[1] = addMod32(b, H[1]);
    H[2] = addMod32(c, H[2]);
    H[3] = addMod32(d, H[3]);
    H[4] = addMod32(e, H[4]);
    H[5] = addMod32(f, H[5]);
    H[6] = addMod32(g, H[6]);
    H[7] = addMod32(h, H[7]);
  }

  // the message schedule is converted to big endian bytes
  // wordToBytes expects little endian, so we reverse the bytes
  return Bytes.from(H.map((x) => wordToBytes(x.value, 4).reverse()).flat());
}