# MINA Naviagator Program

## Progress Report --> December

### DAY1: 6th December

- Resume with the project from the last stage of the ZK-Hack Hackathon submission.
- The main hash function wasn't running due to the overflow of bits.
- The reason was that the bitwise gadgets from o1js were hardcoded for 64-bit fields.
- In general, I was persistant on fixing the o1js gadgets with no successful attempt again:
  - It is not clear how custom gates were developed.
  - For range checks: The concept of 2-bit & 12-bit limbs was abstract and I could not find any explanation of such an approach.
  - Witness slicing used in bitwise functions is a surprsingly a new function for me as a zk-developer and it wasn't clear how this functionality serve as an optimization factor.
  - The use of unexported and undocumented utilities from 'common.js' for instance, and other files was an additional barrier to understanding the mechanism of how the gadgets were developed.
  - Overall, I think it would be beneficial to document and explain such specific gadgets, so that onboarding developers learn and simulate developing efficient and functional utilities or understand the concept to tweak some code for specific use cases.
- I took the same decision and continued using the bitwise functions with logic similar to the bitwise templates in circom.
- After debugging, I found out that a truthy assertion for the control flow of the "bitwiseAdditionMod32" function wasn't always checking and caused overflow of Field addition --> I fixed by comparing after converting "Field"s into "bigint"s.
- After revisions, the hash function finally compiles with no errors.
- I added a parser and debugged to check the integrity of digests.
- I am getting a 256-bit digest but it is not the expected result.
- Finally had some satisfying results and decided to keep working on code semantics on DAY2.

### DAY2: 7-8th December

- The Hash function compiles, but the result is different from the expected digest, that means that some bitwise operation is wrong somewhere, which is quite difficult to track regarding that there is a lot of bitwise operations required for the SHA256 compression function.
- I took the approach to test the bitwise functions one by one in order to start eliminating the source of semantic error.
- Add tests for the rotate right bitwise function.
- Add tests utilities for bitwise functions.
- Add tests for the shift right bitwise function.
- Add tests for the choice(ch) bitwise function.
- Realized that SHA256 uses the "big-endian" convention but bitifying field elements in o1js uses the "little-endian" convention.
  - I thought it was a problem but there is no need to reverse endianess since return a field take also the "LE" convention.
- All in all, I figured out testing with o1js using jest. I will keep testing the rest of the bitwise function on DAY3.

### DAY3: 10th December

- Resume adding tests for bitwise functions to check integerity for each operation separately.
  - Add tests for the majority bitwise function.
  - Add tests SHA256 σ0 bitwise function.
  - Add tests for SHA256 σ1 bitwise function.
  - Add tests for SHA256 Σ0 bitwise function.
  - Add tests for SHA256 Σ1 bitwise function.
  - Add tests for Addition Modulo 32 function.
