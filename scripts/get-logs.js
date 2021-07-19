// Author: Pascal Marco Caversaccio
// E-Mail: pascal.caversaccio@hotmail.ch

// -------------------IMPORTS------------------- //
let Web3 = require('web3'); // Add the web3 node package
const fs = require('fs'); // // Requiring fs module in which writeFile function is defined

// -------------------PARAMETERS------------------- //
const rpc = 'https://rpc.sustainabilitychain.ch'; // Define the rpc connection
const web3 = new Web3(rpc); // Initiate the web3 object using the Infura project ID
const contractAddressIMD = '0xfEC6Ae9cA6656e534E8d2B8813718401C7823079'; // IMD smart contract address
const contractAddressPCT = '0x62DAE5fD87368F56aF3D576D4837523429DcE2b1'; // PCT smart contract address

// -------------------RETRIEVE LOGS------------------- //

// Impact Dollar (IMD)
web3.eth.getPastLogs({ 
    fromBlock: 0,
    toBlock: 'latest',
    address: contractAddressIMD
}).then(data => fs.writeFile('../metatx/scripts/IMD.json', JSON.stringify(data), (err) => {
    if (err) throw err;
}));

// Porini Community Token (PCT)
web3.eth.getPastLogs({ 
    fromBlock: 0,
    toBlock: 'latest',
    address: contractAddressPCT
}).then(data => fs.writeFile('../metatx/scripts/PCT.json', JSON.stringify(data), (err) => {
    if (err) throw err;
}));
