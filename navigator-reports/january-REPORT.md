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
