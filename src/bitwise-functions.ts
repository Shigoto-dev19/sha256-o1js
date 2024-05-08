import { Field, Gadgets, UInt32 } from 'o1js';

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

function rotateRight32(x: UInt32, bits: number) {
  return x.rotate(bits, 'right');
}

function shiftRight32(x: UInt32, bits: number) {
  return x.rightShift(bits);
}

function ch(x: UInt32, y: UInt32, z: UInt32): UInt32 {
  const xy = x.and(y);
  const _xz = x.not().and(z);

  return xy.xor(_xz);
}

function maj(x: UInt32, y: UInt32, z: UInt32): UInt32 {
  const xy = x.and(y);
  const xz = x.and(z);
  const yz = y.and(z);

  return xy.xor(xz).xor(yz);
}

function SIGMA0(x: UInt32) {
  const rotr2 = x.rotate(2, 'right');
  const rotr13 = x.rotate(13, 'right');
  const rotr22 = x.rotate(22, 'right');

  return rotr2.xor(rotr13).xor(rotr22);
}

function SIGMA1(x: UInt32) {
  const rotr6 = x.rotate(6, 'right');
  const rotr11 = x.rotate(11, 'right');
  const rotr25 = x.rotate(25, 'right');

  return rotr6.xor(rotr11).xor(rotr25);
}

function sigma0(x: UInt32) {
  const rotr7 = x.rotate(7, 'right');
  const rotr18 = x.rotate(18, 'right');
  const shr3 = x.rightShift(3);

  const rotr7x18 = rotr7.xor(rotr18);

  return rotr7x18.xor(shr3);
}

function sigma1(x: UInt32) {
  const rotr17 = x.rotate(17, 'right');
  const rotr19 = x.rotate(19, 'right');
  const shr10 = x.rightShift(10);

  return rotr17.xor(rotr19).xor(shr10);
}

function addMod32(...args: UInt32[]): UInt32 {
  let sum = Field(0);
  for (const val of args) sum = Gadgets.addMod32(sum, val.value);

  return new UInt32(sum.value);
}

function prepareMessageSchedule(bits32Words: UInt32[]): UInt32[] {
  const W = [...bits32Words];

  for (let t = 16; t <= 63; t++) {
    W[t] = addMod32(sigma1(W[t - 2]), W[t - 7], sigma0(W[t - 15]), W[t - 16]);
  }

  return W;
}
