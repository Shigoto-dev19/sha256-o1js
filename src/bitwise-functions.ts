import { Field, Gadgets } from 'o1js';

export {
  shiftRight32,
  rotateRight32,
  ch,
  maj,
  SIGMA0,
  SIGMA1,
  sigma0,
  sigma1,
  addMod32,
  prepareMessageSchedule,
};

function rotateRight32(field: Field, bits: number) {
  return Gadgets.rotate32(field, bits, 'right');
}

function shiftRight32(field: Field, bits: number) {
  let { remainder: shifted } = Gadgets.divMod32(
    Gadgets.rotate64(field, bits, 'right')
  );
  return shifted;
}

function ch(x: Field, y: Field, z: Field): Field {
  const xy = Gadgets.and(x, y, 32);
  const _xz = Gadgets.and(Gadgets.not(x, 32), z, 32);

  return Gadgets.xor(xy, _xz, 32);
}

function maj(x: Field, y: Field, z: Field): Field {
  const xy = Gadgets.and(x, y, 32);
  const xz = Gadgets.and(x, z, 32);
  const yz = Gadgets.and(y, z, 32);

  return Gadgets.xor(Gadgets.xor(xy, xz, 32), yz, 32);
}

function SIGMA0(x: Field) {
  const rotr2 = rotateRight32(x, 2);
  const rotr13 = rotateRight32(x, 13);
  const rotr22 = rotateRight32(x, 22);

  return Gadgets.xor(Gadgets.xor(rotr2, rotr13, 32), rotr22, 32);
}

function SIGMA1(x: Field) {
  const rotr6 = rotateRight32(x, 6);
  const rotr11 = rotateRight32(x, 11);
  const rotr25 = rotateRight32(x, 25);

  return Gadgets.xor(Gadgets.xor(rotr6, rotr11, 32), rotr25, 32);
}

function sigma0(x: Field) {
  const rotr7 = rotateRight32(x, 7);
  const rotr18 = rotateRight32(x, 18);
  const shr3 = shiftRight32(x, 3);

  const rotr7x18 = Gadgets.xor(rotr7, rotr18, 32);

  return Gadgets.xor(rotr7x18, shr3, 32);
}

function sigma1(x: Field) {
  const rotr17 = rotateRight32(x, 17);
  const rotr19 = rotateRight32(x, 19);
  const shr10 = shiftRight32(x, 10);

  return Gadgets.xor(Gadgets.xor(rotr17, rotr19, 32), shr10, 32);
}

function addMod32(...args: Field[]): Field {
  let sum = Field(0);
  for (const val of args) sum = Gadgets.addMod32(sum, val);

  return sum;
}

function prepareMessageSchedule(bits32Words: Field[]): Field[] {
  const W = [...bits32Words];

  for (let t = 16; t <= 63; t++) {
    W[t] = addMod32(sigma1(W[t - 2]), W[t - 7], sigma0(W[t - 15]), W[t - 16]);
  }

  return W;
}
