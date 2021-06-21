// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "hardhat/console.sol";

contract SimpleForwarder {
  using ECDSA for bytes32;
  
  mapping(address => bool) private isWhitelisted;

  //-------------------------------------------------------
  // FOR TESTING PURPOSES - TO BE DELETED LATER!
  string greeting;
  constructor(string memory _greeting) {
    greeting = _greeting;
    console.log(greeting);
  }

  function greet() public view returns (string memory) {
    return greeting;
  }

  function setGreeting(string memory _greeting) public {
    greeting = _greeting;
  }
  //-------------------------------------------------------

  // Verify the data and execute the data at the target address
  function forward(address _to, bytes calldata _data, bytes memory _signature) external returns (bytes memory _result) {
    bool success;
    
    verifySignature(_to, _data, _signature);
    
    (success, _result) = _to.call(_data);
    if (!success) {
      // solhint-disable-next-line no-inline-assembly
      assembly {
        returndatacopy(0, 0, returndatasize())
        revert(0, returndatasize())
      }
    }
  }
  
  // Recover signer public key and verify that it's a whitelisted signer.
  function verifySignature(address _to, bytes calldata _data, bytes memory signature) private view {
    require(_to != address(0), "invalid target address");
    
    bytes memory payload = abi.encode(_to, _data);
    address signerAddress = keccak256(payload).toEthSignedMessageHash().recover(signature);
    require(isWhitelisted[signerAddress], "Signature validation failed");
  }
  
  function addToWhitelist(address _signer) external {
      isWhitelisted[_signer] = true;
  }
}
