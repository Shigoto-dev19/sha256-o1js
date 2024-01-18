import { binaryToHex, fieldToBinary } from './binary-utils.js';
import { sha256O1js } from './sha256.js';
import { sha256 as nobleSha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';
import { sha256 as sha256Circom } from './benchmarks/comparator/sha256-circom.js';
import * as crypto from 'crypto';
import { Field, Bytes } from 'o1js';

const TWO32 = BigInt(2 ** 32);

export {
  TWO32,
  rotateRight32Native,
  shiftRight32Native,
  generateRandomString,
  generateRandomInput,
  generateRandomBytes,
  bigToUint8Array,
  nodeHash,
  nobleHash,
  o1jsHash,
  o1jsHashCircom,
  Timer,
};

/**
 * Rotate the bits of a 32-bit unsigned integer to the right by a specified number of positions.
 *
 * @param {number} x - The 32-bit unsigned integer to be rotated.
 * @param {number} n - The number of positions to rotate the bits to the right.
 * @returns {bigint} A 32-bit unsigned bigint representing the result of the right rotation.
 *
 * @note
 * This function is mainly used in the file: `./bitwise.test.ts`
 */
function rotateRight32Native(x: number, n: number): bigint {
  const rotated = (x >>> n) | (x << (32 - n));
  let rotatedBig = BigInt(rotated);
  if (rotatedBig < 0n) rotatedBig += TWO32;

  return rotatedBig;
}

/**
 * Perform a bitwise right shift on a 32-bit unsigned integer by a specified number of positions.
 *
 * @param {number} value - The 32-bit unsigned integer to be shifted.
 * @param {number} shift - The number of positions to shift the bits to the right.
 * @returns {bigint} A 32-bit unsigned bigint representing the result of the right shift.
 *
 * @note
 * This function is mainly used in the file: `./bitwise.test.ts`
 */
function shiftRight32Native(value: number, shift: number): bigint {
  const shifted = value >>> shift;
  return BigInt(shifted);
}

/**
 *
 * @note A test utility for preprocessing tests.
 * Generates a random string at a given length.
 */
function generateRandomString(
  length: number,
  characterSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string {
  let result = '';
  const charactersLength = characterSet.length;

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charactersLength);
    result += characterSet.charAt(randomIndex);
  }

  return result;
}

/**
 * Generate a random number in range of 0 and a given upperbound max.
 * Utilized for testing random inputs for the main sha256 function.
 */
function generateRandomNumber(max: number): number {
  // Generate a random number between 0 (inclusive) and 1 (exclusive)
  const randomNumber = Math.random();

  // Scale the random number to the desired range [0, max)
  const scaledNumber = Math.floor(randomNumber * max);

  return scaledNumber;
}

/**
 * Generate a random input for a SHA-256 hash function.
 *
 * @param {number} [max=1000] - The maximum length of the generated input. Defaults to 1000.
 * @returns {string} A random string with a length determined by a randomly generated number.
 *
 * @note
 * This function is mainly used in the file: `./sha256.test.ts`
 */
function generateRandomInput(max = 1000, bytes = false): string | Uint8Array {
  if (bytes) return crypto.randomBytes(max);

  const randomLength = generateRandomNumber(max);
  const randomInput = generateRandomString(randomLength);

  return randomInput;
}

/**
 * Generate a random 32-bit unsigned bigint using random bytes.
 *
 * @param {number} [byteNumber=4] - The number of random bytes to generate. Must be a positive integer.
 * @returns {bigint} A random 32-bit unsigned bigint.
 *
 * @note
 * This function is mainly used in the the file: `./bitwise.test.ts`
 */
function generateRandomBytes(byteNumber = 4): bigint {
  // Generate 4 random bytes
  const randomBytes = crypto.randomBytes(byteNumber);
  return BigInt('0x' + randomBytes.toString('hex'));
}

function bigToUint8Array(big: bigint) {
  const big0 = BigInt(0);
  const big1 = BigInt(1);
  const big8 = BigInt(8);

  if (big < big0) {
    const bits: bigint = (BigInt(big.toString(2).length) / big8 + big1) * big8;
    const prefix1: bigint = big1 << bits;
    big += prefix1;
  }
  let hex = big.toString(16);
  if (hex.length % 2) {
    hex = '0' + hex;
  }
  const len = hex.length / 2;
  const u8 = new Uint8Array(len);
  let i = 0;
  let j = 0;
  while (i < len) {
    u8[i] = parseInt(hex.slice(j, j + 2), 16);
    i += 1;
    j += 2;
  }
  return u8;
}

function nodeHash(input: string | Uint8Array): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

// function o1jsHashField(input: Field): string {
//   const digest = sha256O1js(Bytes.from(Field.toBytes(input)));
//   const digestBinary = digest.map(fieldToBinary).join('');
//   const digestHex = binaryToHex(digestBinary);

//   return digestHex;
// }

function nobleHash(input: string | Uint8Array): string {
  return bytesToHex(nobleSha256(input));
}

function o1jsHash(input: string | Uint8Array): string {
  let digest: Bytes;
  if (typeof input === 'string') {
    digest = sha256O1js(Bytes.fromString(input));
  } else digest = sha256O1js(Bytes.from(input));

  return digest.toHex();
}

function o1jsHashCircom(input: string | Uint8Array): string {
  let digest: Field[];
  if (typeof input === 'string') {
    digest = sha256Circom(Bytes.fromString(input));
  } else digest = sha256Circom(Bytes.from(input));

  const digestBinary = digest.map(fieldToBinary).join('');
  const digestHex = binaryToHex(digestBinary);

  return digestHex;
}
class Timer {
  private startTime: number;
  private endTime: number;
  public executionTime: string;

  constructor() {
    this.start();
  }

  private start() {
    this.startTime = performance.now();
  }

  end() {
    this.endTime = performance.now();
    this.executionTime = `${this.endTime - this.startTime} ms`;
  }
}
