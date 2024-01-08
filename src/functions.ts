import { Field, Gadgets, Bool, Provable } from 'o1js';

const TWO32 = new Field(2n ** 32n);

/**
 * Performs a bitwise rotation to the right on a 32-bit field element.
 *
 * This function is inspired by the sha256 circuit from circomlib and is designed to replace
 * the native o1js function (Gadgets.rotate(x, r, 'right')). It specifically operates on
 * hardcoded 32-bit field elements.
 *
 * @param {Field} input - The 32-bit field element to be rotated.
 * @param {number} r - The number of positions to rotate the bits to the right.
 * @returns {Field} A new 32-bit field element representing the result of the right rotation.
 *
 * @throws {Error} If the resulting field element exceeds the range of 2^32.
 *
 * @example
 * const inputField = Field(...); // Initialize with a 32-bit field element
 * const rotatedResult = rotateRight(inputField, 4); // Performs a right rotation by 4 positions.
 */
function rotateRight(input: Field, r: number): Field {
  const inputBinary = input.toBits(32);
  const outBinary: Bool[] = [];

  for (let i = 0; i < 32; i++) {
    outBinary.push(inputBinary[(i + r) % 32]);
  }

  const outField = Field.fromBits(outBinary);
  outField.assertLessThanOrEqual(2n ** 32n);

  return outField;
}

/**
 * Performs a bitwise shift to the right on a 32-bit field element.
 *
 * This function is inspired by the sha256 circuit from circomlib and is designed to replace
 * the native o1js function (Gadgets.rightShift(x, r)). It specifically operates on
 * hardcoded 32-bit field elements.
 *
 * @param {Field} input - The 32-bit field element to be shifted.
 * @param {number} r - The number of positions to shift the bits to the right.
 * @returns {Field} A new 32-bit field element representing the result of the right shift.
 *
 * @example
 * const inputField = Field(...); // Initialize with a 32-bit field element
 * const shiftedResult = shiftRight(inputField, 4); // Performs a right shift by 4 positions.
 */
function shiftRight(input: Field, r: number): Field {
  const inputBinary = input.toBits(32);
  const outBinary: Bool[] = [];

  for (let i = 0; i < 32; i++) {
    if (i + r >= 32) {
      outBinary.push(Bool(false));
    } else {
      outBinary.push(inputBinary[i + r]);
    }
  }

  return Field.fromBits(outBinary);
}

/**
 * Performs the choice bitwise operation on three 32-bit field elements.
 *
 * The choice bitwise operation is defined as: ch(x, y, z) = (x AND y) XOR (-x AND z).
 *
 * @param {Field} x - The first 32-bit field element.
 * @param {Field} y - The second 32-bit field element.
 * @param {Field} z - The third 32-bit field element.
 * @returns {Field} A new 32-bit field element representing the result of the ch operation.
 *
 * @example
 * const xField = Field(...); // Initialize with a 32-bit field element
 * const yField = Field(...); // Initialize with a 32-bit field element
 * const zField = Field(...); // Initialize with a 32-bit field element
 * const chResult = ch(xField, yField, zField); // Performs the ch operation.
 */
function ch(x: Field, y: Field, z: Field): Field {
  const xy = Gadgets.and(x, y, 32);
  const _xz = Gadgets.and(Gadgets.not(x, 32), z, 32);

  return Gadgets.xor(xy, _xz, 32);
}

/**
 * Performs the majority bitwise operation on three 32-bit field elements.
 *
 * The maj operation is defined as: maj(x, y, z) = (x AND y) XOR (x AND z) XOR (y AND z).
 *
 * @param {Field} x - The first 32-bit field element.
 * @param {Field} y - The second 32-bit field element.
 * @param {Field} z - The third 32-bit field element.
 * @returns {Field} A new 32-bit field element representing the result of the Maj operation.
 *
 * @example
 * const xField = Field(...); // Initialize with a 32-bit field element
 * const yField = Field(...); // Initialize with a 32-bit field element
 * const zField = Field(...); // Initialize with a 32-bit field element
 * const majResult = maj(xField, yField, zField); // Performs the Maj operation.
 */
