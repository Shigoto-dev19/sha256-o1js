import { createHash } from 'crypto';
import { sha256 } from './index';
import { generateRandomInput, binaryToHex, fieldToBinary } from './utils';

// Create a string hash
function nodeHash(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

function o1jsHash(input: string): string {
  const digest = sha256(input);
  const digestBinary = digest.map(fieldToBinary).join('');
  const digestHex = binaryToHex(digestBinary);

  return digestHex;
}

// NIST test vectors (https://www.di-mgt.com.au/sha_testvectors.html)
// Note: - Input message: one million (1,000,000) repetitions of the character "a" (0x61).
//       - Input message: the extremely-long message "abcdefghbcdefghicdefghijdefghijkefghijklfghijklmghijklmnhijklmno" repeated 16,777,216 times: a bit string of length 233 bits (~1 GB). This test is from the SHA-3 Candidate Algorithm.
// The two test vectors above are ignored regarding the exhaustive amount of space and time required to run the tests!
describe.only('Testing against NIST Test Vectos', () => {
  test('should have expected digest for input=abc', () => {
    const expectedDigest =
      'ba7816bf 8f01cfea 414140de 5dae2223 b00361a3 96177a9c b410ff61 f20015ad'
        .split(' ')
        .join('');
    const o1jsDigest = o1jsHash('abc');

    expect(o1jsDigest).toBe(expectedDigest);
  });

  test('should have expected digest for input=empty', () => {
    const expectedDigest =
      'e3b0c442 98fc1c14 9afbf4c8 996fb924 27ae41e4 649b934c a495991b 7852b855'
        .split(' ')
        .join('');
    const o1jsDigest = o1jsHash('');

    expect(o1jsDigest).toBe(expectedDigest);
  });

  test('should have expected digest for input=abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq', () => {
    const expectedDigest =
      '248d6a61 d20638b8 e5c02693 0c3e6039 a33ce459 64ff2167 f6ecedd4 19db06c1'
        .split(' ')
        .join('');
    const o1jsDigest = o1jsHash(
      'abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq'
    );

    expect(o1jsDigest).toBe(expectedDigest);
  });

  test('should have expected digest for input=abcdefghbcdefghicdefghijdefghijkefghijklfghijklmghijklmnhijklmnoijklmnopjklmnopqklmnopqrlmnopqrsmnopqrstnopqrstu', () => {
    const expectedDigest =
      'cf5b16a7 78af8380 036ce59e 7b049237 0b249b11 e8f07a51 afac4503 7afee9d1'
        .split(' ')
        .join('');
    const o1jsDigest = o1jsHash(
      'abcdefghbcdefghicdefghijdefghijkefghijklfghijklmghijklmnhijklmnoijklmnopjklmnopqklmnopqrlmnopqrsmnopqrstnopqrstu'
    );

    expect(o1jsDigest).toBe(expectedDigest);
  });
});

describe.only('Testing o1js SHA256 hash function against to node-js implementation', () => {
  test('should have compliant digest for input=abc', () => {
    const input = 'abc';
    const o1jsDigest = o1jsHash(input);
    const nodeDigest = nodeHash(input);

    expect(o1jsDigest).toBe(nodeDigest);
  });

  test('should have different digest for input=abc and a random input', () => {
    const input = 'abc';
    const o1jsDigest = o1jsHash(input);
    const nodeDigest = nodeHash(generateRandomInput());

    expect(o1jsDigest).not.toBe(nodeDigest);
  });

  test('should have compliant digest for input=random', () => {
    const input = generateRandomInput();
    const o1jsDigest = o1jsHash(input);
    const nodeDigest = nodeHash(input);

    expect(o1jsDigest).toBe(nodeDigest);
  });

  test('should have compliant digest for input=random - 1000 iterations', () => {
    for (let i = 0; i < 1000; i++) {
      let input = generateRandomInput();
      let o1jsDigest = o1jsHash(input);
      let nodeDigest = nodeHash(input);

      expect(o1jsDigest).toBe(nodeDigest);
    }
  });

  test('should have compliant digest for input=hash(random)', () => {
    const input = nodeHash(generateRandomInput());
    const o1jsDigest = o1jsHash(input);
    const nodeDigest = nodeHash(input);

    expect(o1jsDigest).toBe(nodeDigest);
  });

  test('should have compliant digest for input=hash(random) - 1000 iterations', () => {
    for (let i = 0; i < 1000; i++) {
      let input = nodeHash(generateRandomInput());
      let o1jsDigest = o1jsHash(input);
      let nodeDigest = nodeHash(input);

      expect(o1jsDigest).toBe(nodeDigest);
    }
  });

  test.skip('should have compliant chained hashes', () => {
    const input = generateRandomInput(100);
    let nodeDigest = nodeHash(input);
    let o1jsDigest = o1jsHash(input);
    for (let i = 0; i < 256; i++) {
      nodeDigest = nodeHash(nodeDigest);
      o1jsDigest = o1jsHash(o1jsDigest);

      expect(o1jsDigest).toBe(nodeDigest);
    }
  });

  test.skip('should have passing sliding window tests - 4096', () => {
    const testWindow4096 = new Array<string>(4096);
    for (let i = 0; i < testWindow4096.length; i++)
      testWindow4096[i] = i.toString();

    for (let i = 1; i < testWindow4096.length; i++) {
      let input = testWindow4096.slice(0, i).join('');

      let actualHash = o1jsHash(input);
      let nodeDigest = nodeHash(input);

      expect(actualHash).toBe(nodeDigest);
    }
  });

  // This test aims to destruct an input into seperate 32-bit blocks and then compare the digest of the full input against recursive updates of the 32-bit blocks
  // It has the same concept of the sliding window test but on sequential update of destruced message blocks.
  //TODO: This test requires update method for the hash function.
  test.skip('should have passing sliding window tests - 3/256', () => {
    let testWindow768 = new Array<string>(256 * 3);
    // Fill with random data
    for (let i = 0; testWindow768.length; i++)
      testWindow768[i] = generateRandomInput(768);
  });
});
