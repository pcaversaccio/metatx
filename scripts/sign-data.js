// Author: Pascal Marco Caversaccio
// E-Mail: pascal.caversaccio@hotmail.ch

// -------------------IMPORTS------------------- //
let Web3 = require('web3'); // Add the web3 node package
let ethUtil = require('ethereumjs-util'); // 'ethereumjs-util' is a collection of utility functions for Ethereum
let sigUtil  = require('eth-sig-util'); // 'eth-sig-util' is a small collection of Ethereum signing functions
const config = require('./data-config.json'); // Include the network-specific configurations
const contractAbi = require('./ABI/Forwarder.json'); // Import the contract ABI of the smart contract
const BigNumber = require('bignumber.js'); // Add the bignumber.js node package
const { EIP712Domain } = require('./helper.js'); // Add some helpers

// -------------------PARAMETERS------------------- //
// Load the Infura project ID, the private key & address for the `owner` parameter needed for the signature
const { projectId, privateKey, owner } = require('./../secrets.json');

const chain = 'rinkeby'; // Define the chain for which the data should be generated
const web3 = new Web3(`https://${chain}.infura.io/v3/${projectId}`); // Initiate the web3 object using the Infura project ID
const tokenAddress = config[chain].verifyingContract; // Set the deployed token contract address
const tokenContract = new web3.eth.Contract(contractAbi, tokenAddress); // Initiate the web3 contract object
const chainId = config[chain].network_id; // Defining the chain ID (e.g. Rinkeby, Ropsten, Ethereum Mainnet)
const name = config[chain].name; // Defining the domain name
const version = config[chain].version; // Defining the current version of the domain object
const value = 0; // Amount of ether to transfer to the destination
const gas = config[chain].gasLimit; // Amount of gas limit to set for the execution
const from = owner; // Externally-owned account (EOA) making the request
const to = config[chain].toContract; // Destination address, normally a smart contract
let tokenValue = new BigNumber(1 ** 18); // Token amount to be transferred (and the spender is permitted)
tokenValue = tokenValue.toFixed(); // Convert to number
const toAddr = config[chain].toAddress; // Target address of the token transfer

// -------------------CALLDATA------------------- //
// Get the function signature by hashing it and retrieving the first 4 bytes
// The first four bytes of the calldata for a function call specifies the function to be called
// It is the first (left, high-order in big-endian) four bytes of the Keccak-256 hash of the 
// signature of the function. Now since 1 nibble (4 bits) can be represented by a hex digit,
// 1 byte == 2 hex digits => 4 bytes == 8 hex digits
let fnSignatureTransfer = web3.utils.keccak256('transferFrom(address,address,uint256)').substr(0, 10);

// Encode the function parameters
let fnParamsTransfer = web3.eth.abi.encodeParameters(
  ['address', 'address', 'uint256'],
  [owner, toAddr, tokenValue]
);

// Add the encoded function parameters to the calldata
// Also, remove the hex '0x' prefix for the encoded parameters since the function signature already contains it
data = fnSignatureTransfer + fnParamsTransfer.substr(2);

tokenContract.methods.getNonce(owner).call().then(res => {
  const nonce = res; // Setting the nonce needed for the signature (replay protection)

// -------------------FORWARDREQUEST PARAMETERS------------------- //
// Defining the general ForwardRequest struct
const ForwardRequest = [
  { name: 'from', type: 'address' },
  { name: 'to', type: 'address' },
  { name: 'value', type: 'uint256' },
  { name: 'gas', type: 'uint256' },
  { name: 'nonce', type: 'uint256' },
  { name: 'data', type: 'bytes' },
];

// Defining the ForwardRequest data struct values as function of `verifyingContract` address 
const buildData = (verifyingContract) => ({
  primaryType: 'ForwardRequest',
  types: { EIP712Domain, ForwardRequest },
  domain: { name, version, chainId, verifyingContract },
  message: { from, to, value, gas, nonce, data },
});

const forwardRequest = buildData(tokenAddress); // Build the final data struct

// -------------------SIGNATURE------------------- //
const signature = sigUtil.signTypedData_v4(Buffer.from(privateKey, 'hex'), { data: forwardRequest }); // Generate the signature

console.assert(ethUtil.toChecksumAddress(owner) == ethUtil.toChecksumAddress(sigUtil.recoverTypedSignature_v4({data: forwardRequest, sig: signature}))); // Assert that the `owner` is equal to the `signer`
console.log('----------------------------------------------','\n');

// -------------------INPUT PARAMETERS FOR EXECUTE TRANSACTION------------------- //
console.log('payableAmount (ether): ' + value, '\n');
console.log('req (tuple): ' + '[' + '"' + from + '"' + ', ' + '"' + to + '"' + ', ' + '"' + value + '"' +
', ' + '"' + gas + '"' + ', ' + '"' + nonce + '"' + ', ' + '"' + data + '"' + ']', '\n');
console.log('signature (bytes): ' + signature, '\n');

// -------------------DECODE INPUT PARAMETERS FROM CALLDATA FOR TESTING------------------- //
const decodedParams = web3.eth.abi.decodeParameters(['address', 'address', 'uint256'], '0x' + data.substr(10));
console.assert(decodedParams[0] == ethUtil.toChecksumAddress(owner) && decodedParams[1] == ethUtil.toChecksumAddress(toAddr) && decodedParams[2] == tokenValue);
});
