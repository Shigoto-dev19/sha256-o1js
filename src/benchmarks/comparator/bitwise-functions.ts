import { Field, Gadgets, Bool, Provable, UInt32 } from 'o1js';
import { TWO32 } from '../../constants.js';

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
};

/**
 * Performs a bitwise rotation to the right on a 32-bit field element.
 *
 * This function is inspired by the sha256 circuit from circomlib and is designed to replace
 * the native o1js function (Gadgets.rotate(x, r, 'right')). It specifically operates on
 * hardcoded 32-bit field elements.
 *
 * @param {UInt32} input - The 32-bit word to be rotated.
 * @param {number} r - The number of positions to rotate the bits to the right.
 * @returns {UInt32} A new 32-bit field element representing the result of the right rotation.
 *
 * @throws {Error} If the resulting field element exceeds the range of 2^32.
 *
 * @example
 * const input = UInt32.from(...); // Initialize with a 32-bit field element
 * const rotatedResult = rotateRight(input, 4); // Performs a right rotation by 4 positions.
 */
function rotateRight(input: UInt32, r: number): UInt32 {
  const inputBinary = input.value.toBits(32);
  const outBinary: Bool[] = [];

  for (let i = 0; i < 32; i++) {
    outBinary.push(inputBinary[(i + r) % 32]);
  }

  const output = Field.fromBits(outBinary);

  return UInt32.from(output);
}

/**
 * Performs a bitwise shift to the right on a 32-bit field element.
 *
 * This function is inspired by the sha256 circuit from circomlib and is designed to replace
 * the native o1js function (Gadgets.rightShift(x, r)). It specifically operates on
 * hardcoded 32-bit field elements.
 *
 * @param {UInt32} input - The 32-bit field element to be shifted.
 * @param {number} r - The number of positions to shift the bits to the right.
 * @returns {UInt32} A new 32-bit field element representing the result of the right shift.
 *
 * @example
 * const input = UInt32.from(...); // Initialize with a 32-bit field element
 * const shiftedResult = shiftRight(input, 4); // Performs a right shift by 4 positions.
 */
function shiftRight(input: UInt32, r: number): UInt32 {
  const inputBinary = input.value.toBits(32);
  const outBinary: Bool[] = [];

  for (let i = 0; i < 32; i++) {
    if (i + r >= 32) {
      outBinary.push(Bool(false));
    } else {
      outBinary.push(inputBinary[i + r]);
    }
  }

  return UInt32.from(Field.fromBits(outBinary));
}

/**
 * Performs the choice bitwise operation on three 32-bit field elements.
 *
 * The choice bitwise operation is defined as: ch(x, y, z) = (x AND y) XOR (-x AND z).
 *
 * @param {UInt32} x - The first 32-bit field element.
 * @param {UInt32} y - The second 32-bit field element.
 * @param {UInt32} z - The third 32-bit field element.
 * @returns {UInt32} A new 32-bit field element representing the result of the ch operation.
 *
 * @example
 * const x = UInt32.from(...); // Initialize with a 32-bit field element
 * const y = UInt32.from(...); // Initialize with a 32-bit field element
 * const z = UInt32.from(...); // Initialize with a 32-bit field element
 * const chResult = ch(x, y, z); // Performs the ch operation.
 */
function ch(x: UInt32, y: UInt32, z: UInt32): UInt32 {
  const a = x.value.toBits(32).map((bit) => bit.toField());
  const b = y.value.toBits(32).map((bit) => bit.toField());
  const c = z.value.toBits(32).map((bit) => bit.toField());
  let out: Field[] = [];

  // out = a&b ^ (!a)&c => out = a*(b-c) + c
  for (let k = 0; k < 32; k++) {
    out[k] = a[k].mul(b[k].sub(c[k])).add(c[k]);
  }

  return UInt32.from(Field.fromBits(out.map((bit) => bit.toBits(1)[0])));
}

/**
 * Performs the majority bitwise operation on three 32-bit field elements.
 *
 * The maj operation is defined as: maj(x, y, z) = (x AND y) XOR (x AND z) XOR (y AND z).
 *
 * @param {UInt32} x - The first 32-bit field element.
 * @param {UInt32} y - The second 32-bit field element.
 * @param {UInt32} z - The third 32-bit field element.
 * @returns {UInt32} A new 32-bit field element representing the result of the Maj operation.
 *
 * @example
 * const x = UInt32.from(...); // Initialize with a 32-bit field element
 * const y = UInt32.from(...); // Initialize with a 32-bit field element
 * const z = UInt32.from(...); // Initialize with a 32-bit field element
 * const majResult = maj(x, y, z); // Performs the Maj operation.
 */
function maj(x: UInt32, y: UInt32, z: UInt32): UInt32 {
  /*
    out = a&b ^ a&c ^ b&c  
    out = a*b   +  a*c  +  b*c  -  2*a*b*c  
    out = a*( b + c - 2*b*c ) + b*c 
    mid = b*c
    out = a*( b + c - 2*mid ) + mid
     */
  const a = x.value.toBits(32).map((bit) => bit.toField());
  const b = y.value.toBits(32).map((bit) => bit.toField());
  const c = z.value.toBits(32).map((bit) => bit.toField());
  let mid: Field[] = [];
  let out: Field[] = [];
  for (let k = 0; k < 32; k++) {
    mid[k] = b[k].mul(c[k]);
    out[k] = a[k].mul(b[k].add(c[k]).sub(mid[k].mul(2))).add(mid[k]);
  }

  return UInt32.from(Field.fromBits(out.map((bit) => bit.toBits(1)[0])));
}

