import { createHash } from 'crypto';
import { binaryToHex, fieldToBinary } from './binary-utils.js';
import { sha256 as o1jsSha256 } from './index.js';
import { sha256 as nobleSha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';

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

function generateRandomInput(max = 1000): string {
  const randomLength = generateRandomNumber(max);
  const randomInput = generateRandomString(randomLength);

  return randomInput;
}

// Create a string hash
function nodeHash(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

function o1jsHash(input: string): string {
  const digest = o1jsSha256(input);
  const digestBinary = digest.map(fieldToBinary).join('');
  const digestHex = binaryToHex(digestBinary);

  return digestHex;
}

function nobleHash(input: string): string {
  return bytesToHex(nobleSha256(input));
}

export {
  generateRandomNumber,
  generateRandomString,
  generateRandomInput,
  nodeHash,
  o1jsHash,
  nobleHash,
};