function maj(x: Field, y: Field, z: Field): Field {
  const xy = Gadgets.and(x, y, 32);
  const xz = Gadgets.and(x, z, 32);
  const yz = Gadgets.and(y, z, 32);

  return Gadgets.xor(Gadgets.xor(xy, xz, 32), yz, 32);
}

/**
 * Calculates the uppercase Σ0 bitwise function according to the SHA-256 standards.
 *
 * The Σ0 function is defined as: Σ0(x) = ROTR(2, x) XOR ROTR(13, x) XOR ROTR(22, x).
 *
 * @param {Field} x - The 32-bit field element to be processed by the Sigma-0 function.
 * @returns {Field} A new 32-bit field element representing the result of the Sigma-0 function.
 *
 * @example
 * const xField = Field(...); // Initialize with a 32-bit field element
 * const Σ0Result = SIGMA0(xField); // Calculates the Sigma-0 function.
 */
function SIGMA0(x: Field) {
  const rotr2 = rotateRight(x, 2);
  const rotr13 = rotateRight(x, 13);
  const rotr22 = rotateRight(x, 22);

  return Gadgets.xor(Gadgets.xor(rotr2, rotr13, 32), rotr22, 32);
}

/**
 * Calculates the uppercase Σ1 bitwise function according to the SHA-256 standards.
 *
 * The Σ1 function is defined as: Σ1(x) = ROTR(6, x) XOR ROTR(11, x) XOR ROTR(25, x).
 *
 * @param {Field} x - The 32-bit field element to be processed by the Σ1 function.
 * @returns {Field} A new 32-bit field element representing the result of the Σ1 function.
 *
 * @example
 * const xField = Field(...); // Initialize with a 32-bit field element
 * const Σ1Result = SIGMA1(xField); // Calculates the Σ1 function.
 */
function SIGMA1(x: Field) {
  const rotr6 = rotateRight(x, 6);
  const rotr11 = rotateRight(x, 11);
  const rotr25 = rotateRight(x, 25);

  return Gadgets.xor(Gadgets.xor(rotr6, rotr11, 32), rotr25, 32);
}

/**
 * Calculates the lowercase σ0 bitwise function according to the SHA-256 standards.
 *
 * The σ0 function is defined as: σ0(x) = ROTR(7, x) XOR ROTR(18, x) XOR (x>>>3).
 *
 * @param {Field} x - The 32-bit field element to be processed by the σ0 function.
 * @returns {Field} A new 32-bit field element representing the result of the σ0 function.
 *
 * @example
 * const xField = Field(...); // Initialize with a 32-bit field element
 * const σ0Result = sigma0(xField); // Calculates the σ0 function.
 */
function sigma0(x: Field) {
  const rotr7 = rotateRight(x, 7);
  const rotr18 = rotateRight(x, 18);
  const shr3 = shiftRight(x, 3);

  const rotr7x18 = Gadgets.xor(rotr7, rotr18, 32);

  return Gadgets.xor(rotr7x18, shr3, 32);
}

/**
 * Calculates the lowercase σ1 bitwise function according to the SHA-256 standards.
 *
 * The σ1 function is defined as: σ1(x) = ROTR(17, x) XOR ROTR(19, x) XOR (x>>>10).
 *
 * @param {Field} x - The 32-bit field element to be processed by the σ1 function.
 * @returns {Field} A new 32-bit field element representing the result of the σ1 function.
 *
 * @example
 * const xField = Field(...); // Initialize with a 32-bit field element
 * const sigma1Result = sigma1(xField); // Calculates the σ1 function.
 */
