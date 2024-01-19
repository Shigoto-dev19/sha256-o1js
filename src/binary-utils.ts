import { Field, Bool, Provable, UInt8, UInt32 } from 'o1js';

export {
  uint32ToBinary,
  binaryToHex,
  toBoolArray,
  toBinaryString,
  binaryStringToBoolArray,
  boolArrayToBinaryString,
  bytesToWord,
  wordToBytes,
};

/**
 * This type refers to a string that contains a sequence of '0's and '1' which is the binary representation of a number or an UTF-8 encoded native string ty
 */
type BinaryString = string;

/**
 * Convert a field element from o1js into a BinaryString
 */
function uint32ToBinary(input: UInt32): BinaryString {
  const binaryField = input.value
    .toBits(32)
    .reverse() // bitify to BE
    .flat()
    .map((y) => y.toString()) // convert to have acceptable assertion format
    .map((value) => (value == 'true' ? '1' : '0'))
    .join('');

  return binaryField;
}

/**
 *  Convert a BinaryString into Hexadecimal
 */
function binaryToHex(x: BinaryString): string {
  let result = '';
  for (let i = 0; i < x.length; i += 4) {
    result += parseInt(x.substring(i, i + 4), 2).toString(16);
  }

  return result;
}

/**
 *  Convert a BinaryString into an array of o1js Bool type: [Bool(false), Bool(true), Bool(false), Bool(true), Bool(true), Bool(false)]
 */
function binaryStringToBoolArray(binaryString: BinaryString): Bool[] {
  const boolArray: Bool[] = [];
  for (let i = 0; i < binaryString.length; i++) {
    const bDigit = binaryString[i];
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

/**
 * Convert a string or number into binary as an array of o1js Bool type.
 */
function toBoolArray<T extends string | number>(input: T): Bool[] {
  if (typeof input === 'string') {
    // UTF-8 encode a string and convert the binary string into an o1js Bool type array.
    let binaryString = '';
    for (let i = 0; i < input.length; i++) {
      let charCode = input.charCodeAt(i);
      let binaryRepresentation = charCode.toString(2).padStart(8, '0');
      binaryString += binaryRepresentation;
    }
    return binaryStringToBoolArray(binaryString);
  } else if (typeof input === 'number') {
    // Convert the input number from decimal to binary string and then inot an o1js Bool type array.
    const binaryString = input.toString(2).padStart(64, '0');
    return binaryStringToBoolArray(binaryString);
  } else {
    // Handle other cases
    throw new Error(
      'Unsupported input type. Only string or number are allowed.'
    );
  }
}

/**
 * Convert an array of o1js Bool type into a binary string type.
 */
function boolArrayToBinaryString(input: Bool[]): BinaryString {
  return input
    .map((bool) => {
      const stringified = bool.toString();
      const binaryDigit = stringified == 'true' ? '1' : '0';
      return binaryDigit;
    })
    .join('');
}

/**
 * Convert a number or string input into a BinaryString.
 */
function toBinaryString(input: string | number): BinaryString {
  return boolArrayToBinaryString(toBoolArray(input));
}

// conversion between bytes and multi-byte words

/**
 * !copied from ./o1js/src/lib/gadgets/bit-slices.ts
 * Convert an array of UInt8 to a Field element. Expects little endian representation.
 */
function bytesToWord(wordBytes: UInt8[]): Field {
  return wordBytes.reduce((acc, byte, idx) => {
    const shift = 1n << BigInt(8 * idx);
    return acc.add(byte.value.mul(shift));
  }, Field.from(0));
}

/**
 * !copied from ./o1js/src/lib/gadgets/bit-slices.ts
 * Convert a Field element to an array of UInt8. Expects little endian representation.
 * @param bytesPerWord number of bytes per word
 */
function wordToBytes(word: Field, bytesPerWord = 8): UInt8[] {
  let bytes = Provable.witness(Provable.Array(UInt8, bytesPerWord), () => {
    let w = word.toBigInt();
    return Array.from({ length: bytesPerWord }, (_, k) =>
      UInt8.from((w >> BigInt(8 * k)) & 0xffn)
    );
  });

  // check decomposition
  bytesToWord(bytes).assertEquals(word);

  return bytes;
}
