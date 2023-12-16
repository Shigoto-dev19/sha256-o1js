import { createHash } from 'crypto';
import { sha256 } from './index';
import { generateRandomInput, binaryToHex, fieldToBinary } from './utils';

// Create a string hash
function hash(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

function productionHash(input: string): string {
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
    const actualDigest = productionHash('abc');

    expect(actualDigest).toBe(expectedDigest);
  });

  test('should have expected digest for input=empty', () => {
    const expectedDigest =
      'e3b0c442 98fc1c14 9afbf4c8 996fb924 27ae41e4 649b934c a495991b 7852b855'
        .split(' ')
        .join('');
    const actualDigest = productionHash('');

    expect(actualDigest).toBe(expectedDigest);
  });

  test('should have expected digest for input=abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq', () => {
    const expectedDigest =
      '248d6a61 d20638b8 e5c02693 0c3e6039 a33ce459 64ff2167 f6ecedd4 19db06c1'
        .split(' ')
        .join('');
    const actualDigest = productionHash(
      'abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq'
    );

    expect(actualDigest).toBe(expectedDigest);
  });

  test('should have expected digest for input=abcdefghbcdefghicdefghijdefghijkefghijklfghijklmghijklmnhijklmnoijklmnopjklmnopqklmnopqrlmnopqrsmnopqrstnopqrstu', () => {
    const expectedDigest =
      'cf5b16a7 78af8380 036ce59e 7b049237 0b249b11 e8f07a51 afac4503 7afee9d1'
        .split(' ')
        .join('');
    const actualDigest = productionHash(
      'abcdefghbcdefghicdefghijdefghijkefghijklfghijklmghijklmnhijklmnoijklmnopjklmnopqklmnopqrlmnopqrsmnopqrstnopqrstu'
    );

    expect(actualDigest).toBe(expectedDigest);
  });
});

describe('Testing o1js SHA256 hash function against to node-js implementation', () => {
  test('should have compliant digest for input=abc', () => {
    const input = 'abc';
    const actualDigest = productionHash(input);
    const expectDigest = hash(input);

    expect(actualDigest).toBe(expectDigest);
  });

  test('should have different digest for input=abc and a random input', () => {
    const input = 'abc';
    const actualDigest = productionHash(input);
    const expectedDigest = hash(generateRandomInput());

    expect(actualDigest).not.toBe(expectedDigest);
  });

  test('should have compliant digest for input=random', () => {
    const input = generateRandomInput();
    const actualDigest = productionHash(input);
    const expectedDigest = hash(input);

    expect(actualDigest).toBe(expectedDigest);
  });

  test('should have compliant digest for input=random - 1000 iterations', () => {
    for (let i = 0; i < 1000; i++) {
      let input = generateRandomInput();
      let actualDigest = productionHash(input);
      let expectedDigest = hash(input);

      expect(actualDigest).toBe(expectedDigest);
    }
  });

  test('should have compliant digest for input=hash(random)', () => {
    const input = hash(generateRandomInput());
    const actualDigest = productionHash(input);
    const expectedDigest = hash(input);

    expect(actualDigest).toBe(expectedDigest);
  });

  test('should have compliant digest for input=hash(random) - 1000 iterations', () => {
    for (let i = 0; i < 1000; i++) {
      let input = hash(generateRandomInput());
      let actualDigest = productionHash(input);
      let expectedDigest = hash(input);

      expect(actualDigest).toBe(expectedDigest);
    }
  });
});
