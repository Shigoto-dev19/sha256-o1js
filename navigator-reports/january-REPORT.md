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
          let { remainder: shifted } = Gadgets.divMod32(
            Gadgets.rotate64(field, bits, 'right')
          );
          ```
          - See [benchnark results](../src/benchmarks/benchmarks.md) -> it is impressive that a SHA256 hash function is more than 50X faster than a circom-like implemented hash function
- Improve benchmarks to be based on randomly generated inputs
- Change format of the circuit stat logs in `command.ts`.
- Add a seperate `benchmarks.md` file for time-consuming benchmark results.
- Write a [tweet](https://x.com/KaffelMahmoud/status/1744805950114894129?s=20) about the fascinating results :)

### DAY4: 13th January

- Move TWO32 constant from function to the `constants.ts`
- Now that the o1js sha256 is validated as more efficient than the circom implementation, the following changes are made:
  - Create a new directory called `benchmarks`
    - This directory contains the benchmarks code --> `benchmark.ts`
    - The benchmarks report --> `benchmarks.md`
  - Now the simulated circom implementation is moved inside a new directory called `comparator` because its only role is to track performance of the main operational function.
    - **functions.ts** is renamed as `bitwise-functions.ts` and is now seperate for both circom and native implementations
    - the comparator directory now contains the bitwise functions inspired from the sha256 circom template
    - a hash function sha256 that uses the custom bitwise functions from the latter functions
  - Destruct the function from the **o1jsBitwise** object after sha256 separation
  - Adapt tests to the new optimize/native implementation
    - Some tests failed at the beginning
      - the direction of rotation should be explicit, that's why I wrapped it as a different function `rotateRight32`
      - after debugging, I realized that native `Gadgets.rotate32` function doesn't support rotationBits=0 so the test case is skipped now
      - after checking --> all tests pass
- Polish test-utils imports to reduce import redundancy(mainly from node crypto library)
- Move all export objects from bottom to the top of files(all) for better readability.
- **Note:** after separation, preprocessing function using native o1js bitwise gadgets are used in common for the native and circom implementation but it doesn't have effect on the performance because it is only called once
  - this is verified by comparing old and new benchmark after restructuring of the project
- Resturcturing and polishing the code took time and became a huge commit
  - Improve readability and code quality --> the project will still get bigger
  - This is crucial to separate operational code from other utility code

### DAY5: 14-15th January

- Add script argument to the `benchmark.ts` file
  - now the script can be run with `npm run benchmark <iterations>` with iterations default set as 2500 when no arg is entered.
  - Update the package.json script after project restructuring.
- Move `command.ts` to the benchmarks directory and adapt code.
- Add sha3-256 to the benchmarks --> result is it has the same performance as sha256 function which is good news
  - for 2500 iterations, sha3 is slightly better in performance but that might because of the noise of input handling in sha256.
    -note: the o1js sha3 input is limited to 32 bytes
- Add witness benchmarks for poseidon, sha3_256 and sha256 in a new file called `sha256-witness.ts`
  - Add script ==> `npm run witness-time`
- Regarding that SHA256 will be used in most cases for using field i.e number instead of string in a circuit
  - the input handling was quite different with o1js than other js/ts sha256 hash function, most of the function use **Uint8Array** as input if the input was desired to be a number.
  - I was aiming to hash a field directly to simulate poseidon function inputs in o1js
  - I adapted code to be compliant
    - this was cumbersome, this step is always exhausting regarding that the avalance effect of the hash function always makes it difficult to track error source
    - Add test cases for hashing inputs as field or Uint8Array
    - tests pass but the hash function throws an error about pointing that the code is not provable when compiled
    - send time debugging but might use input handling of Uint8Array similar to what's released in o1js SHA3_256

### DAY6: 17th January

- The compiler doesn't differentiate when provable and non-provable code should be used
  - There can be some solutions using `Provable.if` or `Provable.asProve` but there are some constraints that I would like to point to
    - `Provable.if` only supports a single field type, that's why a desirable Field[], Bool[] etc... are not possible to retrieve from such a method
    - `Provable.asProver` returns void and upper-scope variables are cannot be read inside its callback, that's why, it makes it not usable in many cases.
- Update sha256 inputs to provable Bytes type the same as the o1js keccak release
  - Now the input type is only Bytes which take string bytified or number as bytes directly.
  - I learned a lot about using advanced types in o1js
    - The bytes input are flexible but the size of the bytes should static and declared inside the contract!
    - Update test-util random input generator for both strings and Uint8array type
    - Omit redundant code that separated between string and Field input types
    - Update tests and verify integrity
    - check that project code is functional, provable, and deployable.
  - constraint logs are showing an error, maybe the Circuit API is not yet updated to the Bytes provable type
  - After a lot of debugging --> all other scripts work
    - Deployable main.ts
    - ProofsEnable Deployable main.ts
    - zkcontract tests
    - witness-time script
    - benchmarks

### DAY7: 18th January

- Use `bytesToWord` and `wordToBytes` functions using code imported from `./o1js/src/lib/gadgets/bit-slices.ts`.
- Set the main o1js sha256 output to bytes to be compliant with the o1js sha3 release.
- Change index.ts to handle bytes output as a poseidon digest => enables single field assertion.
- Adapt zkcontract and main.ts code for successfull deployment
- All tests pass but benchmarks show that the sha256 is two times slower than before which raises a big question for me.
- The constrainSystem file for sha256 is still not running, which still gives me supspicions about Bytes32 compatibility with the o1js Circuit API.
- Learn more about o1js advanced types and realize that `Provable.array(ProvableType, num)` solves the issue I pointed to yesterday about array non-compliance with `Provable.witness`
- After the changes I made follwing sha3 release
  - The code became more flexible with the bytes capacity
  - The o1js sha256 becomes 2x slower than before
  - It is more difficult to use --> even for me as a developer to debug and adapt changes
  - --> I think the best input handling format should be sth similar to Poseidon.hash by get an array of fields.

### DAY8: 19th January

- Sort order of preprocessing functions.
- Update all bitwise functions to use UInt32 type instead of Field for better size assertion.
- Convert all 32 bit words from implicit Field to UInt32 type.
- Utilize native bitwise function such as rotate and rightShift directly from UInt32 methods.
- Remove redundant bitwise function declarations.
- Update sha256 circom implementation regarding that it imports functions commonly from **preprocessing.ts**
- Fix addMod32 to not use UInt32 because addition in UIn32 doesn't overflow.
- Bechmarks show that sha256 is 60% faster than the one from the last commit.
- It is amazing how the o1js added many useful perks in the last release.
- Further debugging for sha256 using Circuit API but still not running.

### DAY9: 22th January

- Integrate logs in test utility Timer class.
- Now it accepts an optional title in the constructor and logs it with executionTime when end() method is called
- I wonder if there is a direct method like `assertEquals` for the provable Bytes class.
- Add SHA256 ZkProgram instance
  - It includes logs for compile, proving, and verification time
  - It asserts on the integrity of the digest output.
- Tweak bitwise functions tests
  - The tests were based on the `Gadgets.rotate` method whereas now is changed to be adapted to `UInt32` type instead of Field
  - Bitwise rotate and shift are used directly from o1js but the tests are kept in case of experimentation in the future.
  - All tests pass

### DAY10: 28th January

- In order to use the SHA256 as updatable hash function --> Add update method
- Add SHA256 class that is restructuring of the single function into a class to enable adding update method.
  - update method is a chained method that returns an instance of the SHA256 class.
  - in other words, when hashing a single input, we initialize the function with nothing-up my sleeve words; on the otherside the update method set the digest word as the initial state for a new input.
- It was difficult to have the gist of how things work with chained instances of class to have a running update method.
- The update method when used as `let digest = new SHA256().update(input).digest()` works fine with a single input.
- The update method method doesn't output expected digest results when trying to chain different scattered bytes
  - Add sliding window tests for this purpose following [noble-hashes tests](https://github.com/paulmillr/noble-hashes/blob/main/test/hashes.test.js)
  - The tests confirm that the newly added update method is not consistent.
- The work took a lot of time, so I will try to make it work tommorrow.
- The good thing about the update method, is that it can also be used as a mixer of bytes thanks to the avalanche effect and many other use cases.

### DAY11: 31th January

- Rewrite the SHA256 class all over again
  - The class used simulating [noble-hashes](https://github.com/paulmillr/noble-hashes/blob/main/src/sha256.ts) implementation was running but the integrity of the digest for a single update works fine but not for chained updates.
  - The class had a lot of noise on the circuit regarding that a normal TS implementation is focused on buffer optimization, therefore it made it a lot more difficult to tweak the code.
  - A SHA256 implementation having an update method is quite different than a direct hash function, and due to the avalanche effect, it would take a lot of time to debug the implementation all over again!
  - I gave it more chance, I tweaked the code, I debugged, but nothing changed. I decided to try out a different method otherwise, I am gonna dump the class.
  - Eventually, I found this [stablelib-sha256](https://github.com/StableLib/stablelib/blob/a7bac13/packages/sha256/sha256.ts#L148) implementation that is clearer to understand and have less related buffer complexity.
  - After adapting the code here and there, the class had the same issue but later after adapting o1js bitwise conversion to the class, the class outputs the correct digest everytime.
  - I added some code at the bottom of the file to verify the the class
    - Outputs the correct digest
    - Takes roughly the same time as before
    - Is provable

### DAY12: 1st February

- Move SHA256 to a separate file.
  - Refactor code.
  - Wrap utility functions as private methods inside the class.
  - Add documentation for the methods.
- Fix sliding windows tests 3/256 after adding the update method existing in the SHA256 class.
  - Verify test functionality --> takes around 1.5 hours to finish.
  - Remove testing logs in the `sha256-class.ts` file.
- Add script for `zkprogram` summary --> `npm run summary` to log:
  - number of rows
  - compile time
  - proving time
  - verification time
- Update the benchmark file by replacing SHA3 with the newly released SHA256 function by the o1js team.
  - the released SHA256 is 25% faster than my implementation.
  - after having a look on the source code, I can see that the team used custom gates and optimization on the sigma functions
    - this would make code run faster as I verified the effect of custom gate optimization on the SHA2 efficiency
    - I wish I could learn to do sth similar, unfortunately, I can't see any documentation of how can that be done!
- Update circom comparator documentation.
- Update benchmarks readme.
- Delete zkcontract.test.ts file & Polish main.ts file.
- Lint main src directory files.