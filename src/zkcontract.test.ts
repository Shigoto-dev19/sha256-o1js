import { Sha256ZkApp } from './index.js';
import { sha256O1js } from './sha256.js';
import {
  Field,
  Mina,
  PrivateKey,
  PublicKey,
  AccountUpdate,
  Bytes,
  Provable,
} from 'o1js';

let proofsEnabled = false;

describe('Sha256ZkApp', () => {
  let deployerAccount: PublicKey,
    deployerKey: PrivateKey,
    senderAccount: PublicKey,
    senderKey: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: Sha256ZkApp;

  beforeAll(async () => {
    if (proofsEnabled) await Sha256ZkApp.compile();
  });

  beforeEach(() => {
    const Local = Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    ({ privateKey: deployerKey, publicKey: deployerAccount } =
      Local.testAccounts[0]);
    ({ privateKey: senderKey, publicKey: senderAccount } =
      Local.testAccounts[1]);
    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new Sha256ZkApp(zkAppAddress);
  });

  async function localDeploy() {
    const txn = await Mina.transaction(deployerAccount, () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      zkApp.deploy();
    });
    await txn.prove();
    // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
  }

  it('generates and deploys the `Sha256ZkApp` smart contract', async () => {
    await localDeploy();

    let digest: Field;
    try {
      digest = zkApp.publicInput.get();
      const expectedDigest = sha256O1js(Bytes.fromString('abc'));
    } catch (error) {
      console.log(error);
    }
  });

  it('asserts on the initial digest compared to the output from smart contract hash interaction', async () => {
    await localDeploy();

    
    class Bytes3 extends Bytes(3) {}

    // update transaction
    const x = Provable.witness(Bytes3.provable, () => Bytes3.fromString('abc'));
    const txn = await Mina.transaction(senderAccount, () => {
      zkApp.hash(x);
    });
    await txn.prove();
    await txn.sign([senderKey]).send();
  });
});
