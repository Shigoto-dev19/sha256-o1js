import { Field, Gadgets, Bool } from 'o1js';
const TWO32 = new Field(2n ** 32n);

/// A binary rotation right function inspired from the sha256 circuit from circomlib
/// This function replaces the native o1js function (Gadgets.rotate(x, r, 'right')) regarding that it only operates on hardcoded 64-bit field elements
function RotR(input: Field, r: number): Field {
  const input_binary = input.toBits(32);
  const out_binary: Bool[] = [];

  for (let i = 0; i < 32; i++) {
    out_binary.push(input_binary[(i + r) % 32]);
  }

  const out_field = Field.fromBits(out_binary);
  out_field.assertLessThanOrEqual(2n ** 32n);

  return out_field;
}

/// A binary shift right function inspired from the sha256 circuit from circomlib
/// This function replaces the native o1js function (Gadgets.rightShift(x, r)) regarding that it only operates on hardcoded 64-bit field elements
function ShR(x: Field, r: number): Field {
  const x_binary = x.toBits(32);
  const out_binary: Bool[] = [];

  for (let i = 0; i < 32; i++) {
    if (i + r >= 32) {
      out_binary.push(Bool(false));
    } else {
      out_binary.push(x_binary[i + r]);
    }
  }

  return Field.fromBits(out_binary);
}

/// choice: Ch(x, y, z) = (x AND y) XOR (-x AND z)
function ch(x: Field, y: Field, z: Field): Field {
  const xy = Gadgets.and(x, y, 32);
  const _xz = Gadgets.and(Gadgets.not(x, 32), z, 32);

  return Gadgets.xor(xy, _xz, 32);
}

/// majority: Maj(x, y, z) = (x AND y) XOR (x AND z) XOR (y AND z)
function maj(x: Field, y: Field, z: Field): Field {
  const xy = Gadgets.and(x, y, 32);
  const xz = Gadgets.and(x, z, 32);
  const yz = Gadgets.and(y, z, 32);

  return Gadgets.xor(Gadgets.xor(xy, xz, 32), yz, 32);
}

/// Uppercase sigma functions according to the SHA-256 standards
/// Σ0(x) = ROTR(2,  x) XOR ROTR(13, x) XOR ROTR(22, x)
function SIGMA0(x: Field) {
  const rotr2 = RotR(x, 2);
  const rotr13 = RotR(x, 13);
  const rotr22 = RotR(x, 22);

  return Gadgets.xor(Gadgets.xor(rotr2, rotr13, 32), rotr22, 32);
}

/// Σ1(x) = ROTR(6,  x) XOR ROTR(11, x) XOR ROTR(25, x)
function SIGMA1(x: Field) {
  const rotr6 = RotR(x, 6);
  const rotr11 = RotR(x, 11);
  const rotr25 = RotR(x, 25);

  return Gadgets.xor(Gadgets.xor(rotr6, rotr11, 32), rotr25, 32);
}

/// Lowercase sigma functions according to the SHA-256 standards
/// σ0(x) = ROTR(7,  x) XOR ROTR(18, x) XOR (x>>>3)
function sigma0(x: Field) {
  const rotr7 = RotR(x, 7);
  const rotr18 = RotR(x, 18);
  const shr3 = ShR(x, 3);

  const rotr7x18 = Gadgets.xor(rotr7, rotr18, 32);
  return Gadgets.xor(rotr7x18, shr3, 32);
}

/// σ1(x) = ROTR(17, x) XOR ROTR(19, x) XOR (x>>>10)
function sigma1(x: Field) {
  const rotr17 = RotR(x, 17);
  const rotr19 = RotR(x, 19);
  const shr10 = ShR(x, 10);
  return Gadgets.xor(Gadgets.xor(rotr17, rotr19, 32), shr10, 32);
}

function bitwiseAddition2Mod32(a: Field, b: Field): Field {
  let sum = a.add(b);

  // Check if the sum is greater than or equal to 2^32
  if (sum.toBigInt() >= TWO32.toBigInt()) {
    // Subtract 2^32 to handle overflow
    sum = sum.sub(TWO32);
  }
  sum.assertLessThan(TWO32);

  return sum;
}

function bitwiseAdditionMod32(...args: Field[]): Field {
  let sum = Field(0);

  // Add each argument using the bitwiseAdditionMod32 function
  for (const val of args) {
    sum = bitwiseAddition2Mod32(sum, val);
  }

  return sum;
}

export {
  RotR,
  ShR,
  ch,
  maj,
  SIGMA0,
  SIGMA1,
  sigma0,
  sigma1,
  bitwiseAdditionMod32,
};
