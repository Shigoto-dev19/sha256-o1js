import { Sha256ZkApp } from './index.js';
import { Mina, PrivateKey, AccountUpdate, Bytes } from 'o1js';

class Bytes3 extends Bytes(3) {}

const useProof = true;

const Local = Mina.LocalBlockchain({ proofsEnabled: useProof });
Mina.setActiveInstance(Local);
const { privateKey: deployerKey, publicKey: deployerAccount } =
  Local.testAccounts[0];
const { privateKey: senderKey, publicKey: senderAccount } =
  Local.testAccounts[1];

// Create a public/private key pair. The public key is your address and where you deploy the zkApp to
const zkAppPrivateKey = PrivateKey.random();
const zkAppAddress = zkAppPrivateKey.toPublicKey();

// create an instance of Sha256ZkApp - and deploy it to zkAppAddress
if (useProof) await Sha256ZkApp.compile();
const zkAppInstance = new Sha256ZkApp(zkAppAddress);

const deployTxn = await Mina.transaction(deployerAccount, () => {
  AccountUpdate.fundNewAccount(deployerAccount);
  zkAppInstance.deploy();
  zkAppInstance.init();
});
await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();

// fetch the public input of Sha256ZkApp after deployment
const digestInit = zkAppInstance.publicInput.get();
console.log('expected digest:', digestInit.toBigInt());

/* 
- hash the preimage on-chain
- if it is not compliant with the public input the TX will revert! 
 */
const txn1 = await Mina.transaction(senderAccount, () => {
  const x = Bytes3.fromString('abc');
  zkAppInstance.hash(x);
});

await txn1.prove();
await txn1.sign([senderKey]).send();

// console.log('txn1: ', txn1.toPretty());

console.log('\nFinished compiling');
