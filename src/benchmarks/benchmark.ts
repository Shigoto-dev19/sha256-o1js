import * as bench from 'micro-bmark-ts';
import {
  o1jsHash,
  o1jsHashCircom,
  nodeHash,
  nobleHash,
  generateRandomInput,
} from '../test-utils.js';

const { mark, compare, run } = bench;

run(async () => {
  const iterations = parseInt(process.argv[2] ?? '2500');

  const randomInputGenerator = () => generateRandomInput(70);
  await mark(
    '\n\x1b[36mrandomInputGenerator\x1b[0m',
    iterations,
    randomInputGenerator
  );

  await compare(`\nSHA256 Benchmarks => ${iterations} iterations`, iterations, {
    o1jsSha256Circom: () => o1jsHashCircom(randomInputGenerator()),
    o1jsSha256Gadgets: () => o1jsHash(randomInputGenerator()),
    nodeSha256: () => nodeHash(randomInputGenerator()),
    nobleSha256: () => nobleHash(randomInputGenerator()),
  });

  console.log('\n');
  bench.utils.logMem(); // Log current RAM
});
