import {
  createWalletClient,
  custom,
  createPublicClient,
  parseEther,
  formatEther,
  defineChain,
} from "https://esm.sh/viem";
import { contractAddress, abi } from "./constant.js";

let walletClient;
let publicClient;

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const ethAmountInput = document.getElementById("ethAmount");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");

connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    walletClient = createWalletClient({
      transport: custom(window.ethereum),
    });
    await walletClient.requestAddresses();
    connectButton.innerHTML = "Connected";
  } else {
    connectButton.innerHTML = "Please install MetaMask!!!";
  }
}

async function fund() {
  const ethAmount = ethAmountInput.value;

  if (typeof window.ethereum !== "undefined") {
    walletClient = createWalletClient({
      transport: custom(window.ethereum),
    });
    const [connectedAccount] = await walletClient.requestAddresses();
    const currentChain = await getCurrentChain(walletClient);

    publicClient = createPublicClient({
      transport: custom(window.ethereum),
    });

    const { request } = await publicClient.simulateContract({
      address: contractAddress,
      abi: abi,
      functionName: "fund",
      account: connectedAccount,
      chain: currentChain,
      value: parseEther(ethAmount), // converts ethAmount from 1 => 1e18
    });
    const hash = await walletClient.writeContract(request);
    console.log(`Transaction hash: ${hash}`);
  } else {
    connectButton.innerHTML = "Please install MetaMask!!!";
  }
}

async function withdraw() {
  if (typeof window.ethereum !== "undefined") {
    walletClient = createWalletClient({
      transport: custom(window.ethereum),
    });

    const [connectedAccount] = await walletClient.requestAddresses();
    const currentChain = await getCurrentChain(walletClient);

    publicClient = createPublicClient({
      transport: custom(window.ethereum),
    });

    const { request } = await publicClient.simulateContract({
      address: contractAddress,
      abi: abi,
      functionName: "withdraw",
      account: connectedAccount,
      chain: currentChain,
    });

    const hash = await walletClient.writeContract(request);
    console.log(`Transaction hash: ${hash}`);
  }
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    publicClient = createPublicClient({
      transport: custom(window.ethereum),
    });
    const balance = await publicClient.getBalance({
      address: contractAddress,
    });
    console.log(`Balance: ${formatEther(balance)}`); // convert balance from 1e18 => 1
  }
}

async function getCurrentChain(client) {
  const chainId = await client.getChainId();
  const currentChain = defineChain({
    id: chainId,
    name: "Custom Chain",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ["http://localhost:8545"],
      },
    },
  });
  return currentChain;
}
