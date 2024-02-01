### Iterations = 2500

| Hash Function           | Operations/sec       | Average Time/op  | Min Time | Max Time | Variability |
|-------------------------|----------------------|------------------| -------- | -------- | ----------- |
| o1jsSha256Released      | 267 ops/sec          | 3ms/op           |    -     |    -     |      -      |
| myO1jsSha256            | 244 ops/sec          | 4ms/op           |    -     |    -     |      -      |
| myO1jsSha256Circom      | 4 ops/sec            | 223ms/op         |    -     |    -     |      -      |
| nodeSha256              | 309,501 ops/sec      | 3μs/op           |   2μs    |   327μs  |   ± 8.46%   | 
| nobleSha256             | 158,127 ops/sec      | 6μs/op ± 9.56%   |   3μs    |   671μs  |   ± 9.56%   |