/**
 * Calculates the uppercase Σ0 bitwise function according to the SHA-256 standards.
 *
 * The Σ0 function is defined as: Σ0(x) = ROTR(2, x) XOR ROTR(13, x) XOR ROTR(22, x).
 *
 * @param {UInt32} x - The 32-bit field element to be processed by the Sigma-0 function.
 * @returns {UInt32} A new 32-bit field element representing the result of the Sigma-0 function.
 *
 * @example
 * const x = UInt32.from(...); // Initialize with a 32-bit field element
 * const Σ0Result = SIGMA0(x); // Calculates the Sigma-0 function.
 */
function SIGMA0(x: UInt32): UInt32 {
  const rotr2 = rotateRight(x, 2);
  const rotr13 = rotateRight(x, 13);
  const rotr22 = rotateRight(x, 22);

  const output = Gadgets.xor(
    Gadgets.xor(rotr2.value, rotr13.value, 32),
    rotr22.value,
    32
  );

  return UInt32.from(output);
}

/**
 * Calculates the uppercase Σ1 bitwise function according to the SHA-256 standards.
 *
 * The Σ1 function is defined as: Σ1(x) = ROTR(6, x) XOR ROTR(11, x) XOR ROTR(25, x).
 *
 * @param {UInt32} x - The 32-bit field element to be processed by the Σ1 function.
 * @returns {UInt32} A new 32-bit field element representing the result of the Σ1 function.
 *
 * @example
 * const x = UInt32.from(...); // Initialize with a 32-bit field element
 * const Σ1Result = SIGMA1(x); // Calculates the Σ1 function.
 */
function SIGMA1(x: UInt32): UInt32 {
  const rotr6 = rotateRight(x, 6);
  const rotr11 = rotateRight(x, 11);
  const rotr25 = rotateRight(x, 25);

  const output = Gadgets.xor(
    Gadgets.xor(rotr6.value, rotr11.value, 32),
    rotr25.value,
    32
  );

  return UInt32.from(output);
}

/**
 * Calculates the lowercase σ0 bitwise function according to the SHA-256 standards.
 *
 * The σ0 function is defined as: σ0(x) = ROTR(7, x) XOR ROTR(18, x) XOR (x>>>3).
 *
 * @param {UInt32} x - The 32-bit field element to be processed by the σ0 function.
 * @returns {UInt32} A new 32-bit field element representing the result of the σ0 function.
 *
 * @example
 * const x = UInt32.from(...); // Initialize with a 32-bit field element
 * const σ0Result = sigma0(x); // Calculates the σ0 function.
 */
function sigma0(x: UInt32): UInt32 {
  const rotr7 = rotateRight(x, 7);
  const rotr18 = rotateRight(x, 18);
  const shr3 = shiftRight(x, 3);

  const rotr7x18 = Gadgets.xor(rotr7.value, rotr18.value, 32);

  const output = Gadgets.xor(rotr7x18, shr3.value, 32);
  return UInt32.from(output);
}

/**
 * Calculates the lowercase σ1 bitwise function according to the SHA-256 standards.
 *
 * The σ1 function is defined as: σ1(x) = ROTR(17, x) XOR ROTR(19, x) XOR (x>>>10).
 *
 * @param {UInt32} x - The 32-bit field element to be processed by the σ1 function.
 * @returns {UInt32} A new 32-bit field element representing the result of the σ1 function.
 *
 * @example
 * const x = UInt32.from(...); // Initialize with a 32-bit field element
 * const sigma1Result = sigma1(x); // Calculates the σ1 function.
 */
function sigma1(x: UInt32): UInt32 {
  const rotr17 = rotateRight(x, 17);
  const rotr19 = rotateRight(x, 19);
  const shr10 = shiftRight(x, 10);

  const output = Gadgets.xor(
    Gadgets.xor(rotr17.value, rotr19.value, 32),
    shr10.value,
    32
  );
  return UInt32.from(output);
}

function bitwiseAddition2Mod32(a: UInt32, b: UInt32): UInt32 {
  let sum = a.value.add(b.value);
  const out = Provable.witness(Field, () => {
    return Field(sum.toBigInt() % TWO32.toBigInt());
  });
  out.assertLessThan(TWO32);

  return UInt32.from(out);
}

/**
 * Performs bitwise addition modulo 2^32 on multiple 32-bit field elements.
 *
 * This function iteratively adds multiple field elements using the bitwiseAddition2Mod32 function.
 *
 * @param {...UInt32} args - The 32-bit field elements to be added.
 * @returns {UInt32} A new 32-bit field element representing the result of the bitwise addition modulo 2^32.
 *
 * @example
 * const a = UInt32.from(...); // Initialize with a 32-bit field element
 * const b = UInt32.from(...); // Initialize with another 32-bit field element
 * const c = UInt32.from(...); // Initialize with yet another 32-bit field element
 * const result = bitwiseAdditionMod32(a, b, c); // Performs bitwise addition modulo 2^32.
 */
function addMod32(...args: UInt32[]): UInt32 {
  let sum = UInt32.from(0);
  for (const val of args) sum = bitwiseAddition2Mod32(sum, val);

  return sum;
}
