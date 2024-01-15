import { Bytes, Provable, Field, Hash, Poseidon } from 'o1js';
import { sha256O1js } from '../sha256.js';

let Bytes32 = Bytes(32);

console.time('sha3_256 witness');
Provable.runAndCheck(() => {
  let bytes = Provable.witness(Bytes32.provable, () => Bytes32.random());
  Hash.SHA3_256.hash(bytes);
});
console.timeEnd('sha3_256 witness');

console.time('sha256 witness');
Provable.runAndCheck(() => {
  let input = Provable.witness(Field, () => Field.random());
  sha256O1js(input);
});
console.timeEnd('sha256 witness');

console.time('poseidon witness');
Provable.runAndCheck(() => {
  let input = Provable.witness(Field, () => Field.random());
  Poseidon.hash([input]);
});
console.timeEnd('poseidon witness');
