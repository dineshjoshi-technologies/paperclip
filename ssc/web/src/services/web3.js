import { EthereumProvider } from "@walletconnect/ethereum-provider";

const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

const BSC_MAINNET = {
  chainId: 56,
  name: "BSC Mainnet",
  rpcUrl: "https://bsc-dataseed1.binance.org",
  nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
};

const BSC_TESTNET = {
  chainId: 97,
  name: "BSC Testnet",
  rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545",
  nativeCurrency: { name: "tBNB", symbol: "tBNB", decimals: 18 },
};

const SUPPORTED_CHAINS = [BSC_MAINNET.chainId, BSC_TESTNET.chainId];

class Web3Provider {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.account = null;
    this.chainId = null;
    this.walletType = null;
    this.walletConnectProvider = null;
    this.listeners = new Map();
  }

  isWalletInstalled() {
    return typeof window !== "undefined" && typeof window.ethereum !== "undefined";
  }

  async connect(walletId = "metamask") {
    this.walletType = walletId;

    try {
      switch (walletId) {
        case "metamask":
          return await this._connectMetaMask();
        case "walletconnect":
          return await this._connectWalletConnect();
        case "trustwallet":
          return await this._connectTrustWallet();
        default:
          throw new Error(`Unsupported wallet: ${walletId}`);
      }
    } catch (error) {
      this._emit("error", error);
      throw error;
    }
  }

  async _connectMetaMask() {
    if (!this.isWalletInstalled()) {
      throw new Error("No wallet detected. Please install MetaMask or another Web3 wallet.");
    }

    const { ethers } = await import("ethers");
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();
    this.account = accounts[0];
    this.chainId = Number((await this.provider.getNetwork()).chainId);

    this._setupInjectedListeners(window.ethereum);
    this._emit("connected", { account: this.account, chainId: this.chainId });

    return { account: this.account, chainId: this.chainId };
  }

  async _connectWalletConnect() {
    const { ethers } = await import("ethers");

    if (!WALLETCONNECT_PROJECT_ID) {
      throw new Error("Missing WalletConnect Project ID. Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID.");
    }

    this.walletConnectProvider = await EthereumProvider.init({
      chains: [BSC_MAINNET.chainId],
      optionalChains: SUPPORTED_CHAINS,
      showQrModal: true,
      projectId: WALLETCONNECT_PROJECT_ID,
      methods: ["eth_sendTransaction", "personal_sign", "eth_signTypedData"],
      events: ["chainChanged", "accountsChanged"],
      rpcMap: {
        [BSC_MAINNET.chainId]: BSC_MAINNET.rpcUrl,
        [BSC_TESTNET.chainId]: BSC_TESTNET.rpcUrl,
      },
    });

    await this.walletConnectProvider.enable();

    this.provider = new ethers.BrowserProvider(this.walletConnectProvider);
    this.signer = await this.provider.getSigner();
    this.account = (await this.walletConnectProvider.request({ method: "eth_accounts" }))[0];
    this.chainId = Number((await this.provider.getNetwork()).chainId);

    this._setupWalletConnectListeners();
    this._emit("connected", { account: this.account, chainId: this.chainId });

    return { account: this.account, chainId: this.chainId };
  }

  async _connectTrustWallet() {
    const trustProvider =
      typeof window !== "undefined" && (window.trustwallet?.ethereum || window.ethereum?.isTrust);

    if (!trustProvider) {
      return await this._connectWalletConnect();
    }

    const { ethers } = await import("ethers");
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();
    this.account = accounts[0];
    this.chainId = Number((await this.provider.getNetwork()).chainId);

    this._setupInjectedListeners(window.ethereum);
    this._emit("connected", { account: this.account, chainId: this.chainId });

    return { account: this.account, chainId: this.chainId };
  }

  async disconnect() {
    if (this.walletType === "walletconnect" && this.walletConnectProvider) {
      try {
        await this.walletConnectProvider.disconnect();
      } catch {}
      this.walletConnectProvider = null;
    }

    this.provider = null;
    this.signer = null;
    this.account = null;
    this.chainId = null;
    this.walletType = null;
    this._emit("disconnected");
  }

  async getBalance(address) {
    if (!this.provider) throw new Error("Not connected");
    const balance = await this.provider.getBalance(address);
    const { ethers } = await import("ethers");
    return ethers.formatEther(balance);
  }

  async getNetwork() {
    if (!this.provider) throw new Error("Not connected");
    return this.provider.getNetwork();
  }

  async switchNetwork(chainId) {
    const hexChainId = `0x${chainId.toString(16)}`;

    if (this.walletType === "walletconnect" && this.walletConnectProvider) {
      await this.walletConnectProvider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexChainId }],
      });
    } else {
      if (!this.isWalletInstalled()) throw new Error("No wallet detected");
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexChainId }],
      });
    }
    this.chainId = chainId;
    this._emit("networkChanged", { chainId });
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;
    this.listeners.set(
      event,
      this.listeners.get(event).filter((cb) => cb !== callback)
    );
  }

  _setupInjectedListeners(ethereum) {
    ethereum.on("accountsChanged", (accounts) => {
      if (accounts.length === 0) {
        this.disconnect();
      } else {
        this.account = accounts[0];
        this._emit("accountChanged", { account: accounts[0] });
      }
    });

    ethereum.on("chainChanged", (chainIdHex) => {
      this.chainId = parseInt(chainIdHex, 16);
      this._emit("networkChanged", { chainId: this.chainId });
    });
  }

  _setupWalletConnectListeners() {
    this.walletConnectProvider.on("accountsChanged", (accounts) => {
      this.account = accounts[0];
      this._emit("accountChanged", { account: accounts[0] });
    });

    this.walletConnectProvider.on("chainChanged", (chainIdHex) => {
      this.chainId = parseInt(chainIdHex, 16);
      this._emit("networkChanged", { chainId: this.chainId });
    });

    this.walletConnectProvider.on("disconnect", () => {
      this.disconnect();
    });
  }

  _emit(event, data) {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event).forEach((cb) => cb(data));
  }
}

export const web3Provider = new Web3Provider();
export { BSC_MAINNET, BSC_TESTNET };
