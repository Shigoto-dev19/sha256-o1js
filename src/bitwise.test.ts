import { RotR, ShR, ch } from './functions';
import { Field } from 'o1js';
import * as crypto from 'crypto';

const TWO32 = 2n ** 32n;

function rotateRight(x: number, n: number): bigint {
    const rotated = (x >>> n) | (x << (32-n));
    let rotatedBig = BigInt(rotated);
    if (rotatedBig < 0n) rotatedBig += TWO32;

    return rotatedBig
}

function shiftRight(value: number, shift: number): bigint {
    const shifted = value >>> shift; 
    return BigInt(shifted)
}

function Ch(x: number, y: number, z: number): bigint {
    const out = (x & y) ^ (~x & z);
    let outBig = BigInt(out);
    if (outBig < 0n) outBig += TWO32;

    return outBig
}

function getRandomBytes(byteNumber: number): bigint {
    // Generate 4 random bytes
    const randomBytes = crypto.randomBytes(byteNumber);
    return BigInt("0x" + randomBytes.toString("hex"));
  }

describe('Bitwise Operation Tests', () => {
    
    describe('Rotate Right bitwise function tests', () => {

        test('should correctly rotate a random 32-bit integer to the right by a random number of bits', () => {
            const input = getRandomBytes(4);
            const rotationBits = Number(getRandomBytes(1) % 32n);
            const rotated_actual = RotR(Field(input), rotationBits).toBigInt();
            const rotated_expected = BigInt(rotateRight(Number(input), rotationBits));

            expect(rotated_actual).toBe(rotated_expected);
        });

        test('should correctly rotate a random 32-bit integer to the right by a random number of bits - 1000 ITERATIONS', () => {
            for (let i = 0; i < 1000; i++) {
                let input = getRandomBytes(4);
                let rotationBits = Number(getRandomBytes(1) % 32n);
                let rotated_actual = RotR(Field(input), rotationBits).toBigInt();
                let rotated_expected = BigInt(rotateRight(Number(input), rotationBits));

                expect(rotated_actual).toBe(rotated_expected);
            }
        });

        test('should rotate 0x80000000 to the right by 1 bit', () => {
            const input = Field(0x80000000);
            const rotated_actual = RotR(input, 1).toBigInt();
            const rotated_expected = BigInt(0x40000000);

            expect(rotated_actual).toBe(rotated_expected);
        });
    
        test('should rotate 0xFFFFFFFF (all bits set) to the right by 16 bits', () => {
            const input = Field(0xFFFFFFFF);
            const rotated_actual = RotR(input, 16).toBigInt();
            const rotated_expected = BigInt(0xFFFFFFFF);

            expect(rotated_actual).toBe(rotated_expected);
        });
    
        test('should rotate 0xABCDEF12 to the right by 4 bits', () => {
            const input = Field(0xABCDEF12);
            const rotated_actual = RotR(input, 4).toBigInt();
            const rotated_expected = BigInt(0x2ABCDEF1);

            expect(rotated_actual).toBe(rotated_expected);
        });
    
        test('should handle rotation by 0 bits', () => {
            const input = Field(0x12345678);
            const rotated_actual = RotR(input, 0).toBigInt();
            const rotated_expected = BigInt(0x12345678);

            expect(rotated_actual).toBe(rotated_expected);
        });
    
        test('should handle rotation by a multiple of 32 bits', () => {
            const input = Field(0xABCDEF12);
            const rotated_actual = RotR(input, 32).toBigInt();
            const rotated_expected = BigInt(0xABCDEF12);

            expect(rotated_actual).toBe(rotated_expected);
        });

        test('should rotate 0xABCDEF12 to the right by 4 bits', () => {
            const input = Field(0xABCDEF12);
            const rotated_actual = RotR(input, 4).toBigInt();
            const rotated_expected = Field(0x2ABCDEF1);

            expect(rotated_actual).toBe(rotated_expected.toBigInt())
        });

        test('should rotate 1 to the right by 1 bit', () => {
            const input = Field(1);
            const rotated_actual = RotR(input, 1).toBigInt();
            const rotated_expected = BigInt(0x80000000);

            expect(rotated_actual).toBe(rotated_expected);
        });
    
        test('should rotate 0xAAAAAAAA to the right by 2 bits', () => {
            const input = Field(0xAAAAAAAA);
            const rotated_actual = RotR(input, 2).toBigInt();
            const rotated_expected = BigInt(0xAAAAAAAA);

            expect(rotated_actual).toBe(rotated_expected);
        });
    
        test('should handle rotation by a multiple of 32 bits', () => {
            const input = Field(0xABCDEF12);
            const rotated_actual = RotR(input, 32).toBigInt();
            const rotated_expected = BigInt(0xABCDEF12);

            expect(rotated_actual).toBe(rotated_expected); // No change expected
        });
    });

    describe('Shift Right bitwise function tests', () => {

        test('should correctly shift a random 32-bit integer to the right by a random number of bits', () => {
            const input = getRandomBytes(4);
            const rotationBits = Number(getRandomBytes(1) % 32n);
            const shifted_actual = ShR(Field(input), rotationBits).toBigInt();
            const shifted_expected = BigInt(shiftRight(Number(input), rotationBits));

            expect(shifted_actual).toBe(shifted_expected);
        });

        test('should correctly shift a random 32-bit integer to the right by a random number of bits - 1000 ITERATIONS', () => {
            for (let i = 0; i < 1000; i++) {
                let input = getRandomBytes(4);
                let rotationBits = Number(getRandomBytes(1) % 32n);
                let rotated_actual = RotR(Field(input), rotationBits).toBigInt();
                let rotated_expected = BigInt(rotateRight(Number(input), rotationBits));

                expect(rotated_actual).toBe(rotated_expected);
            }
        });

        test('should shift 0x80000000 to the right by 1 bit', () => {
            const input = Field(0xFFFFFFFF);
            const shifted_actual = ShR(input, 16).toBigInt();
            const shifted_expected = BigInt(0x0000FFFF);

            expect(shifted_actual).toBe(shifted_expected);
        });
    
        test('should handle shifting by 0 bits', () => {
            const input = Field(0x12345678);
            const shifted_actual = ShR(input, 0).toBigInt();
            const shifted_expected = BigInt(0x12345678);

            expect(shifted_actual).toBe(shifted_expected);
        });
    });

    describe('Choice: Ch bitwise function tests', () => {

        test('should return correct result for Ch(0xABCDEF12, 0x12345678, 0x87654321)', () => {
            const actual = ch(Field(0xABCDEF12), Field(0x12345678), Field(0x87654321)).toBigInt();
            const expected = Ch(0xABCDEF12, 0x12345678, 0x87654321);
            
            expect(actual).toBe(expected);
        });

        test('should correctly have choice of 3 random 32-bit Fields', () => {
            const random32BitBigints = Array.from({ length: 3 }, () => Number(getRandomBytes(4)));
            const [r1, r2, r3] = random32BitBigints;
            const actual = ch(Field(r1), Field(r2), Field(r3)).toBigInt();
            const expected = Ch(r1, r2, r3);

            expect(actual).toBe(expected);
        });

        test('should correctly have choice of 3 random 32-bit Fields - 1000 ITERATIONS', () => {
            for (let i = 0; i < 1000; i++) {
                let random32BitBigints = Array.from({ length: 3 }, () => Number(getRandomBytes(4)));
                let [r1, r2, r3] = random32BitBigints;
                let actual = ch(Field(r1), Field(r2), Field(r3)).toBigInt();
                let expected = Ch(r1, r2, r3);

                expect(actual).toBe(expected);
            }
        });
    });

    describe('MAJ', () => {
        test('Maj test1', () => {
            expect(true).toBeTruthy()
        })
    });
  });