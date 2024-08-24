import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css'; // Import the CSS file for styling

// Contract ABI and address
const coinFlipABI = [
  "function flipCoin(bool _guess) external payable",
  "function owner() external view returns (address)"
];
const coinFlipAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your contract address on the deployed network

const App = () => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [coinFlipContract, setCoinFlipContract] = useState(null);
  const [betAmount, setBetAmount] = useState("");
  const [guess, setGuess] = useState(null); // null for no guess, true for heads, false for tails
  const [outcome, setOutcome] = useState('');
  const [isFlipping, setIsFlipping] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState("");
  const [warning, setWarning] = useState(""); // For warning messages
  const [balance, setBalance] = useState("0"); // State to hold balance

  useEffect(() => {
    // Connect to MetaMask
    const initializeProvider = async () => {
      if (window.ethereum) {
        const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(tempProvider);

        // Request accounts from MetaMask
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const tempSigner = tempProvider.getSigner();
        setSigner(tempSigner);
        setAccount(accounts[0]);

        const tempCoinFlipContract = new ethers.Contract(coinFlipAddress, coinFlipABI, tempSigner);
        setCoinFlipContract(tempCoinFlipContract);

        // Fetch balance
        fetchBalance(tempProvider, accounts[0]);

        // Listen for account change
        window.ethereum.on('accountsChanged', (accounts) => {
          setAccount(accounts[0]);
          fetchBalance(tempProvider, accounts[0]);
        });
        
        // Listen for network change
        window.ethereum.on('chainChanged', () => {
          window.location.reload();
        });
      } else {
        console.error("MetaMask is not installed. Please install MetaMask.");
      }
    };

    initializeProvider();
  }, []);

  const fetchBalance = async (provider, address) => {
    try {
      const balance = await provider.getBalance(address);
      setBalance(ethers.utils.formatEther(balance)); // Format balance to ETH
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    }
  };

  const connectWallet = async () => {
    try {
      const accounts = await provider.listAccounts();
      setAccount(accounts[0]);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };
  
  const flipCoin = async () => {
    if (!account) {
      alert("Please connect your wallet.");
      return;
    }

    if (guess === null) {
      setWarning("Please select Heads or Tails.");
      return;
    }

    if (!coinFlipContract || !betAmount) return;

    try {
      setTransactionStatus("Processing transaction...");
      setWarning(""); // Clear any previous warning
      setIsFlipping(true); // Start spinning animation

      const tx = await coinFlipContract.flipCoin(guess, { value: ethers.utils.parseEther(betAmount) });
      await tx.wait();

      // Fetch the outcome from the transaction (Note: actual outcome is determined by the contract logic)
      const randomOutcome = Math.random() < 0.5 ? 'heads' : 'tails'; // Simulate outcome, replace with actual logic if available
      setOutcome(randomOutcome);

      // Update balance after the transaction
      fetchBalance(provider, account);

      // Determine if the guess was correct
      if (randomOutcome === (guess ? 'heads' : 'tails')) {
        setTransactionStatus("You guessed right!");
      } else {
        setTransactionStatus("You guessed wrong!");
      }
    } catch (err) {
      console.error(err);
      setTransactionStatus("Transaction failed!");
    } finally {
      setIsFlipping(false); // Reset spinning animation
    }
  };

  const handleGuess = (selectedGuess) => {
    setGuess(selectedGuess);
    setOutcome(''); // Clear previous outcome
    setWarning(""); // Clear any previous warning
  };

  return (
    <div className="coin-flip-container">
      <div className="outcome-container">
        <div className={`outcome ${isFlipping ? 'flip toss' : ''} ${outcome === 'heads' ? 'glow-heads' : ''} ${outcome === 'tails' ? 'glow-tails' : ''}`}>
          {outcome}
        </div>
      </div>
      <div className="button-container">
        <button
          onClick={() => handleGuess(true)}
          className={`guess-button ${guess === true ? 'selected' : ''}`}
          id="headsButton"
        >
          Heads
        </button>
        <button
          onClick={() => handleGuess(false)}
          className={`guess-button ${guess === false ? 'selected' : ''}`}
          id="tailsButton"
        >
          Tails
        </button>
      </div>
      <div className="wallet-container">
        <button onClick={connectWallet} className="wallet-button">
          {account ? `Connected: ${account}` : "Connect Wallet"}
        </button>
        {account && (
          <>
            <input
              placeholder="Bet amount in ETH"
              type="number"
              step="0.01"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              className="bet-input"
            />
            <button onClick={flipCoin} className="bet-button">
              Flip Coin
            </button>
            {transactionStatus && <p className="status">{transactionStatus}</p>}
            {warning && <p className="warning">{warning}</p>}
          </>
        )}
      </div>
    </div>
  );
};

export default App;
