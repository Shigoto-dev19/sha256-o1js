import { ZkProgram, Bytes } from 'o1js';
import { sha256O1js } from './sha256.js';
import { Timer } from './test-utils.js';

class Bytes32 extends Bytes(32) {}
class Bytes3 extends Bytes(3) {}

// Define SHA256 ZkProgram
let sha256ZkProgram = ZkProgram({
  name: 'sha256',
  publicOutput: Bytes32.provable,
  methods: {
    hash: {
      privateInputs: [Bytes3.provable],
      async method(input: Bytes3) {
        return sha256O1js(input);
      },
    },
  },
});

// Print SHA256 ZkProgram summary
console.log('sha256 summary:', (await sha256ZkProgram.analyzeMethods()).hash.summary());

// Compile SHA256 ZkProgram
const compileTimer = new Timer('\nCompile Time');
await sha256ZkProgram.compile();
compileTimer.end();

const preimage = Bytes3.fromString('abc');

// Run hash method
const proveTimer = new Timer('Proving Time');
const proof = await sha256ZkProgram.hash(preimage);
proveTimer.end();

// Verify proof
const verifyTimer = new Timer('Verification Time');
const res = await sha256ZkProgram.verify(proof);
verifyTimer.end();
if (res === true) {
  console.log('\nProof Verification OK!');
} else {
  console.log('Invalid proof');
}

// Verify Compliance to Expected Digest
const digest = await proof.publicOutput.toHex();
const integrityCheck =
  digest === 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad';
console.log('Digest Integrity Check: ', integrityCheck);
