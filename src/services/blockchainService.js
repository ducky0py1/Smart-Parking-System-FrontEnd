import { ethers } from 'ethers';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

// Minimal ABI — only the functions we call
const CONTRACT_ABI = [
  {
    "inputs": [{ "internalType": "uint256", "name": "spotId", "type": "uint256" }],
    "name": "payForSpot",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "payDebt",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true,  "name": "user",   "type": "address" },
      { "indexed": false, "name": "spotId", "type": "uint256" },
      { "indexed": false, "name": "amount", "type": "uint256" }
    ],
    "name": "ParkingPaid",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true,  "name": "user",   "type": "address" },
      { "indexed": false, "name": "amount", "type": "uint256" }
    ],
    "name": "DebtPaid",
    "type": "event"
  }
];

async function getContract() {
  if (!window.ethereum) throw new Error('MetaMask non installé. Veuillez l\'installer pour continuer.');
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

/**
 * Pays for a parking spot (price + any existing debt)
 * @param {number} spotId - Database ID of the spot
 * @param {string} totalAmountInEth - Total ETH to send
 * @returns {string} Transaction hash
 */
export async function payForSpot(spotId, totalAmountInEth) {
  const contract = await getContract();
  const amountInWei = ethers.parseEther(totalAmountInEth.toString());
  const tx = await contract.payForSpot(spotId, { value: amountInWei });
  const receipt = await tx.wait();
  return receipt.hash;
}

/**
 * Pays outstanding debt without reserving a new spot
 * @param {string} debtInEth
 * @returns {string} Transaction hash
 */
export async function payDebt(debtInEth) {
  const contract = await getContract();
  const amountInWei = ethers.parseEther(debtInEth.toString());
  const tx = await contract.payDebt({ value: amountInWei });
  const receipt = await tx.wait();
  return receipt.hash;
}
