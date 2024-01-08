import * as bench from 'micro-bmark-ts';
import {
  o1jsHash,
  nodeHash,
  nobleHash,
  generateRandomInput,
} from './test-utils.js';

const { compare, run } = bench;
run(async () => {
  const input = generateRandomInput(70);

  const iterations = 100;
  console.log('\nIterations: ', iterations);

  await compare('\nSHA256 Benchmarks', iterations, {
    o1js: () => o1jsHash(input),
    node: () => nodeHash(input),
    noble: () => nobleHash(input),
  });

  bench.utils.logMem(); // Log current RAM
});
