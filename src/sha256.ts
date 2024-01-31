import { 
  Bytes, 
  UInt32,
  UInt8,
 } from 'o1js';
import { H as initialHashWords, K } from './constants.js';
import {
  ch,
  maj,
  SIGMA0,
  SIGMA1,
  addMod32,
  prepareMessageSchedule,
  sigma1,
  sigma0,
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

/**
 * SHA2-256 Class.
 */
class SHA256 {
  /** Length of hash output = 32 bytes*/
  readonly digestLength: number = 32;

  /** Block size = 64 bytes*/
  readonly blockSize: number = 64;

  // Note: Int32Array is used instead of Uint32Array for performance reasons.
  protected _state: UInt32[] = []; // hash state
  private _temp: UInt32[] = new Array(64).fill(UInt32.from(0)); // temporary state
  private _buffer: UInt8[] = new Array(128).fill(UInt8.from(0)); // buffer for data to hash
  private _bufferLength = 0; // number of bytes in buffer
  private _bytesHashed = 0; // number of total bytes hashed
  private _finished = false; // indicates whether the hash was finalized

  constructor() {
      this.reset();
  }

  protected _initState() {
      this._state[0] = initialHashWords[0];
      this._state[1] = initialHashWords[1];
      this._state[2] = initialHashWords[2];
      this._state[3] = initialHashWords[3];
      this._state[4] = initialHashWords[4];
      this._state[5] = initialHashWords[5];
      this._state[6] = initialHashWords[6];
      this._state[7] = initialHashWords[7];
  }

  /**
   * Resets hash state making it possible
   * to re-use this instance to hash other data.
   */
  reset(): this {
      this._initState();
      this._bufferLength = 0;
      this._bytesHashed = 0;
      this._finished = false;
      return this;
  }

  /**
   * Cleans internal buffers and resets hash state.
   */
  clean() {
      wipe8(this._buffer);
      wipe32(this._temp);
      this.reset();
  }

  /**
   * Updates hash state with the given data.
   *
   * Throws error when trying to update already finalized hash:
   * instance must be reset to update it again.
   */
  update(data: Bytes, dataLength: number = data.length): this {
      if (this._finished) {
          throw new Error("SHA256: can't update because hash was finished.");
      }
      let dataPos = 0;
      this._bytesHashed += dataLength;
      if (this._bufferLength > 0) {
          while (this._bufferLength < this.blockSize && dataLength > 0) {
              this._buffer[this._bufferLength++] = data.bytes[dataPos++];
              dataLength--;
          }
          if (this._bufferLength === this.blockSize) {
              hashBlocks(this._temp, this._state, this._buffer, 0, this.blockSize);
              this._bufferLength = 0;
          }
      }
      if (dataLength >= this.blockSize) {
          dataPos = hashBlocks(this._temp, this._state, data.bytes, dataPos, dataLength);
          dataLength %= this.blockSize;
      }
      while (dataLength > 0) {
          this._buffer[this._bufferLength++] = data.bytes[dataPos++];
          dataLength--;
      }
      return this;
  }

  /**
   * Finalizes hash state and puts hash into out.
   * If hash was already finalized, puts the same value.
   */
  finish(out: UInt8[]): this {
      if (!this._finished) {
          const bytesHashed = this._bytesHashed;
          const left = this._bufferLength;
          const bitLenHi = (bytesHashed / 0x20000000) | 0;
          const bitLenLo = bytesHashed << 3;
          const padLength = (bytesHashed % 64 < 56) ? 64 : 128;

          this._buffer[left] = UInt8.from(0x80);
          for (let i = left + 1; i < padLength - 8; i++) {
              this._buffer[i] = UInt8.from(0);
          }
          writeUint32BE(bitLenHi, this._buffer, padLength - 8);
          writeUint32BE(bitLenLo, this._buffer, padLength - 4);

          hashBlocks(this._temp, this._state, this._buffer, 0, padLength);

          this._finished = true;
      }

      for (let i = 0; i < this.digestLength / 4; i++) {
          //writeUint32BE(Number(this._state[i].toBigint()), out, i * 4);
          writeUint32BEProvable(this._state[i], out, i * 4);
      }

      return this;
  }

  /**
   * Returns the final hash digest.
   */
  digest(): Bytes {
      const out: UInt8[] = new Array(this.digestLength).fill(UInt8.from(0));
     
      this.finish(out);
      return Bytes.from(out);
  }
}

function wipe32(array: UInt32[]): UInt32[] {
  for (let i = 0; i < array.length; i++) {
      array[i] = UInt32.from(0);
  }
  return array;
}

function wipe8(array: UInt8[]): UInt8[] {
  for (let i = 0; i < array.length; i++) {
      array[i] = UInt8.from(0);
  }
  return array;
}

function writeUint32BE(value: number, out: UInt8[] = new Array(4).fill(UInt8.from(0)), offset = 0): UInt8[] {
    out[offset + 0] = UInt8.from((value >> 24) & 0xFF);
    out[offset + 1] = UInt8.from((value >> 16) & 0xFF);
    out[offset + 2] = UInt8.from((value >> 8) & 0xFF);
    out[offset + 3] = UInt8.from(value & 0xFF);
  
  return out;
}

function writeUint32BEProvable(value: UInt32, out: UInt8[] = new Array(4).fill(UInt8.from(0)), offset = 0): UInt8[] {
  let bytes: Field[] = [];
  let bits = value.value.toBits(32).reverse();
  for (let i=0; i < 32; i += 8)
  bytes.push(Field.fromBits(bits.slice(i, i+8).reverse()));

  out[offset + 0] = UInt8.from(bytes[0]);
  out[offset + 1] = UInt8.from(bytes[1]);
  out[offset + 2] = UInt8.from(bytes[2]);
  out[offset + 3] = UInt8.from(bytes[3]);

  return out;
}




function hashBlocks(w: UInt32[], v: UInt32[], p: UInt8[], pos: number, len: number): number {
  while (len >= 64) {
      let a = v[0];
      let b = v[1];
      let c = v[2];
      let d = v[3];
      let e = v[4];
      let f = v[5];
      let g = v[6];
      let h = v[7];

      for (let i = 0; i < 16; i++) {
          let j = pos + i * 4;
          w[i] = UInt32.from(Field.fromBits(p.slice(j, j+=4).map(x => x.value.toBits(8)).reverse().flat()));
      }

      for (let t = 16; t <= 63; t++) {
          w[t] = addMod32(sigma1(w[t - 2]), w[t - 7], sigma0(w[t - 15]), w[t - 16]);
        }

        for (let t = 0; t < 64; t++) {
          const T1 = addMod32(h, SIGMA1(e), ch(e, f, g), K[t], w[t]);
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

        v[0] = addMod32(a, v[0]);
        v[1] = addMod32(b, v[1]);
        v[2] = addMod32(c, v[2]);
        v[3] = addMod32(d, v[3]);
        v[4] = addMod32(e, v[4]);
        v[5] = addMod32(f, v[5]);
        v[6] = addMod32(g, v[6]);
        v[7] = addMod32(h, v[7]);

      pos += 64;
      len -= 64;
  }
  return pos;
}

function hash(data: Bytes): Bytes {
  const h = new SHA256();
  h.update(data);
  const digest = h.digest();
  h.clean();
  return digest;
}

import { Provable, Field } from 'o1js';
import { sha256 as nobleSha256 } from '@noble/hashes/sha256';
import { bytesToHex, concatBytes } from '@noble/hashes/utils';
import { Timer } from './test-utils.js';

let input = Bytes.fromString('abc');
let digest = new SHA256().update(input).digest();
Provable.log('digest from class: ', digest.toHex());

let input1 = new Uint8Array([1, 2]);
let input2 = new Uint8Array([3, 4]);
let input12 = concatBytes(input1, input2);

let nobleChain = nobleSha256(input12);
let nobleConcat = nobleSha256.create().update(input1).update(input2).digest();
Provable.log('\nnobleChain:  ', bytesToHex(nobleChain))
Provable.log('nobleWhole: ', bytesToHex(nobleConcat))

let shaChain = new SHA256().update(Bytes.from(input12)).digest().toHex();
let shaConcat = new SHA256().update(Bytes.from(input1)).update(Bytes.from(input2)).digest().toHex();
Provable.log('\nshaChain:    ', shaChain)
Provable.log('shaWholet:   ', shaConcat)



// measure run time
const timer = new Timer();
hash(Bytes.fromString('abc')).toHex()
timer.end()
console.log('timer: ', timer.executionTime);

// prove that the class hash function is provable
class Bytes32 extends Bytes(32) {}
console.time('sha256 witness');
Provable.runAndCheck(() => {
  let input = Provable.witness(Bytes32.provable, () => Bytes32.random());
  hash(input);
});
console.timeEnd('sha256 witness');