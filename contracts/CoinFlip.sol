// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CoinFlip {
    address public owner;

    event CoinFlipped(address indexed player, bool guess, bool result, uint256 amount, bool win);

    constructor() {
        owner = msg.sender;
    }

    // Function to flip a coin and wager ETH
    function flipCoin(bool _guess) external payable {
        require(msg.value > 0, "You must wager some ETH");

        // Generate a random result (insecure, for demo purposes only)
        bool result = (uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % 2) == 0;

        // Determine win or lose
        bool win = (result == _guess);

        if (win) {
            // Send double the wagered amount back to the player
            payable(msg.sender).transfer(msg.value * 2);
        }

        // Emit the result
        emit CoinFlipped(msg.sender, _guess, result, msg.value, win);
    }

    // Function to withdraw funds by the contract owner
    function withdraw() external {
        require(msg.sender == owner, "Only the owner can withdraw");

        uint256 balance = address(this).balance;
        payable(owner).transfer(balance);
    }

    // Function to receive ETH
    receive() external payable {}
}
