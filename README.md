# Ethereum Meta-Transaction 
A smart contract to enable meta-transactions on Ethereum.

## Test Deployments
- Rinkeby Deployment `Forwarder.sol`: [0x2b363DdED2DD246E7A9EA3ce2FbCa4eb5b3Ab8De](https://rinkeby.etherscan.io/address/0x2b363DdED2DD246E7A9EA3ce2FbCa4eb5b3Ab8De)
- Rinkeby Deployment `SimpleForwarder.sol`: [0xF38f75f81E06d45D9675b3d0Ed7a354b9Bc67915](https://rinkeby.etherscan.io/address/0xF38f75f81E06d45D9675b3d0Ed7a354b9Bc67915)
  - First successful meta-transaction 😎: [0x688981e072c6222f3d826f648826700c3a963de09ac1f314dc2a666e730ff0ea](https://rinkeby.etherscan.io/tx/0x688981e072c6222f3d826f648826700c3a963de09ac1f314dc2a666e730ff0ea)

=> Before we can enable `transferFrom` meta-transactions for ERC20 tokens, the signer needs to call `approve` the `SimpleForwarder` contract to transfer tokens on it's behalf. This function call must be sent as a separate meta-transaction before the `transferFrom` function call to enable a successful transfer. Further checks need to be implemented who can whitelist addresses and who can execute the function `forward`.

## Generate `calldata`
Run `node scripts/web3js-calldata.js` to generate the `calldata`.
> `calldata` is where data from external calls to functions is stored. Functions can be called internally, e.g. from within the contract, or externally. When a function's visibility is external, only external contracts can call that function. When such an external call happens, the data of that call is stored in `calldata`.
