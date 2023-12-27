import { createHash } from 'crypto';
import { binaryToHex, fieldToBinary, parseHashInput, toBoolArray } from './binary-utils.js';
import { sha256 as o1jsSha256 } from './sha256.js';
import { sha256 as nobleSha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';
import * as crypto from 'crypto';

const TWO32 = 2n ** 32n;

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
function rotateRight(x: number, n: number): bigint {
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
function shiftRight(value: number, shift: number): bigint {
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
function generateRandomInput(max = 1000): string {
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

function nodeHash(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

function o1jsHash(input: string): string {
  const digest = o1jsSha256(parseHashInput(input));
  const digestBinary = digest.map(fieldToBinary).join('');
  const digestHex = binaryToHex(digestBinary);

  return digestHex;
}

function nobleHash(input: string): string {
  return bytesToHex(nobleSha256(input));
}

export {
  TWO32,
  rotateRight,
  shiftRight,
  generateRandomString,
  generateRandomInput,
  generateRandomBytes,
  nodeHash,
  o1jsHash,
  nobleHash,
};
