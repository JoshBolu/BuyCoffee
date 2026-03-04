import {
  createWalletClient,
  custom,
  createPublicClient,
  parseEther,
  formatEther,
  defineChain,
  WalletClient,
  PublicClient,
} from "viem";
import "viem/window";
import { contractAddress, abi } from "./constant-ts.ts";

const connectButton = document.getElementById(
  "connectButton",
) as HTMLButtonElement;
const fundButton = document.getElementById("fundButton") as HTMLButtonElement;
const ethAmountInput = document.getElementById("ethAmount") as HTMLInputElement;
const balanceButton = document.getElementById(
  "balanceButton",
) as HTMLButtonElement;
const withdrawButton = document.getElementById(
  "withdrawButton",
) as HTMLButtonElement;

console.log("Hiiii");

let walletClient: WalletClient;
let publicClient: PublicClient;

async function connect(): Promise<void> {
  if (typeof window.ethereum !== "undefined") {
    walletClient = createWalletClient({
      transport: custom(window.ethereum),
    });
    await walletClient.requestAddresses();
    connectButton.innerHTML = "Connected!";
  } else {
    connectButton.innerHTML = "Please install MetaMask!";
  }
}

async function fund(): Promise<void> {
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
      value: parseEther(ethAmount),
    });
    const hash = await walletClient.writeContract(request);
    console.log(`Transaction hash: ${hash}`);
  } else {
    connectButton.innerHTML = "Please install MetaMask!";
  }
}

async function withdraw(): Promise<void> {
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
    console.log(`Withdraw transaction hash: ${hash}`);
  }
}

async function getBalance(): Promise<void> {
  if (typeof window.ethereum !== "undefined") {
    publicClient = createPublicClient({
      transport: custom(window.ethereum),
    });
    const balance = await publicClient.getBalance({
      address: contractAddress,
    });
    console.log(`Contract balance: ${formatEther(balance)} ETH`);
  }
}

async function getCurrentChain(
  client: WalletClient,
): Promise<ReturnType<typeof defineChain>> {
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

// Attach event listeners
connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;
