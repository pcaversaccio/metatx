// SPDX-License-Identifier: MIT
// Further information: https://eips.ethereum.org/EIPS/eip-2770
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @dev For general development-related debugging, we implement Hardhat's console.log. 
 * This import can be deleted for the final deployment.
 */
import "hardhat/console.sol";

/**
 * @title Forwarder Smart Contract
 * @author Pascal Marco Caversaccio, pascal.caversaccio@hotmail.ch
 */

contract Forwarder is Ownable, Pausable {
    using ECDSA for bytes32;

    struct ForwardRequest {
        address from;       // Externally-owned account making the request.
        address to;         // Destination address, normally a smart contract.
        uint256 gas;        // Amount of gas limit to set for the execution.
        uint256 nonce;      // On-chain tracked nonce of a transaction.
        bytes data;         // Calldata to be sent to the destination.
    }

    mapping(address => uint256) private _nonces;
    mapping(address => bool) private senderWhitelist;

    event MetaTransaction(address indexed from, address indexed to, bytes indexed data);

    constructor () {
        address msgSender = msg.sender;
        addSenderToWhitelist(msgSender);
    }

    function getNonce(address from) public view returns (uint256) {
        return _nonces[from];
    }

    function verify(ForwardRequest calldata req, bytes calldata signature) public view returns (bool) {
        address signer = keccak256(abi.encode(
            req.from,
            req.to,
            req.gas,
            req.nonce,
            req.data
        )).toEthSignedMessageHash().recover(signature);
        return _nonces[req.from] == req.nonce && signer == req.from;
    }

    function execute(ForwardRequest calldata req, bytes calldata signature) public whenNotPaused() returns (bool, bytes memory) {
        require(senderWhitelist[msg.sender], "Forwarder: sender of meta-transaction is not whitelisted");
        require(verify(req, signature), "Forwarder: signature does not match request");
        _nonces[req.from] = req.nonce + 1;

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returndata) = req.to.call{gas: req.gas}(req.data);
        
        if (!success) {
            // solhint-disable-next-line no-inline-assembly
            assembly {
            returndatacopy(0, 0, returndatasize())
            revert(0, returndatasize())
            }
        }

        // Validate that the relayer has sent enough gas for the call.
        // See https://ronan.eth.link/blog/ethereum-gas-dangers/
        assert(gasleft() > req.gas / 63);

        emit MetaTransaction(req.from, req.to, req.data);

        return (success, returndata);
    }

    // Destroy the Forwarder contract and transfer all ether to a pre-defined payout address.
    function killForwarder(address payable payoutAddress) public onlyOwner() {
        payoutAddress.transfer(address(this).balance);
        selfdestruct(payoutAddress);
    }

    // Only whitelisted addresses are allowed to broadcast meta-transactions.
    function addSenderToWhitelist(address _sender) public onlyOwner() {
      senderWhitelist[_sender] = true;
    }
}
