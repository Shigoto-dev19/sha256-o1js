import { Bytes, UInt32 } from 'o1js';
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
  SHA256,
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

// The SHA256 object
class SHA256 {
  private H: UInt32[];

  constructor() {
    this.H = [...initialHashWords];
  }

  private round(W: UInt32[]): void {
    let a = this.H[0];
    let b = this.H[1];
    let c = this.H[2];
    let d = this.H[3];
    let e = this.H[4];
    let f = this.H[5];
    let g = this.H[6];
    let h = this.H[7];

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

    this.H[0] = addMod32(a, this.H[0]);
    this.H[1] = addMod32(b, this.H[1]);
    this.H[2] = addMod32(c, this.H[2]);
    this.H[3] = addMod32(d, this.H[3]);
    this.H[4] = addMod32(e, this.H[4]);
    this.H[5] = addMod32(f, this.H[5]);
    this.H[6] = addMod32(g, this.H[6]);
    this.H[7] = addMod32(h, this.H[7]);
  }

  update(data: Bytes): this {
    const parsedInput = parseSha2Input(data);
    const paddedInput = padInput(parsedInput);

    const N = parseBinaryTo512BitBlocks(paddedInput);

    for (let i = 1; i <= N.length; i++) {
      const M = parse512BitBlock(N[i - 1]);
      const W = prepareMessageSchedule(M);
      this.round(W);
    }

    return this;
  }

  digest(): Bytes {
    // Clone the current instance's state to avoid modifying it during the conversion
    const clone = new SHA256();
    clone.H = [...this.H];
    return Bytes.from(clone.H.map((x) => wordToBytes(x.value, 4).reverse()).flat());  
  }
}

let input = Bytes.fromString('abc');
let digest = new SHA256().update(input).digest();


import { Provable } from 'o1js';
import { sha256 as nobleSha256 } from '@noble/hashes/sha256';
import { bytesToHex, concatBytes } from '@noble/hashes/utils';
Provable.log('digest from class: ', digest.toHex());

let input1 = new Uint8Array([1, 2]);
let input2 = new Uint8Array([1, 2]);
let input12 = concatBytes(input1, input2);

let nobleChain = nobleSha256(input12);
let nobleConcat = nobleSha256.create().update(input1).update(input2).digest();
Provable.log('nobleChain: ', bytesToHex(nobleChain))
Provable.log('nobleConcat: ', bytesToHex(nobleConcat))

let shaChain = sha256O1js(Bytes.from(input12)).toHex();
let shaConcat = new SHA256().update(Bytes.from(input1)).update(Bytes.from(input2)).digest().toHex();

Provable.log('\nshaChain: ', shaChain)
Provable.log('shaConcat: ', shaConcat)