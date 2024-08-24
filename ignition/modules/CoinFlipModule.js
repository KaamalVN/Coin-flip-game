const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("CoinFlipModule", (m) => {
  const coinFlip = m.contract("CoinFlip");

  return { coinFlip };
});