function sigma1(x: Field) {
  const rotr17 = rotateRight(x, 17);
  const rotr19 = rotateRight(x, 19);
  const shr10 = shiftRight(x, 10);

  return Gadgets.xor(Gadgets.xor(rotr17, rotr19, 32), shr10, 32);
}

function bitwiseAddition2Mod32(a: Field, b: Field): Field {
  let sum = a.add(b);
  const out = Provable.witness(Field, () => {
    return Field(sum.toBigInt() % TWO32.toBigInt());
  });
  out.assertLessThan(TWO32);
  return out;
}

/**
 * Performs bitwise addition modulo 2^32 on multiple 32-bit field elements.
 *
 * This function iteratively adds multiple field elements using the bitwiseAddition2Mod32 function.
 *
 * @param {...Field} args - The 32-bit field elements to be added.
 * @returns {Field} A new 32-bit field element representing the result of the bitwise addition modulo 2^32.
 *
 * @example
 * const aField = Field(...); // Initialize with a 32-bit field element
 * const bField = Field(...); // Initialize with another 32-bit field element
 * const cField = Field(...); // Initialize with yet another 32-bit field element
 * const result = bitwiseAdditionMod32(aField, bField, cField); // Performs bitwise addition modulo 2^32.
 */
function addMod32(...args: Field[]): Field {
  let sum = Field(0);
  for (const val of args) sum = bitwiseAddition2Mod32(sum, val);

  return sum;
}

const o1jsBitwise = {
  shift32: (field: Field, bits: number) => {
    let { remainder: shifted } = Gadgets.divMod32(
      field.mul(1n >> BigInt(bits))
    );
    return shifted;
  },
  SIGMA0: (x: Field) => {
    const rotr2 = Gadgets.rotate32(x, 2, 'right');
    const rotr13 = Gadgets.rotate32(x, 13, 'right');
    const rotr22 = Gadgets.rotate32(x, 22, 'right');

    return Gadgets.xor(Gadgets.xor(rotr2, rotr13, 32), rotr22, 32);
  },
  SIGMA1: (x: Field) => {
    const rotr6 = Gadgets.rotate32(x, 6, 'right');
    const rotr11 = Gadgets.rotate32(x, 11, 'right');
    const rotr25 = Gadgets.rotate32(x, 25, 'right');

    return Gadgets.xor(Gadgets.xor(rotr6, rotr11, 32), rotr25, 32);
  },
  sigma0: (x: Field) => {
    const rotr7 = Gadgets.rotate32(x, 7, 'right');
    const rotr18 = Gadgets.rotate32(x, 18, 'right');
    const shr3 = o1jsBitwise.shift32(x, 3);

    const rotr7x18 = Gadgets.xor(rotr7, rotr18, 32);

    return Gadgets.xor(rotr7x18, shr3, 32);
  },
  sigma1: (x: Field) => {
    const rotr17 = Gadgets.rotate32(x, 17, 'right');
    const rotr19 = Gadgets.rotate32(x, 19, 'right');
    const shr10 = o1jsBitwise.shift32(x, 10);

    return Gadgets.xor(Gadgets.xor(rotr17, rotr19, 32), shr10, 32);
  },
  addMod32: (...args: Field[]): Field => {
    let sum = Field(0);
    for (const val of args) sum = Gadgets.addMod32(sum, val);

    return sum;
  },
  prepareMessageSchedule(bits32Words: Field[]): Field[] {
    const W = [...bits32Words];

    for (let t = 16; t <= 63; t++) {
      W[t] = o1jsBitwise.addMod32(
        o1jsBitwise.sigma1(W[t - 2]),
        W[t - 7],
        o1jsBitwise.sigma0(W[t - 15]),
        W[t - 16]
      );
    }

    return W;
  },
};

export {
  rotateRight,
  shiftRight,
  ch,
  maj,
  SIGMA0,
  SIGMA1,
  sigma0,
  sigma1,
  addMod32,
  o1jsBitwise,
};
