# Strudel Contracts

Find all relevant contracts in the `/contracts`. Subfolders contain interfaces and supporting logic to interact with:
- balancer: manage the configurable rights pool 
- erc20: token related stuff that couldn't be pulled from OZ
- mocks: contracts used for tests
- summa-tx: the BTC block header relayer contract was written and is operated by summa
- uniswap: we use pairs and different peripheral libraries

## Usage

```sh
yarn
yarn build
yarn test
```


## Usecases

Explaining some contract relationships:

### Bridge User
![strudel on-chain user stories (3)](https://user-images.githubusercontent.com/659301/95352480-91ef7880-08c2-11eb-8b68-7d41b5fc6c8d.png)

### Farmer
![strudel on-chain user stories (4)](https://user-images.githubusercontent.com/659301/95352481-91ef7880-08c2-11eb-9879-04b2dfc42851.png)
