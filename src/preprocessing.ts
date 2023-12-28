import { Field, Bool } from 'o1js';
import { toBoolArray, binaryStringToBoolArray } from './binary-utils.js';

function padding(input: Field[]): Bool[] {
  let input_binary = input.map(f => f.toBits(8)).flat();
  const ld = toBoolArray(input_binary.length);
  input_binary.push(Bool(true));
  let k = (448 - input_binary.length) % 512;
  while (k < 0) {
    k += 512;
  }
  const result = [
    ...input_binary,
    ...binaryStringToBoolArray('0'.repeat(k)),
    ...ld,
  ];
  // assert(result.length % 512 === 0);

  return result;
}

function splitArrayIntoBlocks(inputArray: Bool[]): Field[] {
  const blockSize = 8;

  // Calculate the number of blocks
  const blockCount = Math.ceil(inputArray.length / blockSize);

  // Create an array to store the blocks
  const blocks: Field[] = [];

  // Iterate through each block
  for (let i = 0; i < blockCount; i++) {
    // Calculate the start and end indices for the current block
    const start = i * blockSize;
    const end = start + blockSize;

    // Extract the current block from the input array
    const currentBlock = inputArray.slice(start, end);

    // Pad the block with zeros if necessary
    while (currentBlock.length < blockSize) {
      currentBlock.push(Bool(false));
    }

    // Add the block to the result array
    blocks.push(Field.fromBits(currentBlock));
  }

  return blocks;
}

//TODO: Add documentation
//TODO: Add compliance test
function parseSha2Input(input: string | Field): Field[] {
  let inputBinary: Bool[];
  if (typeof input === 'string') inputBinary = toBoolArray(input);
  else inputBinary = input.toBits();

  const parsedInput = splitArrayIntoBlocks(inputBinary);

  return parsedInput;
}

// Parsing the message to obtain N-512 bit blocks
function parsing512(bits: Bool[]): Bool[][] {
  // let bitsBool = bits.map(f => f.toBits(128).reverse()).flat();
  const N: Bool[][] = [];

  for (let i = 0; i < bits.length; i += 512) {
    const block: Bool[] = bits.slice(i, i + 512);
    N.push(block);
  }
  // assert(N.length === Math.ceil(bits.length / 512), 'block length error');

  return N;
}

// Parsing a 512-bit block to obtain 16 32-bit blocks
function M_op(bin: Bool[]): Field[] {
  const arr: Field[] = [];

  for (let i = 0; i < 512; i += 32) {
    let sliced32 = bin.slice(i, i + 32);
    // reverse to convert BE to LE convention
    let M: Field = Field.fromBits(sliced32.reverse());
    arr.push(M);
  }

  return arr;
}

export { padding, parsing512, M_op, parseSha2Input };
