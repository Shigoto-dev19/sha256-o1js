import { Field, Bool } from 'o1js';

/// Convert a string binary into an array of Bool
function bStringToBoolArray(bString: string): Bool[] {
  const boolArray: Bool[] = [];

  for (let i = 0; i < bString.length; i++) {
    const bDigit = bString[i];
    // Check if the character is '0' or '1' and push the corresponding boolean value
    if (bDigit === '0') {
      boolArray.push(Bool(false));
    } else if (bDigit === '1') {
      boolArray.push(Bool(true));
    } else {
      // Handle invalid characters if needed
      console.error(`Invalid character at position ${i}: ${bDigit}`);
    }
  }
  return boolArray;
}

function stringToBoolArray(text: string): Bool[] {
  let binaryString = '';

  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const binaryRepresentation = charCode.toString(2).padStart(8, '0');
    binaryString += binaryRepresentation;
  }

  return bStringToBoolArray(binaryString);
}

// Convert decimal number into a Bool Array
function numberToBoolArray(dec: number): Bool[] {
  const bString = (dec >>> 0).toString(2);
  const bString_padded = '0'.repeat(64 - bString.length) + bString;

  return bStringToBoolArray(bString_padded);
}

function padding(input: string): Bool[] {
  let input_binary = stringToBoolArray(input);
  const ld = numberToBoolArray(input_binary.length);
  input_binary.push(Bool(true));
  let k = (448 - input_binary.length) % 512;
  while (k < 0) {
    k += 512;
  }
  const result = [...input_binary, ...bStringToBoolArray('0'.repeat(k)), ...ld];
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

// Parsing the message to obtain 16 32-bit blocks
function M_op(bin: Bool[]): Field[] {
  const arr: Field[] = [];
  for (let i = 0; i < 512; i += 32) {
    const M: Field = Field.fromBits(bin.slice(i, i + 32));
    arr.push(M);
  }

  return arr;
}

function bitwiseAddition2Mod32(a: Field, b: Field): Field {
  let sum = a.add(b);
  const TWO_32 = Field(2 ** 32);

  // Check if the sum is greater than or equal to 2^32
  if (sum >= TWO_32) {
    // Subtract 2^32 to handle overflow
    sum = sum.sub(TWO_32);
  }

  return sum;
}

function bitwiseAdditionMod32(...args: Field[]): Field {
  let sum = Field(0);

  // Add each argument using the bitwiseAdditionMod32 function
  for (const val of args) {
    sum = bitwiseAddition2Mod32(sum, val);
  }

  return sum;
}

export { stringToBoolArray, padding, parsing512, M_op, bitwiseAdditionMod32 };
