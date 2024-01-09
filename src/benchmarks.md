### Iterations = 2500

| Hash Function      | Operations/sec  | Time per Operation | Min Time | Max Time |Variability | 
| -------------------| ----------------| ------------------ | -------- | -------- | -----------|
| o1jsSha256Circom   | 6 ops/sec       | 149ms/op ± 1.34%   | 105ms    | 392ms    | ± 1.34%    |
| o1jsSha256Gadgets  | 334 ops/sec     | 2ms/op ± 1.56%     | 1ms      | 12ms     | ± 1.56%    |
| nodeSha256         | 331,785 ops/sec | 3μs/op ± 14.46%    | 1μs      | 515μs    | ± 14.46%   |
| nobleSha256        | 146,370 ops/sec | 6μs/op ± 28.78%    | 1μs      | 2ms      | ± 28.78%   |
