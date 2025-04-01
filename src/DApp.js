import React, { useState, useEffect, useCallback } from "react";
import { BrowserProvider, Contract, parseEther, formatEther } from "ethers";
import "bootstrap/dist/css/bootstrap.min.css";

const CONTRACT_ADDRESS = "0xEF608515240878389B70F6b7cC7bD4AeEA01eEf0";
const ABI = [
  {
    inputs: [],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "checkBalance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

const DApp = () => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState("0");
  const [amount, setAmount] = useState("0.01");
  const [contract, setContract] = useState(null);
  const [status, setStatus] = useState("");

  const initializeContract = useCallback(async () => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractInstance = new Contract(CONTRACT_ADDRESS, ABI, signer);
      setContract(contractInstance);
      fetchBalance(contractInstance);
    } catch (error) {
      console.error("Error initializing contract:", error);
    }
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          initializeContract();
        }
      });
    }
  }, [initializeContract]); // ✅ แก้ปัญหาการแจ้งเตือนของ React Hook

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
        initializeContract();
      } else {
        alert("Metamask not detected");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const fetchBalance = async (contractInstance) => {
    try {
      if (contractInstance) {
        const bal = await contractInstance.checkBalance();
        console.log("Raw Balance:", bal.toString());
        setBalance(formatEther(bal));
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance("0 (Error)");
    }
  };

  const deposit = async () => {
    try {
      setStatus("Processing your deposit...");
      if (contract && amount) {
        const tx = await contract.deposit({ value: parseEther(amount) });
        await tx.wait();
        fetchBalance(contract);
        setStatus("Deposit successful");
      }
    } catch (error) {
      console.error("Deposit error:", error);
      setStatus("Deposit failed");
    }
  };

  const withdraw = async () => {
    try {
      setStatus("Processing your withdrawal...");
      if (contract && amount) {
        const tx = await contract.withdraw(parseEther(amount));
        await tx.wait();
        fetchBalance(contract);
        setStatus("Withdrawal successful");
      }
    } catch (error) {
      console.error("Withdraw error:", error);
      setStatus("Withdrawal failed");
    }
  };

  return (
    <div className="container text-center mt-5">
      <h2 className="mb-4">DApp Bank - 65072713 Nawarat Patnantaporn</h2>
      {account ? (
        <p className="alert alert-success">Connected: {account}</p>
      ) : (
        <button className="btn btn-primary mb-3" onClick={connectWallet}>
          Connect Metamask
        </button>
      )}
      <p className="fw-bold">Balance: {balance} ETH</p>
      <div className="mb-3">
        <input
          type="number"
          className="form-control text-center"
          placeholder="Amount in ETH"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          step="0.01"
          min="0.01"
        />
      </div>
      <div className="d-flex justify-content-center gap-3">
        <button className="btn btn-success" onClick={deposit}>
          Deposit
        </button>
        <button className="btn btn-danger" onClick={withdraw}>
          Withdraw
        </button>
      </div>
      {status && <p className="mt-3 alert alert-info">{status}</p>}
    </div>
  );
};

export default DApp;