- All unit bitwise function work seamlessly asserted to common JS bitwise functions used in [verified SHA256 code](https://www.movable-type.co.uk/scripts/sha256.html).
- Check endianess compliance here and there but still the same problem.
- Suspect error source from preprocessing . I will start testing preprocessing outputs on DAY4.
- Testing code is quite practical when developing zkapps but is not compliant with provable code debugging, that means that tests may pass semantically as normal TS code but it may not be deployable i.e. provable(circuit).

### DAY4: 12th December

- Add tests for binary conversion
  - Check that converting a string to binary works as expected.
  - Check that converting a number to binary works as expected.
  - Check that the padding function output is the same as in **FIPS PUB 180-4** ('abc' digest example);
- My approach was to check the integrity of binary conversions for a known verified example such as 'abc' to track the error source.
- It took me a lot of time to find a strategy to eliminate probable bugs dealing with the complicated SHA256 algorithm with focus on preprocessing.
- It seems everything works fine
  - I checked endianess of Fields again --> ok
  - I did some log checks on the overall preprocessing --> ok
  - The digest is in the wanted range of bits: 256 bits --> no problem with parsing --> ok
- I still cannot figure out the source error of non-compliant digests. I will start a deep analysis of the SHA256 computation on DAY5.

### DAY5: 13-15th December

- It is starting to feel hitting a wall for not finding the error source after three days of work so I decided to clear my mind and take a step back organising my code to make it partitioned and more readable.
- Move the `bitwiseAdditionMod32` function from "preprocessing.ts" to "functions.ts" file.
- Add preprocessing tests for empty string case.
- Add `BinaryString` type to inhibit confusion from the casual _string_ type from a string of binary number.
  - **NOTE:** This type is set now for readability but later it will be set as constrainted generic subtype of string that contains only '0' and '1' such as '0101010110011110'.
- Add new file `utils.ts` that contains all binary conversion utilities
  - Move `binaryToHex` function from **index.ts** to **utils.ts** file.
  - Move `bstringToBoolArray`, `stringToBoolArray` and `numberToBoolArray` functions from **preprocessing.ts** to **utils.ts** file.
  - Merge `bstringToBoolArray`, `stringToBoolArray` and `numberToBoolArray` into a single function called `toBoolArray` that is type dependant.
  - Move `generateRandomString` from **preprocessing.test.ts** file to **utils.ts** file.
  - Add `boolArrayToBinaryString` function that converts an array of o1js Bool type into a binary string type.
  - Remove `binaryToArray` function and use _BinaryString'ified_ ouputs of `toBinary` function --> this helps refactor and make the tests more readable.
- TODO: Check integrity of message blocks H^i one by one to track source error for input=string=empty.

### DAY6: 16th December

- After investigating the SHA256 message blocks attentively, I noticed that the initial hashes weren't compliant following the expected initial hashed H. The problem was not assigning the initial hashed due to a hilarious mistake.
  - Setting `H = initialHashes`:
    - This makes H reference the same array as initialHashes.
    - Changes made to the elements of W or H will affect both arrays because they are the same array in memory.
  - Setting `H = [...initialHashes]`:
    - This creates a new array W with the same elements as H.
    - Changes made to the elements of W will not affect H, and vice versa.
  - This small mistake in assigning inital hashes is what caused the wrong digests all the time.
  - Because SHA256 has the avalanche effect, a small change always produced a significantly different hash value
  - This effect made it very difficult to track the error source.
- Add `generateRandomNumber` & `generateRandomInput` functions as test utilities for random input generation for testing the main sha256 function.
- Add tests for the main sha256 hash function
  - Test against [NIST Test Vectors](https://www.di-mgt.com.au/sha_testvectors.html);
  - Test against node-js sha256 implementation.
  - TODO: Add chained tests & sliding windows tests following the noble approach by paul millr

### DAY7: 17th December

- Add chained tests and sliding windows tests following [noble approach to testing](https://github.com/paulmillr/noble-hashes/blob/main/test/README.md)
  - The tests take a long time to finish in general.
  - The sliding window tests pointed into a bug in the utility function `toBoolArray` that input as string that contain zeros and ones are processed as a `BinaryString` type which made the test fail.
  - Overall, it is reassuring the the o1js SHA256 hash function works seamlessly.
  - I spend time to add the seperated sliding window 768=256\*3 following three separated 256-window test but I realized that this test requires update method for the hash function which is a continuation of hash computation starting from a given message block.
  - For now, this is not a top priority feature to add that's why I decided not to work on it any further.
- Following the error found after running the new tests
  - Add a new function `binaryStringToBoolArray` seperated from the original `toBoolArray` function in **utils.ts** file.
- TODO:
  - Refactor bitwise tests
  - Refactor preprocessing tests
  - Refactor sha256 tests
  - Fix notations and make them more readable

### DAY8: 18th December

- Seperate utility functions to be binary & test specific
  - **utils.ts** is renamed as `binary-utils.ts`.
  - `generateRandom{Number, String, Input}` functions are moved from **binary-utils.ts** to **test-utils.ts**
  - `nodeHash` and `o1jsHash` functions are moved from **sha256.test.ts** to **test-utils.ts** file.
- Add **command.ts** file that logs the digest & execution time for `{ o1js, node, noble}Hash` functions.
  - `npm run build && node build/src/command.js <INPUT>` to run the file and hash an input in the cli directly.
  - Add `nodeHash` function imported from [noble-hashes package](https://www.npmjs.com/package/@noble/hashes) to compare o1js hash function compared to its renown efficiency.
    - Note: For now it seems that o1js hash function is 100 slower than node or noble's!
    - TODO: This will be a future optimization work in the month of January for the Mina navigator program.
- Start polishing binary-utils and bitwise tests

### DAY9: 19th & 25th December

- Refactor bitwise tests
  - Utilize testing function that test o1js compatible functions against native TS/JS verified functions.
    - Improves readability.
    - Reduces lines of code.
  - Move TS/JS tester bitwise functions inside each testing block.
  - Move helper bitwise functions to `test-utils.ts`
  - Polish code by improving notations here and there.
- Check and do small refinements to `preprocess.test.ts`.
- Refactor sha256 tests
- Adapt `test-utils.ts` file to the tests changes.
  - Organize functions
  - Document code for better organized/understandable functionality
- This step is very important to proceed optimizing code in the next month
  - Tests should be readable and easy to understand.
  - Any change should be detectable in tests.
  - Tests should be polished with no additional work required for the next stage.
- TODO:
  - Polish {functions, preprocess}.ts notations.
  - Add smart contract interaction example/tests

### DAY10: 26-27th December

- Learn about zkapp smart contracts and interaction.
- Add the smart contract having inital hash state to be the digest of 'o1js' as input.
- Set the config to deploy the smart contract.
- Encounter a deploy error
  - error: `Failed to find the "Sha256" smart contract in your build directory.`
  - Spend time trying to debug the error
  - Open a question post on discord
- Restructure the files for better separation of smart contract and the rest of the code.
- Add interact file called `zkcontract.test.ts`
  - The code deploys the smart contract locally, sets the initial hash of a preimage, and tests after hash with the contract.
  - This file helped me debug the smart contract.
  - At first the errors were abstract, then adding try/catch blocks helped with more verbose error logs
  - Adapt the code to have error-free smart contract.
    - mainly complained about input type => it should be a Field
    - I am not sure why it complains about `Array\<Field> `or `Array\<Bool>` --> No note found about this statement.
    - Padding from preprocessing is shifted out of the smart contract since it is one step that parses the input and prepares for the hash circuit.
    - Padding generates a 512-bit block that's why the hash smart contract input now takes 4 field elements (128-bit each)
  - Encounter an error `getAccount: Could not find account for public key B62qmHf3f1iKf6wYn9fyiSuW8xiX7DhkqzVpPRX81xYb2RHZEBH5YVk`.
  - Spend time debugging again
- This day helped learning about MINA smart contracts but it made me realize that the documentation is scattered and not straightforward about many details.
  - My knowledge in Circom2 development helped me keep the smart contract in frame but debugging a smart contract is a painful process as compilation errors are not very directive.
  - The MINA documentation page doesn't include detailed examples about a full process of deployment and other possible options.
  - There should be a better CLI and Framework for such a process, solana CLI would be a good example.
  - A seperation of client side interaction tooling, smart contract i.e. circuit developement should clearer regarding that error logs can be too vague.

### DAY11: 28th December

- Find error about using `field.toBigInt()` inside provable code.
  - Solve problem with `Provable.witness(Field, callback)` method.
- Find error about input parsing
  - should handle multiple 512-bit blocks after adapting code to be smart contract compatible
- Add test for preprocessing long inputs after padding(>1 512-bit blocks)
- Understand the utility of `Provable.witness` & `Provable.asProver`.
- Fix init smart contract method
  - Realize that both `init` and `@method` decorator only accept single Field arguments!!
- Try different method for smart contract deployment
  - zk contract tests
  - `main.ts` file for local deplyment
  - deploy to berkeley testnet
- The smart contract deplyment works when `proofsEnabled` is true but fails otherwise `FATAL ERROR: Reached heap limit Allocation failed`

### DAY12: 29-30th December

- Refactor command.js code and add script to package.json using `npm run digest <input>`
- Change notation of `RotR` and `ShR` provable functions into `rotateRight` and `shiftRight`
  - Change the test functions `rotateRight` and `shiftRight` inot `rotateRightNative` and `shiftRightNative` respectively.
  - Adapt notations inside `bitwise.test.ts` file.
- Add JSDoc documentation to `function.ts` o1js bitwise functions and change variable notation from snaked cased into camel cased.
- Polish preprocessing function
  - Document preprocessing functions with JSDoc comments.
  - Refactor preprocessing function names for improved clarity.
  - Update file imports to align with the revised preprocessing structure.
- Check & Polish the navigator report for december

## Feedback

- Considering that my project is technically complicated, I want to report that not every progress I did is manifested in code

  - Debugging a hash function is quite difficult and time-consuming process.
  - The shift to make code functional and then process to make it provably correct took more time than expected.
    - I simulated my knowledge in circom development to get the gist of it, still it is not verifiable till deployment.
    - It is neccessary to read source-code here and there and learna a lot of things from MINA development resources.
  - It takes time to get more familiar with the o1js embedded DSL.
  - I had to learn about zkapp limitations
    - These limitations were only seen after long debugging sessions having vague error logs
    - There is a limit in the size of a deployable zkapp
    - The smart contract method is quite unflexible when it comes to input types.

- I suggest that smart contract method input should support array of field with known length as in circom or Rust.
- I suggest to add array assertion whether for `Bool` or `Field` to the type/class prototype(similar to circom).
- I would like to have the option for constraint assertion to return Bool or a field element 1 or 0

  - This will help with conditional control flow
  - I might use the output for a binary combination as in circom
  - It would be flexible to assert on the output (1 or 0) indirectly
    - the case might be singular or for multiple output from different assertions.

- I see no explanation of difference between different o1js types considering my knowledge of zk development
  - I asked about this in the first `Learn & earn session`
  - Is `Bool` a full field element as `Field(0)` or `Field(1)`?.
    - Is it optimized compared to field?
    - I ask the same for the other `UINT` types.
    - If these types save constraints or reduce size of a full field element then how does that happen, that's quite interesting!
- I would like to learn coding my own custom gates with o1js
  - I see no documentation or proper explanation not in MINA documentation nor in source-code
  - It would be beneficial to have JSDoc to source-code in general
  - I kinda feel that it is for insider MINA developer who's been there for a while
    - I want the chance to learn fast and join as well :)
- I started my journey with learning cryptography and coding in circom that's why I feel my situation is somewhat different than other developers working on DApps.

- Deploy a SHA256 zkapp on live testnest or (proofsEnabled=true)
- Add bechmark comparator using [micro-bmark](https://github.com/paulmillr/micro-bmark) package.
- Mainly optimize the hash function for better efficiency.
  - Optimize the bitwise functions
    - adapt choice and majority bitwise functions similarly to circom sha256 template.
    - Do my own optimization, I still didn't look at the official o1js implementation because I want to learn and get the way through myself.
    - Compare my imlementation the imported o1js' one
    - Optimize the other bitwise functions: `rotateRight` and `shiftRight`
  - Research `UInt32` type and speculate whether it offers any improvement.
  - Use o1js advanced API to track the circuit constraints.
    - This will help me measure optimization progress
  - Learn to develop custom gates in case my implementation is still not efficient enough.
- OPTIONAL: Add more options to the SHA256 zkapp input(string | Field | number | bigint | other).
- Write January Report for MINA navigator program.
- Update README to be more explicit and user-friendly.
