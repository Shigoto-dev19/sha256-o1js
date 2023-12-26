import { nodeHash, o1jsHash, nobleHash } from './test-utils.js';

//TODO: integrate hash and logs inside the class
class Timer {
  private startTime: number;
  private endTime: number;
  public executionTime: string;

  start() {
    this.startTime = performance.now();
  }

  end() {
    this.endTime = performance.now();
    this.executionTime = `${this.endTime - this.startTime} ms`;
  }
}

const input = process.argv[2] ?? '';

const o1jsTimer = new Timer();
o1jsTimer.start();
const o1jsDigest = o1jsHash(input);
o1jsTimer.end();

const nodeTimer = new Timer();
nodeTimer.start();
const nodeDigest = nodeHash(input);
nodeTimer.end();

const nobleTimer = new Timer();
nobleTimer.start();
const nobleDigest = nobleHash(input);
nobleTimer.end();

console.table([
  { Step: 'Input', Value: input },
  {
    Step: 'o1js Hash',
    Hash: o1jsDigest,
    'Execution Time': o1jsTimer.executionTime,
  },
  {
    Step: 'node Hash',
    Hash: nodeDigest,
    'Execution Time': nodeTimer.executionTime,
  },
  {
    Step: 'noble Hash',
    Hash: nobleDigest,
    'Execution Time': nobleTimer.executionTime,
  },
]);
