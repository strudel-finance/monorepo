# Sierra Retarda

A more efficient implementation of the btcRelay.

## Installation

Install dependencies:

```bash
yarn install
```

Build the contracts and interfaces:

```bash
yarn build
```

## Testing

Run the tests:

```bash
yarn test
```

## API Spec

GET api/blockInclusionProof/{height}

```
{
	proof: [0x123, 0x234]
	header: 0x1234
}
```


## DB Layout

| primary key | hash       | headerData  |
|-------------|------------|-------------|
| 0           | 0x0234..32 | 0x02345..80 |
| 1           | 0x1234..32 | 0x12345..80 |
| 2           | 0x2345..32 | 0x23456..80 |
| 3           | 0x3234..32 | 0x32345..80 |
| 2-3         | 0x1234..32 |             |
| 0-1         | 0x1234..32 |             |
| 0-3         | 0x1234..32 |             |


assumption: current block height is 7
requesting proof for block at position (POS):
- POS / 2 is even, so we look up neighbour on the right (3), put in proof array
- POS / 2 / 2 is uneven, hence we taken the neighbour on the left (0-1)
	- if (0-1) can be found in db, put in in the proof array, if not, calcurate it
		- get left half hash
		- get right half hash
		- hash together, store in db, and return
- POS / 2 / 2 / 2 is even, so we look up the neighbour on the right (4-7)
	- if (4-7) can be found in db, put in in the proof array, if not, calcurate it
		- get left half hash
		- get right half hash
		- hash together, store in db, and return
- once we have reached the current height, return proof


## contract cost analysis:

- finding previous header: 11k
- calcurate target: 25k
- check epoch (not match): 150
- extract prevHash: 2300
- itterating position pointers to 30 instead of 4: 15k
- calculating block hash: 2500

