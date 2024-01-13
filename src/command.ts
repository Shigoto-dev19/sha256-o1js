import {
  nodeHash,
  o1jsHash,
  nobleHash,
  Timer,
  o1jsHashOP,
} from './test-utils.js';

function benchmarkHash(hashFunction: typeof nobleHash, input: string) {
  const timer = new Timer();
  const digest = hashFunction(input);
  timer.end();

  return { digest, executionTime: timer.executionTime };
}

const input = process.argv[2] ?? '';

const o1js = benchmarkHash(o1jsHash, input);
const o1jsOP = benchmarkHash(o1jsHashOP, input);
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
    Step: 'o1js Hash Optimized',
    Hash: o1jsOP.digest,
    'Execution Time': o1jsOP.executionTime,
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
