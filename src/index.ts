import {
  Field,
  SmartContract,
  state,
  State,
  method,
  Bytes,
  Poseidon,
} from 'o1js';
import { sha256O1js } from './sha256.js';

class Bytes3 extends Bytes(3) {}

// the sha256 digest is poseidon hashed to output a single field that will serve as a publicInput
// the bytes of abc digest=ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad
const commitment = Poseidon.hash(
  [
    186, 120, 22, 191, 143, 1, 207, 234, 65, 65, 64, 222, 93, 174, 34, 35, 176,
    3, 97, 163, 150, 23, 122, 156, 180, 16, 255, 97, 242, 0, 21, 173,
  ].map(Field)
);

export class Sha256ZkApp extends SmartContract {
  @state(Field) publicInput = State<Field>();

  init() {
    super.init();
    // initial state
    this.publicInput.set(commitment);
  }

  @method hash(x: Bytes3) {
    const publicDigest = this.publicInput.getAndRequireEquals();
    const digest = sha256O1js(x);
    const instance = Poseidon.hash(digest.toFields());

    instance.assertEquals(publicDigest);
  }
}
