import { Field, Bool } from 'o1js';

export {
  fieldToBinary,
  binaryToHex,
  toBoolArray,
  toBinaryString,
  binaryStringToBoolArray,
  boolArrayToBinaryString,
};

/**
 * This type refers to a string that contains a sequence of '0's and '1' which is the binary representation of a number or an UTF-8 encoded native string ty
 */
type BinaryString = string;

/**
 * Convert a field element from o1js into a BinaryString
 */
function fieldToBinary(field: Field): BinaryString {
  const binaryField = field
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
 * Checks if a string is only a combination of '0's and '1's.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isBinaryString(input: string | number): boolean {
  if (typeof input == 'number') throw new Error();
  return /^[01]*$/.test(input);
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
