const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CoinFlip Contract", function () {
  let CoinFlip, coinFlip, owner, player;

  beforeEach(async function () {
    CoinFlip = await ethers.getContractFactory("CoinFlip");
    [owner, player] = await ethers.getSigners();
    coinFlip = await CoinFlip.deploy();
    await coinFlip.deployed();
  });

  it("should deploy the contract and set the owner", async function () {
    expect(await coinFlip.owner()).to.equal(owner.address);
  });

  it("should flip the coin and handle wins/losses correctly", async function () {
    const betAmount = ethers.utils.parseEther("1");

    // Player makes a bet
    const tx = await coinFlip.connect(player).flipCoin(true, { value: betAmount });
    const receipt = await tx.wait();

    // Check the emitted event
    const event = receipt.events.find(event => event.event === "CoinFlipped");
    expect(event).to.not.be.undefined;

    const [playerAddress, guess, result, amount, win] = event.args;
    expect(playerAddress).to.equal(player.address);
    expect(result).to.be.oneOf([true, false]);
    expect(amount).to.equal(betAmount);
    expect(win).to.be.oneOf([true, false]);
  });

  it("should allow the owner to withdraw funds", async function () {
    const betAmount = ethers.utils.parseEther("1");
    await coinFlip.connect(player).flipCoin(true, { value: betAmount });

    const initialOwnerBalance = await ethers.provider.getBalance(owner.address);
    const contractBalance = await ethers.provider.getBalance(coinFlip.address);

    await coinFlip.connect(owner).withdraw();

    const finalOwnerBalance = await ethers.provider.getBalance(owner.address);
    expect(finalOwnerBalance).to.be.gt(initialOwnerBalance);
    expect(await ethers.provider.getBalance(coinFlip.address)).to.equal(0);
  });

  it("should reject withdrawals from non-owners", async function () {
    await expect(coinFlip.connect(player).withdraw()).to.be.revertedWith("Only the owner can withdraw");
  });
});
