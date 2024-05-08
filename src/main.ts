import { Sha256ZkApp } from './index.js';
import { Mina, PrivateKey, AccountUpdate, Bytes } from 'o1js';

class Bytes3 extends Bytes(3) {}

const proofsEnabled = true;

const Local = await Mina.LocalBlockchain({ proofsEnabled });
Mina.setActiveInstance(Local);
const [deployerAccount, senderAccount] = Local.testAccounts;

// Create a public/private key pair. The public key is your address and where you deploy the zkApp to
const zkAppPrivateKey = PrivateKey.random();
const zkAppAddress = zkAppPrivateKey.toPublicKey();

// Create an instance of Sha256ZkApp - and deploy it to zkAppAddress
if (proofsEnabled) await Sha256ZkApp.compile();
const zkAppInstance = new Sha256ZkApp(zkAppAddress);

const deployTx = await Mina.transaction(deployerAccount, async () => {
  AccountUpdate.fundNewAccount(deployerAccount);
  zkAppInstance.deploy();
  zkAppInstance.init();
});
await deployTx.sign([deployerAccount.key, zkAppPrivateKey]).send();

// Fetch the public input of Sha256ZkApp after deployment
const digestInit = zkAppInstance.publicInput.get();
console.log('expected digest:', digestInit.toBigInt());


// Hash the preimage on-chain and if it is not compliant with the public input the TX will revert! 
const tx = await Mina.transaction(senderAccount, async () => {
  const x = Bytes3.fromString('abc');
  zkAppInstance.hash(x);
});

await tx.prove();
await tx.sign([senderAccount.key]).send();

console.log('\nFinished compiling');
