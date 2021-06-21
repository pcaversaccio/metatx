# Ethereum Meta-Transaction
<p align="center">
  <img src="assets/img/Awl_Logo.png" alt="Awl Logo" width="30%" />
</p>

----------------------

## Background
A *meta-transaction* is a regular Ethereum transaction which contains another transaction, the actual transaction. The actual transaction is signed by a user and then sent to an operator (e.g. [Awl](https://appswithlove.com)) or something similar; **no gas and blockchain interaction required**. The operator takes this signed transaction and submits it to the blockchain paying for the fees himself. The contract ensures there's a valid signature on the actual transaction and then executes it.

<figure align="center">
  <img src="assets/img/metatx.png" alt="Meta-Transaction: Overview" width="70%"/>
  <figcaption>In the case of an <a href="https://eips.ethereum.org/EIPS/eip-20" target="_blank"><em>ERC-20</em></a> transfer, the <em>Signer</em> needs to approve the <em>Proxy</em> contract to transfer tokens on its behalf.</figcaption>
</figure>

### General High-Level Overview
If we want to support generalised meta-transactions in our contract, it can be done with a few simple steps. On a high-level, there are two steps to it.

**Step 1:** Verify the signature of the meta-transaction. We can do this by creating a hash following the [EIP-712](https://eips.ethereum.org/EIPS/eip-712) standard and `ecrecover`:
```solidity
bool isValidSignature = ecrecover(hash(transaction), v, r, s) == transaction.signerAddress
```

**Step 2:** Once verified, we can extract the actual transaction data. By using `delegatecall` on our current contract address, we execute a function in our current contract without doing a new contract call. Remember that `delegatecall` basically calls the contract's code but with the current contract's state. So by doing `address(this).delegatecall` we just execute all in our current contract and we can pass the transaction data along.
```solidity
(bool didSucceed, bytes memory returnData) = address(this).delegatecall(transaction.data);
```

## Some Test Deployments
- Rinkeby Deployment `Forwarder.sol`: [0x2b363DdED2DD246E7A9EA3ce2FbCa4eb5b3Ab8De](https://rinkeby.etherscan.io/address/0x2b363DdED2DD246E7A9EA3ce2FbCa4eb5b3Ab8De)
- Rinkeby Deployment `SimpleForwarder.sol`: [0xF38f75f81E06d45D9675b3d0Ed7a354b9Bc67915](https://rinkeby.etherscan.io/address/0xF38f75f81E06d45D9675b3d0Ed7a354b9Bc67915)
  - First successful meta-transaction 😎: [0x688981e072c6222f3d826f648826700c3a963de09ac1f314dc2a666e730ff0ea](https://rinkeby.etherscan.io/tx/0x688981e072c6222f3d826f648826700c3a963de09ac1f314dc2a666e730ff0ea)

=> Before we can enable `transferFrom` meta-transactions for ERC20 tokens, the signer needs to call `approve` the `SimpleForwarder` contract to transfer tokens on it's behalf. This function call must be sent as a separate meta-transaction before the `transferFrom` function call to enable a successful transfer. Further checks need to be implemented who can whitelist addresses and who can execute the function `forward`.

## Generate `calldata`
Run `node scripts/web3js-calldata.js` to generate the `calldata`.
> `calldata` is where data from external calls to functions is stored. Functions can be called internally, e.g. from within the contract, or externally. When a function's visibility is external, only external contracts can call that function. When such an external call happens, the data of that call is stored in `calldata`.

## References
[1] https://medium.com/coinmonks/ethereum-meta-transactions-101-de7f91884a06

[2] https://soliditydeveloper.com/meta-transactions

[3] https://docs.openzeppelin.com/contracts/4.x/api/metatx

[4] https://docs.opengsn.org/