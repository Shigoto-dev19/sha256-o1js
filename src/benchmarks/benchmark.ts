import * as bench from 'micro-bmark-ts';
import {
  o1jsHash,
  o1jsHashCircom,
  nodeHash,
  nobleHash,
  generateRandomInput,
} from '../test-utils.js';
import { Hash, Bytes } from 'o1js';

// the newly released SHA256 gadget by the o1js team
function o1jsHashReleased(input: string) {
  const parsedInput = Bytes.fromString(input);
  const sha2Digest = Hash.SHA2_256.hash(parsedInput)

  return sha2Digest.toHex();
}

const { mark, compare, run } = bench;

run(async () => {
  const iterations = parseInt(process.argv[2] ?? '2500');

  const randomInputGenerator = () => generateRandomInput(70, true);
  await mark(
    '\n\x1b[36mrandomInputGenerator\x1b[0m',
    iterations,
    randomInputGenerator
  );

  await compare(`\nSHA256 Benchmarks => ${iterations} iterations`, iterations, {
    o1jsSha256Released: () => o1jsHashReleased(randomInputGenerator() as string),
    myO1jsSha256: () => o1jsHash(randomInputGenerator()),
    myO1jsSha256Circom: () => o1jsHashCircom(randomInputGenerator()),
    nodeSha256: () => nodeHash(randomInputGenerator()),
    nobleSha256: () => nobleHash(randomInputGenerator()),
  });

  console.log('\n');
  bench.utils.logMem(); // Log current RAM
});
