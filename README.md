# Mina zkApp: Sha256

This template uses TypeScript.

## Description

This repo is a proof of concept for developing the SHA256 hashing algorithm using the o1js SDK during ZK-HACK Istanbul.

The o1js sdk offers powerful native binary functions that can help build an efficient SHA2 circuit for zk-apps in the Mina blockchain.

## Optimizations
- SHA2 circuits are generally quite inefficient considering that binaries(0 or 1) take the space of a whole field element.

- Doing multiple binary operations on multiple binaries represented as field elements, the SHA2 algorithm becomes a constraint-heavy circuit.

- Regarding that SHA256 construction(Merkle–Damgård) operates on 32-bit words, o1js SDK aims to optimize the circuit implementation by operating on the 32-bit words(32 field elements) as a single field element.


## How does SHA-256 work?

- SHA-2 algorithms can be described in two stages: preprocessing and hash computation.   

- Preprocessing involves:
    1. padding a message.
    2. parsing the padded message into m-bit blocks.
    3. setting initialization values to be used in the hash computation.        

- The hash computation generates a message schedule from the padded message and uses that schedule, along with functions,
constants, and word operations to iteratively generate a series of hash values. The final hash
value generated by the hash computation is used to determine the message digest.

- For a detailed explanation, I highly recommend you to walk through this [Notion Page](https://smooth-writer-db1.notion.site/Understanding-SHA-256-Hash-Function-274efa15d9a546aa9cacde9c4d8eb953) that I prepared.
## How to build

```sh
npm run build
```

## License

[Apache-2.0](LICENSE)
