import { o1jsHash, nodeHash, generateRandomInput } from './test-utils';
import { bytesToHex, concatBytes } from '@noble/hashes/utils';
import { sha256 as nobleHashUint } from '@noble/hashes/sha256';
import { sha256O1js } from './sha256';
import { SHA256 } from './sha256-class';
import * as crypto from 'crypto';
import { Bytes } from 'o1js';

// NIST test vectors (https://www.di-mgt.com.au/sha_testvectors.html)
// Note: - Input message: one million (1,000,000) repetitions of the character "a" (0x61).
//       - Input message: the extremely-long message "abcdefghbcdefghicdefghijdefghijkefghijklfghijklmghijklmnhijklmno" repeated 16,777,216 times: a bit string of length 233 bits (~1 GB). This test is from the SHA-3 Candidate Algorithm.
// The two test vectors above are ignored regarding the exhaustive amount of space and time required to run the tests!
describe('Testing against NIST Test Vectos', () => {
  test('should have expected digest for input=abc', () => {
    const o1jsDigest = o1jsHash('abc');
    const expectedDigest =
      'ba7816bf 8f01cfea 414140de 5dae2223 b00361a3 96177a9c b410ff61 f20015ad'
        .split(' ')
        .join('');

    expect(o1jsDigest).toBe(expectedDigest);
  });

  test('should have expected digest for input=empty', () => {
    const o1jsDigest = o1jsHash('');
    const expectedDigest =
      'e3b0c442 98fc1c14 9afbf4c8 996fb924 27ae41e4 649b934c a495991b 7852b855'
        .split(' ')
        .join('');

    expect(o1jsDigest).toBe(expectedDigest);
  });

  test('should have expected digest for input=abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq', () => {
    const o1jsDigest = o1jsHash(
      'abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq'
    );
    const expectedDigest =
      '248d6a61 d20638b8 e5c02693 0c3e6039 a33ce459 64ff2167 f6ecedd4 19db06c1'
        .split(' ')
        .join('');

    expect(o1jsDigest).toBe(expectedDigest);
  });

  test.skip('should have expected digest for input=abcdefghbcdefghicdefghijdefghijkefghijklfghijklmghijklmnhijklmnoijklmnopjklmnopqklmnopqrlmnopqrsmnopqrstnopqrstu', () => {
    const o1jsDigest = o1jsHash(
      'abcdefghbcdefghicdefghijdefghijkefghijklfghijklmghijklmnhijklmnoijklmnopjklmnopqklmnopqrlmnopqrsmnopqrstnopqrstu'
    );
    const expectedDigest =
      'cf5b16a7 78af8380 036ce59e 7b049237 0b249b11 e8f07a51 afac4503 7afee9d1'
        .split(' ')
        .join('');

    expect(o1jsDigest).toBe(expectedDigest);
  });
});

describe('Testing o1js SHA256 hash function against to node-js implementation', () => {
  const testSha256 = (input: string) => {
    const o1jsDigest = o1jsHash(input);
    const nodeDigest = nodeHash(input);

    expect(o1jsDigest).toBe(nodeDigest);
  };

  test('should have compliant digest for input=abc', () => {
    const input = 'abc';
    testSha256(input);
  });

  test('should have different digest for input=abc and a random input', () => {
    const input = 'abc';
    const o1jsDigest = o1jsHash(input);
    const nodeDigest = nodeHash(generateRandomInput());

    expect(o1jsDigest).not.toBe(nodeDigest);
  });

  test('should have compliant digest for input=random', () => {
    const input = generateRandomInput() as string;
    testSha256(input);
  });

  test('should have compliant digest for input=random - 100 iterations', () => {
    for (let i = 0; i < 100; i++) {
      let input = generateRandomInput(70) as string;
      testSha256(input);
    }
  });

  test('should have compliant digest for input=hash(random)', () => {
    const input = nodeHash(generateRandomInput(150));
    testSha256(input);
  });

  test('should have compliant digest for input=hash(random) - 100 iterations', () => {
    for (let i = 0; i < 100; i++) {
      let input = nodeHash(generateRandomInput(70));
      testSha256(input);
    }
  });

  test('should have compliant chained hashes', () => {
    const input = generateRandomInput(100);
    let nodeDigest = nodeHash(input);
    let o1jsDigest = o1jsHash(input);
    for (let i = 0; i < 256; i++) {
      nodeDigest = nodeHash(nodeDigest);
      o1jsDigest = o1jsHash(o1jsDigest);

      expect(o1jsDigest).toBe(nodeDigest);
    }
  });

  test('should have compliant digest for input=randomUint8Array', () => {
    const input = generateRandomInput(31, true);
    const actualDigest = o1jsHash(input);
    const expectedDigest = bytesToHex(nobleHashUint(input));

    expect(actualDigest).toBe(expectedDigest);
  });

  test('should have compliant digest for input=randomUint8Array - 100 iterations', () => {
    for (let i = 0; i < 100; i++) {
      let input = generateRandomInput(31, true);
      let actualDigest = o1jsHash(input);
      let expectedDigest = bytesToHex(nobleHashUint(input));

      expect(actualDigest).toBe(expectedDigest);
    }
  });

  // !This test takes extremely long time to finish 
  test.skip('should have passing sliding window tests - 4096', () => {
    const testWindow4096 = new Array<string>(4096);
    for (let i = 0; i < testWindow4096.length; i++)
      testWindow4096[i] = i.toString();

    for (let i = 1; i < testWindow4096.length; i++) {
      let input = testWindow4096.slice(0, i).join('');
      testSha256(input);
    }
  });

  /*   
  This test aims to destruct an input into seperate 32-bit blocks and then compare the digest of the full input against recursive updates of the 32-bit blocks
  It has the same concept of the sliding window test 4096 but on sequential update of destruced message blocks.
  ! This test takes around 1.5 hours to finish
  */
  test.skip('should pass sliding window tests - 3/256', () => {
    let BUF_768 = new Uint8Array(256 * 3);
    
    // Fill with random data
    for (let i = 0; i < (256 * 3) / 32; i++)
      BUF_768.set(crypto.createHash('sha256').update(new Uint8Array(i)).digest(), i * 32);
    
    let BYTES_768 = Bytes.from(BUF_768);
    const digest768 = sha256O1js(BYTES_768);
    for (let i = 0; i < 256; i++) {
      let b1 = BUF_768.subarray(0, i);
      let b1Bytes = Bytes.from(b1);
      for (let j = 0; j < 256; j++) {
        let b2 = BUF_768.subarray(i, i + j);
        let b2Bytes = Bytes.from(b2);
        
        let b3 = BUF_768.subarray(i + j);
        let b3Bytes = Bytes.from(b3);
        
        expect(concatBytes(b1, b2, b3)).toStrictEqual(BUF_768);
        expect(new SHA256().update(b1Bytes).update(b2Bytes).update(b3Bytes).digest().toHex())
        .toEqual(digest768.toHex());
      }
    }
  });
});