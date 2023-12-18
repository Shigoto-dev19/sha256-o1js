import { Field, Bool } from 'o1js';
import { toBoolArray, binaryStringToBoolArray } from './binary-utils.js';

function padding(input: string): Bool[] {
  let input_binary = toBoolArray(input);
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

// Parsing the message to obtain N-512 bit blocks
function parsing512(bits: Bool[]): Bool[][] {
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

export { padding, parsing512, M_op };
