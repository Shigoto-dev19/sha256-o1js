import {
  Poseidon,
  Field,
  Circuit,
  circuitMain,
  public_,
  Bytes,
  Provable,
} from 'o1js';
import { Gate } from '../node_modules/o1js/dist/node/snarky';
import { sha256O1js } from './sha256.js';
import { Timer } from './test-utils.js';

class Bytes32 extends Bytes(32) {}

function calculateCircuitWires(inputArray: Gate[]) {
  let wireSum = 0;
  // let rows = 0;
  for (const gate of inputArray) {
    wireSum += gate.wires.length;
    // for (const wire of gate.wires) rows += wire.row;
  }
  // console.log('rows: ', rows);
  return wireSum;
}

interface CircuitStats {
  circuit: string;
  preimage: bigint;
  kgTimer: Timer;
  pvTimer: Timer;
  vfTimer: Timer;
  wires: number;
  gates: number;
}

function logCircuitStats(params: CircuitStats) {
  console.table([
    { Step: 'Circuit', Value: params.circuit },
    { Step: 'Preimage', Value: params.preimage },
    {
      Step: 'Key Generation Time',
      Value: params.kgTimer.executionTime,
    },
    {
      Step: 'Proving Time',
      Value: params.pvTimer.executionTime,
    },
    {
      Step: 'Verification Time',
      Value: params.vfTimer.executionTime,
    },
    { Step: 'Wires', Value: params.wires },
    { Step: 'Gates', Value: params.gates },
  ]);
}
{
  /**
   * Public input: a hash value h
   *
   * Prove:
   *   I know a value x such that hash(x) = h
   */
  class PoseidonCircuit extends Circuit {
    @circuitMain
    static main(preimage: Field, @public_ hash: Field) {
      Poseidon.hash([preimage]).assertEquals(hash);
    }
  }

  console.log('generating keypair...');
  const kgTimer = new Timer();
  const kp = await PoseidonCircuit.generateKeypair();
  kgTimer.end();

  const preimage = Field(-1);
  const publicInput = Poseidon.hash([preimage]);

  console.log('prove...');
  const pvTimer = new Timer();
  const pi = await PoseidonCircuit.prove([preimage], [publicInput], kp);
  pvTimer.end();

  console.log('verify...');
  const vfTimer = new Timer();
  let verified = await PoseidonCircuit.verify(
    [publicInput],
    kp.verificationKey(),
    pi
  );
  vfTimer.end();

  console.log('Sucessfully Verified?', verified);

  if (!verified) throw Error('verification failed');

  const poseidonStats: CircuitStats = {
    circuit: 'Poseidon',
    preimage: preimage.toBigInt(),
    kgTimer,
    pvTimer,
    vfTimer,
    wires: calculateCircuitWires(kp.constraintSystem()),
    gates: kp.constraintSystem().length,
  };
  logCircuitStats(poseidonStats);
}

{
  /**
   * Public input: a hash value h
   *
   * Prove:
   *   I know a value x such that hash(x) = h
   */
  class Sha256Circuit extends Circuit {
    @circuitMain
    static main(preimage: Bytes32, @public_ hash1: Field) {
      const digest = Poseidon.hash(sha256O1js(preimage).toFields());
      digest.assertEquals(hash1);
      // for (let i=0; i<32; i++) digest[i].assertEquals(hash1[i]);
    }
  }

  console.log('generating keypair...');
  const kgTimer = new Timer();
  const kp = await Sha256Circuit.generateKeypair();
  kgTimer.end();

  const preimage = Provable.witness(Bytes32.provable, () => Bytes32.random());
  const publicInput = sha256O1js(preimage);

  console.log('prove...');
  const pvTimer = new Timer();
  const pi = await Sha256Circuit.prove([preimage], [publicInput], kp);
  pvTimer.end();

  console.log('verify...');
  const vfTimer = new Timer();
  let verified = await Sha256Circuit.verify(
    [publicInput],
    kp.verificationKey(),
    pi
  );
  vfTimer.end();

  console.log('Sucessfully Verified?', verified);

  if (!verified) throw Error('verification failed');

  const poseidonStats: CircuitStats = {
    circuit: 'Sha256',
    preimage: BigInt('0x' + preimage.toHex()),
    kgTimer,
    pvTimer,
    vfTimer,
    wires: calculateCircuitWires(kp.constraintSystem()),
    gates: kp.constraintSystem().length,
  };
  logCircuitStats(poseidonStats);
}
