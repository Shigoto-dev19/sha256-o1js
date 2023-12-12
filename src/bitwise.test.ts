import { RotR, ShR, ch, maj, sigma0, sigma1, SIGMA0, SIGMA1} from './functions';
import { bitwiseAdditionMod32 as bitwiseAdditionMod32Field } from './preprocessing';
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

function Maj(x: number, y: number, z: number): bigint { 
    const out = (x & y) ^ (x & z) ^ (y & z);
    let outBig = BigInt(out);
    if (outBig < 0n) outBig += TWO32;

    return outBig
} 

function σ0(x: number): bigint { 
    return rotateRight(x, 7,) ^ rotateRight(x, 18) ^ shiftRight(x, 3);  
}

function σ1(x: number): bigint { 
    return rotateRight(x, 17) ^ rotateRight(x, 19) ^ shiftRight(x, 10); 
}

function Σ0(x: number): bigint { 
    const out = rotateRight(x, 2) ^ rotateRight(x, 13) ^ rotateRight(x, 22);
    return out
}

function Σ1(x: number): bigint { 
    return rotateRight(x, 6) ^ rotateRight(x, 11) ^ rotateRight(x, 25); 
}

function getRandomBytes(byteNumber: number): bigint {
    // Generate 4 random bytes
    const randomBytes = crypto.randomBytes(byteNumber);
    return BigInt("0x" + randomBytes.toString("hex"));
}

