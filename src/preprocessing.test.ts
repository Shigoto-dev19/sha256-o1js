import { 
  padInput, 
  parseBinaryTo512BitBlocks, 
  parseSha2Input, 
  parse512BitBlock,
} from './preprocessing';
import { H } from './constants';
import {
  fieldToBinary,
  toBinaryString,
  boolArrayToBinaryString,
} from './binary-utils';
import { generateRandomString } from './test-utils';

describe('Binary Conversion Tests', () => {
  test('should have correct number=24 to binary conversion', () => {
    const num = 24;
    const actual = toBinaryString(num);
    // assert to expected padded result [§5.1.1]
    let expected = '00011000'.padStart(64, '0');

    expect(actual).toBe(expected);
  });

  test('should have correct UTF8 encoding for string=abc', () => {
    const input = 'abc';
    const actual = toBinaryString(input);
    // a, b, c charcters in binary format
    const expected = ['01100001', '01100010', '01100011'].join('');

    expect(actual).toBe(expected);
  });
});

describe('Preprocessing Tests', () => {
  test('should have correct padding for the string=abc', () => {
    // convert abc to binary --> length --> l = 24
    let abcBinary = ['01100001', '01100010', '01100011'];
    // append 1 after input binary
    let expected = abcBinary.join('') + '1';
    // append 423 zeros
    expected += '0'.repeat(423);
    // append the length as binary
    expected += toBinaryString(24);

    const actual = padInput(parseSha2Input('abc'));
    const actualFormatted = boolArrayToBinaryString(actual);

    expect(actualFormatted).toBe(expected);
  });

  test('should have correct padding for the string=empty', () => {
    const actual = padInput(parseSha2Input(''));
    const actualFormatted = boolArrayToBinaryString(actual);

    let expected = '1' + '0'.repeat(511);
    // append the length as binary

    expect(actualFormatted).toBe(expected);
  });

  test('should correctly reverse Field parsing[§5.2.1] to binary for input=abc', () => {
    const input = padInput(parseSha2Input('abc'));
    const input512Blocks = parseBinaryTo512BitBlocks(input);
    const input32Blocks = parse512BitBlock(input512Blocks[0]);

    const actual = input32Blocks.map(fieldToBinary).join('');
    const expected = boolArrayToBinaryString(input);

    expect(actual).toStrictEqual(expected);
  });

  test('should reverse Field parsing[§5.2.1] to binary for input=random - 1000 iterations', () => {
    for (let i = 0; i < 1000; i++) {
      let inputRandom = generateRandomString(5);
      let padded = padInput(parseSha2Input(inputRandom));
      let input512Blocks = parseBinaryTo512BitBlocks(padded);
      let input32Blocks = parse512BitBlock(input512Blocks[0]);

      let actual = input32Blocks.map(fieldToBinary).join('');
      let expected = boolArrayToBinaryString(padded);

      expect(actual).toStrictEqual(expected);
    }
  });

  test('should reverse Field parsing[§5.2.1] to binary for input=randomLong - 1000 iterations', () => {
    for (let i = 0; i < 1000; i++) {
      let inputRandom = generateRandomString(100);
      let padded = padInput(parseSha2Input(inputRandom));
      let input512Blocks = parseBinaryTo512BitBlocks(padded);
      let input32Blocks = input512Blocks.map(parse512BitBlock).flat();

      let actual = input32Blocks.map(fieldToBinary).join('');
      let expected = boolArrayToBinaryString(padded);

      expect(actual).toStrictEqual(expected);
    }
  });

  test('should have compliant & constant initial hashes', () => {
    const actual = H.map(fieldToBinary);
    const expected = [
      '01101010000010011110011001100111',
      '10111011011001111010111010000101',
      '00111100011011101111001101110010',
      '10100101010011111111010100111010',
      '01010001000011100101001001111111',
      '10011011000001010110100010001100',
      '00011111100000111101100110101011',
      '01011011111000001100110100011001',
    ];

    expect(actual).toStrictEqual(expected);
  });
});
