require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.29",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545", // Hardhat local node,
    },
    ganache: {
      url: "http://127.0.0.1:7545", // Default Ganache RPC URL,

      accounts: [
        process.env.PRIVATE_KEY, // Replace with one of your Ganache accounts
      ],
    },
  },
};
