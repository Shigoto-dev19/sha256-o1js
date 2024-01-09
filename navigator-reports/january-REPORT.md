# MINA Naviagator Program

## Progress Report --> January

### DAY1-2: 4th & 8th January

- Update o1js peerDependency to 0.15.2.
- Realize that the latest o1js released `SHA3-256` not the `SHA2-256`.
- Add benchmark file and script using [micro-bmark](https://github.com/paulmillr/micro-bmark) package.
  - The strict type assertion of o1js projects inhibited the usage of this powerful package regarding that it is written in vanilla JS.
  - It took time to add `.d.ts` file and fork the package to be strict TS-compatible.
    - The forked package is named [micro-bmark-ts](https://github.com/Shigoto-dev19/micro-bmark-ts) which can be useful now for other developers as well.
  - Add script for swift usage of the benchmark file -> `npm run benchmark`
  - The difference between `command.ts` and `benchmark.ts` files
    - I use the command file for print debugging and having a rough idea on performance.
    - The benchmark files serves to compare the performance of difference function based on the number of iteration and optional stat logs.
- Add `constraintSystem.ts` file.
  - The provable deployment fails because of some error when it comes to compiling and proving zkapp as a circuit.
  - Separate the provable part and use MINA Circuit Class
    - Utilize the **Poseidon** example.
    - Add exisiting `sha256` circuit
      - Heap limit error again.
    - Add `o1jsBitwise` object inside `functions.ts`
      - Add o1js `natively optimized` sha256 version
      - The function is now sucessfully provable but very slow
      - `shiftRight` doesn't exist in the o1js Gadget so I add it based on how it is initiated in `Gadgets.leftShift32`
        - Now the `sha256` is faster
    - Add logs to track performance of both poseidon and sha256 circuits
      - log wires and gates number
        - it seems to be different that vkregression
        - TODO: further research for the exact gate number of a MINA circuit<
      - log key generation, proving, and verification time.
      - Timer Class required:
        - Move to test-utils.ts file
        - Integrate start method inside the constructor
- Overall, after long sessions of reasearch & debugging, it was a success and good learning days exploring MINA :)

### DAY3: 9th January

- Add the optimized version to commands.ts
  - A version of o1js SHA256 hash function optimized fully with native o1js gadgets is `10 times` faster that a hash function simulated to the implementation in circom!! -> command.ts log -> 1 iteration.
  - SHA256 Benchmarks -> also verified by the benchmark script -> 1000 iterations
    ├─o1js x 46 ops/sec @ 21ms/op
    ├─o1jsOP x 388 ops/sec @ 2ms/op 
  - The first SHA256 hash function was a combination of native o1js gadgets and simulated circom templated for other bitwise function
    - After the last release, the 32-bit bitwise functions are now available.
      - Adding the SHA256 function using purely the bitwise functions from the gadgets, it seems that it is worth comparing to the first hash function
      - Write `ch` and `maj` bitwise function similar to the sha256 circom circuit implementation.
      - Realize that `shift32` bitwise function was not correct after assertions -> Fix error source
        - The latest release included leftShift32 and not rightShift and a simulated implementation was incorrect because leftShift is based on multiplication and rightShift on division
          - division of field element give non-compliant results
          - the solution is to use `Gadgets.rotate64(field, bits, 'right')` function to shift the bits to the left i.e getting rid of them and then truncate the rotated bits using Gadgets.divMod32() function.
           ```typescript
          let { remainder: shifted } = Gadgets.divMod32(Gadgets.rotate64(field, bits, 'right'));
          ```
          - See [benchnark results](../src/benchmarks.md) -> it is impressive that a SHA256 hash function is more than 50X faster than a circom-like implemented hash function
- Improve benchmarks to be based on randomly generated inputs
- Change format of the circuit stat logs in `command.ts`.
- Add a seperate `benchmarks.md` file for time-consuming benchmark results.
- Write a [tweet](https://x.com/KaffelMahmoud/status/1744805950114894129?s=20) about the fascinating results :)