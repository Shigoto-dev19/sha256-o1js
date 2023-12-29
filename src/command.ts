import { nodeHash, o1jsHash, nobleHash } from './test-utils.js';
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

function benchmarkHash(hashFunction: typeof nobleHash, input: string) {
  const timer = new Timer();
  timer.start();
  const digest = hashFunction(input);
  timer.end();

  return {digest, executionTime: timer.executionTime}
}

const input = process.argv[2] ?? '';

const o1js = benchmarkHash(o1jsHash, input);
const node = benchmarkHash(nodeHash, input);
const noble = benchmarkHash(nobleHash, input);

console.table([
  { Step: 'Input', Value: input },
  {
    Step: 'o1js Hash',
    Hash: o1js.digest,
    'Execution Time': o1js.executionTime,
  },
  {
    Step: 'node Hash',
    Hash: node.digest,
    'Execution Time': node.executionTime,
  },
  {
    Step: 'noble Hash',
    Hash: noble.digest,
    'Execution Time': noble.executionTime,
  },
]);
