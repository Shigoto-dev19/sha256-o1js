# MINA Naviagator Program

## Progress Report --> December

### DAY1: 6th December
- Resume with the project from the last stage of the ZK-Hack Hackathon submission.
- The main hash function wasn't running due to the overflow of bits.
- The reason was that the bitwise gadgets from o1js were hardcoded for 64-bit fields.
- In general, I was persistant on fixing the o1js gadgets with no successful attempt again:
    - It is not clear how custom gates were developed.
    - For range checks: The concept of 2-bit & 12-bit limbs was abstract and I could not find any explanation of such an approach.
    - Witness slicing used in bitwise functions is a surprsingly new function for me as a zk-developer and it wasn't clear how this functionality serve as an optimization factor.
    - The use of unexported and undocumented utilities from 'common.js' for instance, and other files was an additional barrier to understanding the mechanism of how the gadgets were developed.
    - Overall, I think it would be beneficial to document and explain such specific gadgets, so that onboarding developers learn and simulate developing efficient and functional utilities or understand the concept to tweak some code for specific use cases.
- I took the same decision and continued using the bitwise functions with logic similar to the bitwise templates in circom.
- After debugging, I found out that a truthy assertion for the control flow of the "bitwiseAdditionMod32" function wasn't always checking and caused overflow of Field addition --> I fixed by comparing after converting "Field"s into "bigint"s.
- After revisions, the hash function finally compiles with no errors.
- I added a parser and debugged to check the integrity of digests.
- I am getting a 256-bit digest but it is not the expect result.
- Finally had some satisfying results and decided to keep working on code semantics on DAY2.


### DAY2: 7-8th December
- The Hash function compiles, but the result is different from the expected digest, that means that some bitwise operation is wrong somewhere, which is quite difficult to track regarding that there is a lot of bitwise operations required for the SHA256 compression function.
- I took the approach to test the bitwise functions one by one in order to start eliminating the source of semantic error.
- Add tests for the rotate right bitwise function.
- Add tests utilities for bitwise functions.
- Add tests for the shift right bitwise function.
- Add tests for the choice(ch) bitwise function.
- Realized that SHA256 uses the "big-endian" convention but bitifying field in o1js uses the "little-endian" convention, I thought it was a problem but there is no need to reverse endianess since return a field take also the "LE" convention.
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