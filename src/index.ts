import { Field, Bool, SmartContract, state, State, method } from 'o1js';
import { sha256 } from './sha256.js';
export class Sha256ZkApp extends SmartContract {
  @state(Field) publicHash = State<Field[]>();
  
  init() {
    super.init();
    this.publicHash.set([
        3862364557,
        2482757601,
        449671408,
        3472485799,
        211070511,
        3701003886,
        1994277198,
        1422608920
      ].map(Field)); // initial state
  }
  @method hash(x1: Field, x2: Field, x3: Field, x4: Field) {
    const publicHash = this.publicHash.get();

    for (let i = 0; i < publicHash.length; i++) {
      publicHash[i].assertEquals(sha256([x1, x2, x3, x4])[i]);
    }
  }
}
