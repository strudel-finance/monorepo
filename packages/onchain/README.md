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

Good place to understand contract relationships:

### Relayer
![strudel on-chain user stories (2)](https://user-images.githubusercontent.com/659301/95352479-9156e200-08c2-11eb-876f-d08e7de6d803.png)

### Bridge User
![strudel on-chain user stories (3)](https://user-images.githubusercontent.com/659301/95352480-91ef7880-08c2-11eb-8b68-7d41b5fc6c8d.png)

### Farmer
![strudel on-chain user stories (4)](https://user-images.githubusercontent.com/659301/95352481-91ef7880-08c2-11eb-9879-04b2dfc42851.png)

### Governance part 1
![strudel on-chain user stories (5)](https://user-images.githubusercontent.com/659301/95352484-92880f00-08c2-11eb-8356-9389ae63b8f9.png)

### Governance part 2
![strudel on-chain user stories (6)](https://user-images.githubusercontent.com/659301/95352486-92880f00-08c2-11eb-8228-fd9fa06f7e3a.png)
