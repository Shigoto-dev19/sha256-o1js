import { padding } from './preprocessing';

// UTF8-encode
// Padding 
// Parsing 
// Initial Hash 

function toBinaryArray(input: string | number): string[] {
 
    if (typeof input === 'string') {
        // Convert string to UTF-8 binary representation
        const charArray = input.split('');
        let binaryArray = [];
        for (let i = 0; i < charArray.length; i++) {
            binaryArray.push(charArray[i].charCodeAt(0).toString(2).padStart(8, '0')) 
        }

        return binaryArray.map(byte => byte.split('')).flat()
               
    } else if (typeof input === 'number') {
        // Convert number to binary representation
        const binaryString = input.toString(2).padStart(64, '0');
        
        return binaryString.split('');
    } else {
        throw new Error('Unsupported input type. Only string or number are allowed.');
    }
}

describe('Binary Conversion Tests', () => {

    test('should have compliant number to binary conversion', () => {
        const num = 24;
        const actual = toBinaryArray(num);
        let expected = ['0', '0', '0', '1', '1', '0', '0', '0'];
        // assert to expected padded result [§5.1.1]
        expected = expected.join('').padStart(64, '0').split('');

        expect(actual).toStrictEqual(expected);
    });

    test('String UTF8 encoding', () => {
        const input = 'abc';
        const actual = toBinaryArray(input);
        // a, b, c charcters in binary format
        let expected = ['01100001', '01100010', '01100011'];
        expected = expected.map(element => element.split('')).flat();

        expect(actual).toStrictEqual(expected)

    });
})

describe.only('Preprocessing Tests', () => {

    test('should have compliant padding results', () => {
        // convert abc to binary --> length --> l = 24
        let abcBinary = ['01100001', '01100010', '01100011'];
        // append 1 after input binary
        let expected = abcBinary.join('') + '1';
        // append 423 zeros
        expected += '0'.repeat(423);
        // append the length as binary
        expected += toBinaryArray(24).join('');

        const actual = padding('abc');
        const actualFormatted = actual.map(y => y.toString()).flat().map((value) => (value == 'true' ? '1' : '0')).join('');

        expect(actualFormatted).toBe(expected);
    });
});


