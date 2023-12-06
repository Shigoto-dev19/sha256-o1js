# MINA Naviagator Program

## Progress Report --> December

### DAY1
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
