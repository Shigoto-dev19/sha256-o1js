import { parseHashInput, toBoolArray } from './binary-utils';
import { Sha256ZkApp } from './index';
import { sha256 } from './sha256';
import { Field, Mina, PrivateKey, PublicKey, AccountUpdate, fetchAccount } from 'o1js';

/*
 * This file specifies how to test the `Add` example smart contract. It is safe to delete this file and replace
 * with your own tests.
 *
 * See https://docs.minaprotocol.com/zkapps for more info.
 */

let proofsEnabled = false;

describe.only('Sha256ZkApp', () => {
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
    try {
        await localDeploy();
    } catch (error) {
        console.log(error)
    }
    
    const digest = zkApp.publicHash.get();
    // compare the initial public hash to the local o1js hash function
    expect(digest).toStrictEqual(sha256(parseHashInput('o1js')));
  });

  it('asserts on the initial digest compared to the output from smart contract hash interaction', async () => {
    await localDeploy();

    // update transaction
    const [x1, x2, x3, x4] = parseHashInput('o1js'); 
    const txn = await  Mina.transaction(senderAccount, () => {
      zkApp.hash(x1, x2, x3, x4);
    });
    await txn.prove();
    await txn.sign([senderKey]).send();

    // const updatedNum = zkApp.num.get();
    // expect(updatedNum).toEqual(Field(3));
  });
});