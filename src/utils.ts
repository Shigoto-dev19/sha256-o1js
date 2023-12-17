import { Field, Bool } from 'o1js';

type BinaryString = string;

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

// Convert Binary to Hexadecimal number
function binaryToHex(x: string): string {
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
 *  This function is used in the preprocessing of a string input of the SHA256 hash function.
 *  Convert a binary number from string type such as '010110' into an array of Bool --> [Bool(false), Bool(true), Bool(false), Bool(true), Bool(true), Bool(false)]
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

function toBoolArray<T extends string | number>(input: T): Bool[] {
  if (typeof input === 'string') {
    /// UTF-8 encode a string and convert the binary string into an o1js Bool type array.
    let binaryString = '';
    for (let i = 0; i < input.length; i++) {
      let charCode = input.charCodeAt(i);
      let binaryRepresentation = charCode.toString(2).padStart(8, '0');
      binaryString += binaryRepresentation;
    }
    return binaryStringToBoolArray(binaryString);
  } else if (typeof input === 'number') {
    /// Convert the input number from decimal to binary string and then inot an o1js Bool type array.
    const binaryString = input.toString(2).padStart(64, '0');
    return binaryStringToBoolArray(binaryString);
  } else {
    /// Handle other cases
    throw new Error(
      'Unsupported input type. Only string or number are allowed.'
    );
  }
}

/**
 * Convert an array of o1js Bool type into a binary string type
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

function toBinaryString(input: string | number): BinaryString {
  return boolArrayToBinaryString(toBoolArray(input));
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

function generateRandomInput(max = 1000): string {
  const randomLength = generateRandomNumber(max);
  const randomInput = generateRandomString(randomLength);

  return randomInput;
}
export {
  fieldToBinary,
  binaryToHex,
  toBoolArray,
  toBinaryString,
  binaryStringToBoolArray,
  boolArrayToBinaryString,
  generateRandomString,
  generateRandomNumber,
  generateRandomInput,
};
