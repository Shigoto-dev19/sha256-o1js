import { Field, SmartContract, state, State, method, Bytes } from 'o1js';
import { sha256O1js } from './sha256.js';
class Bytes3 extends Bytes(3) {}

const o1jsDigest = [
  3128432319, 2399260650, 1094795486, 1571693091, 2953011619, 2518121116,
  3021012833, 4060091821,
].map(Field);

export class Sha256ZkApp extends SmartContract {
  @state(Field) h1 = State<Field>();
  @state(Field) h2 = State<Field>();
  @state(Field) h3 = State<Field>();
  @state(Field) h4 = State<Field>();
  @state(Field) h5 = State<Field>();
  @state(Field) h6 = State<Field>();
  @state(Field) h7 = State<Field>();
  @state(Field) h8 = State<Field>();

  init() {
    //TODO: change digest into two 128-bit field elements
    super.init();
    // initial state
    this.h1.set(o1jsDigest[0]);
    this.h2.set(o1jsDigest[1]);
    this.h3.set(o1jsDigest[2]);
    this.h4.set(o1jsDigest[3]);
    this.h5.set(o1jsDigest[4]);
    this.h6.set(o1jsDigest[5]);
    this.h7.set(o1jsDigest[6]);
    this.h8.set(o1jsDigest[7]);
  }

  @method hash(x: Bytes3) {
    const p1 = this.h1.getAndRequireEquals();
    const p2 = this.h2.getAndRequireEquals();
    const p3 = this.h3.getAndRequireEquals();
    const p4 = this.h4.getAndRequireEquals();
    const p5 = this.h5.getAndRequireEquals();
    const p6 = this.h6.getAndRequireEquals();
    const p7 = this.h7.getAndRequireEquals();
    const p8 = this.h8.getAndRequireEquals();

    const [x1, x2, x3, x4, x5, x6, x7, x8] = sha256O1js(x);

    p1.assertEquals(x1);
    p2.assertEquals(x2);
    p3.assertEquals(x3);
    p4.assertEquals(x4);
    p5.assertEquals(x5);
    p6.assertEquals(x6);
    p7.assertEquals(x7);
    p8.assertEquals(x8);
  }
}