function additionMod32(...args: number[]): bigint {
    const out = args.reduce((result, value) => (result + value) | 0, 0);
    let outBig = BigInt(out);
    if (outBig < 0n) outBig += TWO32;

    return outBig
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

    describe('Majority: Maj bitwise function tests', () => {

        test('should correctly have majority of 3 random 32-bit Fields', () => {
            const random32BitBigints = Array.from({ length: 3 }, () => Number(getRandomBytes(4)));
            const [r1, r2, r3] = random32BitBigints;
            const actual = maj(Field(r1), Field(r2), Field(r3)).toBigInt();
            const expected = Maj(r1, r2, r3);

            expect(actual).toBe(expected);
        });

        test('should correctly have majority of 3 random 32-bit Fields - 1000 ITERATIONS', () => {
            for (let i = 0; i < 1000; i++) {
                let random32BitBigints = Array.from({ length: 3 }, () => Number(getRandomBytes(4)));
                let [r1, r2, r3] = random32BitBigints;
                let actual = maj(Field(r1), Field(r2), Field(r3)).toBigInt();
                let expected = Maj(r1, r2, r3);

                expect(actual).toBe(expected);
            }
        });
    });

    describe('σ0: small sigma0 SHA256 bitwise function tests', () => {

        test('should correctly sigma0 of a random 32-bit Fields', () => {
            const random32BitNumber = Number(getRandomBytes(4));
            const actual = sigma0(Field(random32BitNumber)).toBigInt();
            const expected = BigInt(σ0(random32BitNumber));

            expect(actual).toBe(expected);
        });

        test('should correctly sigma0 of a random 32-bit Fields - 1000 ITERATIONS', () => {
            for (let i = 0; i < 1000; i++) {
                let random32BitNumber = Number(getRandomBytes(4));
                let actual = sigma0(Field(random32BitNumber)).toBigInt();
                let expected = BigInt(σ0(random32BitNumber));

                expect(actual).toBe(expected);
            }
        });
    });

    describe('σ1: small sigma1 SHA256 bitwise function tests', () => {

        test('should correctly sigma1 of a random 32-bit Fields', () => {
            const random32BitNumber = Number(getRandomBytes(4));
            const actual = sigma1(Field(random32BitNumber)).toBigInt();
            const expected = BigInt(σ1(random32BitNumber));

            expect(actual).toBe(expected);
        });

        test('should correctly sigma1 of a random 32-bit Fields - 1000 ITERATIONS', () => {
            for (let i = 0; i < 1000; i++) {
                let random32BitNumber = Number(getRandomBytes(4));
                let actual = sigma1(Field(random32BitNumber)).toBigInt();
                let expected = BigInt(σ1(random32BitNumber));

                expect(actual).toBe(expected);
            }
        });
    });

    describe('Σ0: big SIGMA0 SHA256 bitwise function tests', () => {

        test('should correctly SIGMA0 of a random 32-bit Fields', () => {
            const random32BitNumber = Number(getRandomBytes(4));
            const actual = SIGMA0(Field(random32BitNumber)).toBigInt();
            const expected = BigInt(Σ0(random32BitNumber));

            expect(actual).toBe(expected);
        });

        test('should correctly SIGMA0 of a random 32-bit Fields - 1000 ITERATIONS', () => {
            for (let i = 0; i < 1000; i++) {
                let random32BitNumber = Number(getRandomBytes(4));
                let actual = SIGMA0(Field(random32BitNumber)).toBigInt();
                let expected = BigInt(Σ0(random32BitNumber));

                expect(actual).toBe(expected);
            }
        });
    });

    describe('Σ1: big SIGMA1 SHA256 bitwise function tests', () => {

        test('should correctly SIGMA1 of a random 32-bit Fields', () => {
            const random32BitNumber = Number(getRandomBytes(4));
            const actual = SIGMA1(Field(random32BitNumber)).toBigInt();
            const expected = BigInt(Σ1(random32BitNumber));

            expect(actual).toBe(expected);
        });

        test('should correctly SIGMA1 of a random 32-bit Fields - 1000 ITERATIONS', () => {
            for (let i = 0; i < 1000; i++) {
                let random32BitNumber = Number(getRandomBytes(4));
                let actual = SIGMA1(Field(random32BitNumber)).toBigInt();
                let expected = BigInt(Σ1(random32BitNumber));

                expect(actual).toBe(expected);
            }
        });
    });

    describe('additionMod32 function for SHA-256', () => {

        test('should correctly do addition mod 32 for 2 random 32-bit Fields', () => {
            const random32BitBigints = Array.from({ length: 2 }, () => Number(getRandomBytes(4)));
            const [r1, r2] = random32BitBigints;
            const actual = bitwiseAdditionMod32Field(Field(r1), Field(r2)).toBigInt();
            const expected = additionMod32(r1, r2);

            expect(actual).toBe(expected);
        });

        test('should correctly do addition mod 32 for 2 random 32-bit Fields - 1000 ITERATIONS', () => {
            for (let i = 0; i < 1000; i++) {
                let random32BitBigints = Array.from({ length: 2 }, () => Number(getRandomBytes(4)));
                let [r1, r2] = random32BitBigints;
                let actual = bitwiseAdditionMod32Field(Field(r1), Field(r2)).toBigInt();
                let expected = additionMod32(r1, r2);

                expect(actual).toBe(expected);
            }
        });

        test('should correctly do addition mod 32 for 3 random 32-bit Fields', () => {
            const random32BitBigints = Array.from({ length: 3 }, () => Number(getRandomBytes(4)));
            const [r1, r2, r3] = random32BitBigints;
            const actual = bitwiseAdditionMod32Field(Field(r1), Field(r2), Field(r3)).toBigInt();
            const expected = additionMod32(r1, r2, r3);

            expect(actual).toBe(expected);
        });

        test('should correctly do addition mod 32 for 3 random 32-bit Fields - 1000 ITERATIONS', () => {
            for (let i = 0; i < 1000; i++) {
                let random32BitBigints = Array.from({ length: 3 }, () => Number(getRandomBytes(4)));
                let [r1, r2, r3] = random32BitBigints;
                let actual = bitwiseAdditionMod32Field(Field(r1), Field(r2), Field(r3)).toBigInt();
                let expected = additionMod32(r1, r2, r3);

                expect(actual).toBe(expected);
            }
        });    
    });

});