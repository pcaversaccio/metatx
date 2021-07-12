const HDWalletProvider = require('@truffle/hdwallet-provider'); // HD Wallet-enabled Web3 provider
const { projectId, seedPhrase, etherscanKey } = require('./secrets.json'); // Include the Infura API key, the wallet mnemonic, and the Etherscan API key
const config = require('./network-config.json'); // Include the network-specific configurations

module.exports = {
  // Configure our networks
  networks: {
    development: {
    	host: config.development.host,
      port: config.development.port,
    	network_id: config.development.network_id,
    },
    mainnet: {
      provider: () => new HDWalletProvider({mnemonic: {phrase: seedPhrase}, providerOrUrl: `${config.mainnet.url}/${projectId}`}),
      network_id: config.mainnet.network_id,
    },
    rinkeby: {
      provider: () => new HDWalletProvider({mnemonic: {phrase: seedPhrase}, providerOrUrl: `${config.rinkeby.url}/${projectId}`}),
      network_id: config.rinkeby.network_id,
      networkCheckTimeout: config.rinkeby.network_check_timeout,
    },
    ropsten: {
      provider: () => new HDWalletProvider({mnemonic: {phrase: seedPhrase}, providerOrUrl: `${config.ropsten.url}/${projectId}`}),
      network_id: config.ropsten.network_id,
      networkCheckTimeout: config.ropsten.network_check_timeout,
      gasPrice: config.ropsten.gas_price,
    },
    kovan: {
      provider: () => new HDWalletProvider({mnemonic: {phrase: seedPhrase}, providerOrUrl: `${config.kovan.url}/${projectId}`}),
      network_id: config.kovan.network_id,
      networkCheckTimeout: config.kovan.network_check_timeout,
    },
    goerli: {
      provider: () => new HDWalletProvider({mnemonic: {phrase: seedPhrase}, providerOrUrl: `${config.goerli.url}/${projectId}`}),
      network_id: config.goerli.network_id,
    },
    swissdlt: {
      provider: () => new HDWalletProvider({mnemonic: {phrase: seedPhrase}, providerOrUrl: `${config.swissdlt.url}/`}),
      network_id: config.swissdlt.network_id,
    },
    payfoot: {
      provider: () => new HDWalletProvider({mnemonic: {phrase: seedPhrase}, providerOrUrl: `${config.payfoot.url}`}),
      network_id: config.payfoot.network_id,
    },
    porini: {
      provider: () => new HDWalletProvider({mnemonic: {phrase: seedPhrase}, providerOrUrl: `${config.porini.url}`}),
      network_id: config.porini.network_id,
    },
  },

  // Configure our compilers
  compilers: {
    solc: {
      version: "0.8.6",
      settings: { 
        optimizer: {
        enabled: true,
        runs: 200
        },
      },
    },
  },

  // Configure our plugins
  plugins: [
    'truffle-plugin-verify'
  ],

  // Configure our API keys
  api_keys: {
    etherscan: etherscanKey
  },

};
