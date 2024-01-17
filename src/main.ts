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

// ----------------------------------------------------

// Create a public/private key pair. The public key is your address and where you deploy the zkApp to
const zkAppPrivateKey = PrivateKey.random();
const zkAppAddress = zkAppPrivateKey.toPublicKey();

// create an instance of Square - and deploy it to zkAppAddress
if (useProof) await Sha256ZkApp.compile();
const zkAppInstance = new Sha256ZkApp(zkAppAddress);

const deployTxn = await Mina.transaction(deployerAccount, () => {
  AccountUpdate.fundNewAccount(deployerAccount);
  zkAppInstance.deploy();
  zkAppInstance.init();
});
await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();

// get the initial state of Square after deployment
const digestInit = zkAppInstance.h1.get();

console.log('Part 1/8 of expected digest:', digestInit.toString());
console.log('Part 2/8 of expected digest:', zkAppInstance.h2.get().toString());
console.log('Part 3/8 of expected digest:', zkAppInstance.h3.get().toString());
console.log('Part 4/8 of expected digest:', zkAppInstance.h4.get().toString());
console.log('Part 5/8 of expected digest:', zkAppInstance.h5.get().toString());
console.log('Part 6/8 of expected digest:', zkAppInstance.h6.get().toString());
console.log('Part 7/8 of expected digest:', zkAppInstance.h7.get().toString());
console.log('Part 8/8 of expected digest:', zkAppInstance.h8.get().toString());
// ----------------------------------------------------

const txn1 = await Mina.transaction(senderAccount, () => {
  const x = Bytes3.fromString('abc');
  zkAppInstance.hash(x);
});
await txn1.prove();
await txn1.sign([senderKey]).send();
console.log('txn1: ', txn1.transaction);

console.log('Finished compiling');
