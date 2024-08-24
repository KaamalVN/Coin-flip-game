require('dotenv').config();
require("@nomicfoundation/hardhat-ignition");

module.exports = {
  solidity: "0.8.24",
  networks: {
    rinkeby: {
      url: process.env.RINKEBY_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
