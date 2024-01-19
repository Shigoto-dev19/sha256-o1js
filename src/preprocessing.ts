import { Field, Bool, Bytes, UInt32 } from 'o1js';
import { toBoolArray } from './binary-utils.js';
import { addMod32, sigma0, sigma1 } from './bitwise-functions.js';

export {
  padInput,
  parseBinaryTo512BitBlocks,
  parse512BitBlock,
  parseSha2Input,
  prepareMessageSchedule,
};

/**
 * Reverse the input bytes endianess and converts them into an array of Fields.
 *
 * @param {Bytes} input - The input to be parsed into an array of Fields.
 * @returns {Field[]} An array of Fields representing the parsed input for SHA-256 in zkapp.
 *
 */
function parseSha2Input(input: Bytes): Bool[] {
  const parsedInput = input
    .toFields()
    .map((f) => f.toBits(8).reverse())
    .flat();

  return parsedInput;
}

/**
 * Performs padding on the input according to the SHA-256 standards.
 *
 * The padding involves appending a single '1' bit, followed by a series of '0' bits,
 * and finally, the original length of the input in binary form as a 64-bit integer.
 *
 * @param {Bool[]} input - The input parsed into an array of 8-bit field elements.
 * @returns {Bool[]} The padded input bits according to SHA-256.
 *
 */
function padInput(parsedInput: Bool[]): Bool[] {
  // Reverse parsing the input from Field[] into binary=Bool[]
  let paddedInput = parsedInput;
  const blockSize = 512;
  const initialLength = paddedInput.length;
  const bitLength = initialLength % blockSize;
  const paddingLength =
    bitLength < 448 ? 448 - bitLength : blockSize + 448 - bitLength;

  // Append a single '1' bit
  paddedInput.push(Bool(true));

  // Append '0' bits until reaching the padding length
  for (let i = 0; i < paddingLength - 1; i++) paddedInput.push(Bool(false));

  // Append the 64-bit representation of the initial length
  const inputBitLengthBinary = toBoolArray(initialLength);
  paddedInput.push(...inputBitLengthBinary);

  return paddedInput;
}

/**
 * Parses the padded input into 512-bit blocks for processing in SHA-256.
 *
 * This function divides the padded input bits into blocks of 512 bits each.
 *
 * @param {Bool[]} bits - The padded input bits to be parsed into 512-bit blocks.
 * @returns {Bool[][]} An array of 512-bit blocks obtained from the padded input bits.
 *
 */
function parseBinaryTo512BitBlocks(bits: Bool[]): Bool[][] {
  const blockSize = 512;
  const bits512Blocks: Bool[][] = [];

  for (let i = 0; i < bits.length; i += blockSize) {
    const block = bits.slice(i, i + blockSize);
    bits512Blocks.push(block);
  }

  return bits512Blocks;
}

/**
 * Parses a 512-bit block into sixteen 32-bit words (Fields) for SHA-256 processing.
 *
 * This function divides a 512-bit block into sixteen 32-bit words, each represented as a Field element.
 * It follows the M_op operation in [§5.2.1] of the SHA-256 standards.
 *
 * @param {Bool[]} bits512Block - The 512-bit block to be parsed into sixteen 32-bit words.
 * @returns {UInt32[]} An array of sixteen 32-bit words (Fields) obtained from the 512-bit block.
 *
 */
function parse512BitBlock(bits512Block: Bool[]): UInt32[] {
  const bits32Words: Field[] = [];

  for (let i = 0; i < 512; i += 32) {
    let sliced32 = bits512Block.slice(i, i + 32);
    // Reverse endianess: convert BE to LE convention
    let bits32Word: Field = Field.fromBits(sliced32.reverse());
    bits32Words.push(bits32Word);
  }

  return bits32Words.map((x) => UInt32.from(x));
}

/**
 * Prepares the message schedule (W_t) for SHA-256 hash computation [§6.2.2].
 *
 * This function initializes the first 16 32-bit blocks and calculates the remaining 48 blocks
 * according to the SHA-256 standards. It serves as a link between preprocessing and hash computation.
 *
 * @param {UInt32[]} bits32Words - An array of 32-bit words (Fields) representing the input message block.
 * @returns {UInt32[]} The 32-bit message schedule (W_t) prepared for SHA-256 hash computation.
 *
 */
function prepareMessageSchedule(bits32Words: UInt32[]): UInt32[] {
  const W = [...bits32Words];

  for (let t = 16; t <= 63; t++) {
    W[t] = addMod32(sigma1(W[t - 2]), W[t - 7], sigma0(W[t - 15]), W[t - 16]);
  }

  return W;
}
