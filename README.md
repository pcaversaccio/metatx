# Ethereum Meta-Transaction 

A smart contract to enable meta-transactions on Ethereum.

Rinkeby Deployment: [0x2b363DdED2DD246E7A9EA3ce2FbCa4eb5b3Ab8De](https://rinkeby.etherscan.io/address/0x2b363DdED2DD246E7A9EA3ce2FbCa4eb5b3Ab8De)

## Generate `calldata`
Run `node scripts/web3js-calldata.js`.
> `calldata` is where data from external calls to functions is stored. Functions can be called internally, e.g. from within the contract, or externally. When a function's visibility is external, only external contracts can call that function. When such an external call happens, the data of that call is stored in `calldata`.
