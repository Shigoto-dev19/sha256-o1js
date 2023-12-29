import {
  rotateRight,
  shiftRight,
  ch,
  maj,
  sigma0,
  sigma1,
  SIGMA0,
  SIGMA1,
  bitwiseAdditionMod32 as bitwiseAdditionMod32Field,
} from './functions';

import { Field } from 'o1js';
import {
  TWO32,
  generateRandomBytes,
  rotateRightNative,
  shiftRightNative,
} from './test-utils';

describe('Bitwise Operation Tests', () => {
  describe('Rotate Right bitwise function tests', () => {
    /**
     * Test the o1js compatible rotate right function against a verified rotateRight function in native JS.
     */
    const testRotateRight = (
      input = generateRandomBytes(),
      rotationBits = Number(generateRandomBytes(1) % 32n),
      specific = false,
      rotrExpected?: bigint
    ) => {
      const rotrActual = rotateRight(Field(input), rotationBits).toBigInt();
      if (specific) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(rotrActual).toBe(rotrExpected!);
      } else {
        rotrExpected = BigInt(rotateRightNative(Number(input), rotationBits));
        expect(rotrActual).toBe(rotrExpected);
      }
    };

    describe('Tests with random data', () => {
      test('should correctly rotate a random 32-bit integer to the right by a random number of bits', () => {
        testRotateRight();
      });

      test('should correctly rotate a random 32-bit integer to the right by a random number of bits - 1000 ITERATIONS', () => {
        for (let i = 0; i < 1000; i++) testRotateRight();
      });

      test('should handle rotation by 0 bits - 1000 ITERATIONS', () => {
        for (let i = 0; i < 1000; i++) {
          const input = generateRandomBytes();
          testRotateRight(input, 0, true, input);
        }
      });

      test('should handle rotation by a multiple of 32 bits - 1000 ITERATIONS', () => {
        for (let i = 0; i < 1000; i++) {
          const input = generateRandomBytes();
          testRotateRight(input, 32, true, input);
        }
      });
    });

    describe('Tests with specifc data against expected results', () => {
      test('should rotate 0x80000000 to the right by 1 bit', () => {
        const input = BigInt(0x80000000);
        const rotrExpected = BigInt(0x40000000);

        testRotateRight(input, 1, true, rotrExpected);
      });

      test('should rotate 0xFFFFFFFF (all bits set) to the right by 16 bits', () => {
        const input = BigInt(0xffffffff);
        const rotrExpected = BigInt(0xffffffff);

        testRotateRight(input, 16, true, rotrExpected);
      });

      test('should rotate 0xABCDEF12 to the right by 4 bits', () => {
        const input = BigInt(0xabcdef12);
        const rotrExpected = BigInt(0x2abcdef1);

        testRotateRight(input, 4, true, rotrExpected);
      });

      test('should rotate 1 to the right by 1 bit', () => {
        const input = BigInt(1);
        const rotrExpected = BigInt(0x80000000);

        testRotateRight(input, 1, true, rotrExpected);
      });

      test('should rotate 0xAAAAAAAA to the right by 2 bits', () => {
        const input = BigInt(0xaaaaaaaa);
        const rotrExpected = BigInt(0xaaaaaaaa);

        testRotateRight(input, 2, true, rotrExpected);
      });
    });
  });

  describe('Shift Right bitwise function tests', () => {
    /**
     * Test the o1js compatible shift right function against a verified shiftRight function in native JS.
     */
    const testShiftRight = (
      input = generateRandomBytes(),
      shiftBits = Number(generateRandomBytes(1) % 32n),
      specific = false,
      shrExpected?: bigint
    ) => {
      const shrActual = shiftRight(Field(input), shiftBits).toBigInt();
      if (specific) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(shrActual).toBe(shrExpected!);
      } else {
        shrExpected = shiftRightNative(Number(input), shiftBits);
        expect(shrActual).toBe(shrExpected);
      }
    };

    test('should correctly shift a random 32-bit integer to the right by a random number of bits', () => {
      testShiftRight();
    });

    test('should correctly shift a random 32-bit integer to the right by a random number of bits - 1000 ITERATIONS', () => {
      for (let i = 0; i < 1000; i++) testShiftRight();
    });

    test('should handle shifting by 0 bits - 1000 ITERATIONS', () => {
      for (let i = 0; i < 1000; i++) {
        let input = generateRandomBytes();
        testShiftRight(input, 0, true, input);
      }
    });

    test('should shift 0x80000000 to the right by 16 bit', () => {
      const input = BigInt(0xffffffff);
      const shrExpected = BigInt(0x0000ffff);

      testShiftRight(input, 16, true, shrExpected);
    });
  });

  describe('Choice: Ch bitwise function tests', () => {
    /**
     * Bitwise choice function in native JS
     */
    const choice = (x: number, y: number, z: number): bigint => {
      let out = BigInt((x & y) ^ (~x & z));
      if (out < 0n) out += TWO32;

      return out;
    };

    /**
     * Test the o1js compatible choice bitwise function against its verified version in native JS.
     */
    const testChoice = (inputs: [number, number, number]) => {
      const [in1, in2, in3] = inputs.map(Field);
      const actual = ch(in1, in2, in3).toBigInt();
      const expected = choice(...inputs);

      expect(actual).toBe(expected);
    };

    test('should return correct result for Ch(0xABCDEF12, 0x12345678, 0x87654321)', () => {
      testChoice([0xabcdef12, 0x12345678, 0x87654321]);
    });

    test('should correctly have choice of 3 random 32-bit Fields', () => {
      const random32BitInputs = Array.from({ length: 3 }, () =>
        Number(generateRandomBytes())
      ) as [number, number, number];
      testChoice(random32BitInputs);
    });

    test('should correctly have choice of 3 random 32-bit Fields - 1000 ITERATIONS', () => {
      for (let i = 0; i < 1000; i++) {
        let random32BitInputs = Array.from({ length: 3 }, () =>
          Number(generateRandomBytes())
        ) as [number, number, number];
        testChoice(random32BitInputs);
      }
    });
  });

  describe('Majority: Maj bitwise function tests', () => {
    /**
     * Bitwise majority function in native JS
     */
    const majority = (x: number, y: number, z: number): bigint => {
      let out = BigInt((x & y) ^ (x & z) ^ (y & z));
      if (out < 0n) out += TWO32;

      return out;
    };

    /**
     * Test the o1js compatible majority bitwise function against its verified version in native JS.
     */
    const testMajority = (inputs: [number, number, number]) => {
      const [in1, in2, in3] = inputs.map(Field);
      const actual = maj(in1, in2, in3).toBigInt();
      const expected = majority(...inputs);

      expect(actual).toBe(expected);
    };

    test('should correctly have majority of 3 random 32-bit Fields', () => {
      const random32BitInputs = Array.from({ length: 3 }, () =>
        Number(generateRandomBytes())
      ) as [number, number, number];
      testMajority(random32BitInputs);
    });

    test('should correctly have majority of 3 random 32-bit Fields - 1000 ITERATIONS', () => {
      for (let i = 0; i < 1000; i++) {
        let random32BitInputs = Array.from({ length: 3 }, () =>
          Number(generateRandomBytes())
        ) as [number, number, number];
        testMajority(random32BitInputs);
      }
    });
  });

  describe('σ0: small sigma0 SHA256 bitwise function tests', () => {
    const σ0 = (x: number): bigint => {
      return rotateRightNative(x, 7) ^ rotateRightNative(x, 18) ^ shiftRightNative(x, 3);
    };

    const testσ0 = (input: bigint) => {
      const actual = sigma0(Field(input)).toBigInt();
      const expected = σ0(Number(input));

      expect(actual).toBe(expected);
    };

    test('should correctly sigma0 of a random 32-bit Fields', () => {
      const random32BitInput = generateRandomBytes();
      testσ0(random32BitInput);
    });

    test('should correctly sigma0 of a random 32-bit Fields - 1000 ITERATIONS', () => {
      for (let i = 0; i < 1000; i++) {
        const random32BitInput = generateRandomBytes();
        testσ0(random32BitInput);
      }
    });
  });

  describe('σ1: small sigma1 SHA256 bitwise function tests', () => {
    const σ1 = (x: number): bigint => {
      return rotateRightNative(x, 17) ^ rotateRightNative(x, 19) ^ shiftRightNative(x, 10);
    };

    const testσ1 = (input: bigint) => {
      const actual = sigma1(Field(input)).toBigInt();
      const expected = σ1(Number(input));

      expect(actual).toBe(expected);
    };

    test('should correctly sigma1 of a random 32-bit Fields', () => {
      const random32BitInput = generateRandomBytes();
      testσ1(random32BitInput);
    });

    test('should correctly sigma1 of a random 32-bit Fields - 1000 ITERATIONS', () => {
      for (let i = 0; i < 1000; i++) {
        let random32BitInput = generateRandomBytes();
        testσ1(random32BitInput);
      }
    });
  });

  describe('Σ0: big SIGMA0 SHA256 bitwise function tests', () => {
    const Σ0 = (x: number): bigint => {
      return rotateRightNative(x, 2) ^ rotateRightNative(x, 13) ^ rotateRightNative(x, 22);
    };

    const testΣ0 = (input: bigint) => {
      const actual = SIGMA0(Field(input)).toBigInt();
      const expected = Σ0(Number(input));

      expect(actual).toBe(expected);
    };

    test('should correctly SIGMA0 of a random 32-bit Fields', () => {
      const random32BitInput = generateRandomBytes();
      testΣ0(random32BitInput);
    });

    test('should correctly SIGMA0 of a random 32-bit Fields - 1000 ITERATIONS', () => {
      for (let i = 0; i < 1000; i++) {
        const random32BitInput = generateRandomBytes();
        testΣ0(random32BitInput);
      }
    });
  });

  describe('Σ1: big SIGMA1 SHA256 bitwise function tests', () => {
    const Σ1 = (x: number): bigint => {
      return rotateRightNative(x, 6) ^ rotateRightNative(x, 11) ^ rotateRightNative(x, 25);
    };

    const testΣ1 = (input: bigint) => {
      const actual = SIGMA1(Field(input)).toBigInt();
      const expected = Σ1(Number(input));

      expect(actual).toBe(expected);
    };

    test('should correctly SIGMA1 of a random 32-bit Fields', () => {
      const random32BitInput = generateRandomBytes();
      testΣ1(random32BitInput);
    });

    test('should correctly SIGMA1 of a random 32-bit Fields - 1000 ITERATIONS', () => {
      for (let i = 0; i < 1000; i++) {
        let random32BitInput = generateRandomBytes();
        testΣ1(random32BitInput);
      }
    });
  });

  describe('bitwiseAdditionMod32 SHA256 function tests', () => {
    const additionMod32 = (...args: number[]): bigint => {
      const out = args.reduce((result, value) => (result + value) | 0, 0);
      let outBig = BigInt(out);
      if (outBig < 0n) outBig += TWO32;

      return outBig;
    };

    const testAdditionMod32 = (inputs: number[]) => {
      const actual = bitwiseAdditionMod32Field(...inputs.map(Field)).toBigInt();
      const expected = additionMod32(...inputs);

      expect(actual).toBe(expected);
    };

    test('should correctly do addition mod 32 for 2 random 32-bit Fields', () => {
      const random32BitInputs = Array.from({ length: 2 }, () =>
        Number(generateRandomBytes())
      );
      testAdditionMod32(random32BitInputs);
    });

    test('should correctly do addition mod 32 for 2 random 32-bit Fields - 1000 ITERATIONS', () => {
      for (let i = 0; i < 1000; i++) {
        let random32BitInputs = Array.from({ length: 2 }, () =>
          Number(generateRandomBytes())
        );
        testAdditionMod32(random32BitInputs);
      }
    });

    test('should correctly do addition mod 32 for 3 random 32-bit Fields', () => {
      const random32BitInputs = Array.from({ length: 3 }, () =>
        Number(generateRandomBytes())
      );
      testAdditionMod32(random32BitInputs);
    });

    test('should correctly do addition mod 32 for 3 random 32-bit Fields - 1000 ITERATIONS', () => {
      for (let i = 0; i < 1000; i++) {
        let random32BitInputs = Array.from({ length: 3 }, () =>
          Number(generateRandomBytes())
        );
        testAdditionMod32(random32BitInputs);
      }
    });
  });
});
