import React, { useState } from "react";
import clsx from "clsx";
import { Wallet, Loader2, X, ScanLine } from "lucide-react";
import { useWallet } from "../contexts/WalletContext";

const WALLETS = [
  {
    id: "metamask",
    name: "MetaMask",
    description: "Connect with MetaMask browser extension",
    icon: (
      <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
        <path d="M36.8 3.2l-6.4 2.8-2.1-4.6-1.6-1.4H20L13.3 1.4l1.7 3.8-6.4-2.6C10.7.6 13.1 1 15.2 2.1L18.4 3.8 12 23.4l-3.4-1.8L6.4 33c3.1-1.1 6.5-1.7 10.1-1.7L20 40l3.5-8.7H27L30.5 18z" fill="#E17726"/>
      </svg>
    ),
    installed: typeof window !== "undefined" && typeof window.ethereum !== "undefined",
  },
  {
    id: "trustwallet",
    name: "Trust Wallet",
    description: "Connect with Trust Wallet",
    icon: (
      <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
        <circle cx="20" cy="20" r="18" fill="#3375BB"/>
        <path d="M13.5 16.5L20 13l6.5 3.5v7l-6.5 3.5-6.5-3.5v-7z" fill="white"/>
      </svg>
    ),
    installed: typeof window !== "undefined" && window.ethereum?.isTrust,
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    description: "Scan with your mobile wallet",
    icon: (
      <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
        <circle cx="20" cy="20" r="18" fill="#3B99FC"/>
        <path d="M12 18c4-5 12-5 16 0M15 23c2-2.5 7.5-2.5 10 0" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    installed: true,
  },
];

const CHAIN_NAMES = {
  1: "Ethereum",
  56: "BSC Mainnet",
  97: "BSC Testnet",
  137: "Polygon",
};

export function WalletButton({ className = "" }) {
  const { isConnected, account, balance, isConnecting, error, connectWallet, disconnectWallet } = useWallet();
  const [showModal, setShowModal] = useState(false);

  if (isConnected) {
    const shortAddress = account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "";
    const ethBalance = balance ? `${parseFloat(balance).toFixed(4)} ETH` : "0.0000 ETH";

    return (
      <>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg border border-border">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm font-mono text-foreground">{shortAddress}</span>
            <span className="text-xs text-muted-foreground">{ethBalance}</span>
          </div>
          <button
            onClick={disconnectWallet}
            className="px-3 py-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
          >
            Disconnect
          </button>
        </div>
        {error && (
          <div className="mt-2 text-xs text-destructive">{error}</div>
        )}
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={isConnecting}
        className={clsx(
          "inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground",
          "rounded-lg font-medium text-sm transition-colors",
          "hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
      >
        {isConnecting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="w-4 h-4" />
            Connect Wallet
          </>
        )}
      </button>
      <WalletSelectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        wallets={WALLETS}
      />
    </>
  );
}

export function NetworkBadge({ className = "" }) {
  const { chainId } = useWallet();
  const isBSC = chainId === 56 || chainId === 97;
  const isCorrectNetwork = isBSC;
  const chainName = CHAIN_NAMES[chainId] || `Chain: ${chainId || "Unknown"}`;

  return (
    <div className={clsx("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", isCorrectNetwork ? "bg-success/20 text-success" : "bg-warning/20 text-warning", className)}>
      <div className={clsx("w-1.5 h-1.5 rounded-full", isCorrectNetwork ? "bg-success" : "bg-warning")} />
      {chainName}
    </div>
  );
}

export function NetworkSwitcher({ className = "" }) {
  const { chainId, switchNetwork } = useWallet();
  const [isSwitching, setIsSwitching] = useState(false);

  const handleSwitch = async (targetChainId) => {
    if (targetChainId === chainId || isSwitching) return;
    setIsSwitching(true);
    try {
      await switchNetwork(targetChainId);
    } catch {
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className={clsx("flex items-center gap-2", className)}>
      <NetworkBadge />
      <div className="flex gap-1">
        <button
          onClick={() => handleSwitch(56)}
          disabled={isSwitching || chainId === 56}
          className={clsx(
            "px-2 py-1 text-xs rounded transition-colors",
            chainId === 56
              ? "bg-success text-success-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          BSC Mainnet
        </button>
        <button
          onClick={() => handleSwitch(97)}
          disabled={isSwitching || chainId === 97}
          className={clsx(
            "px-2 py-1 text-xs rounded transition-colors",
            chainId === 97
              ? "bg-info text-info-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          BSC Testnet
        </button>
      </div>
    </div>
  );
}

export function WalletSelectModal({ isOpen, onClose }) {
  const { connectWallet, isConnecting } = useWallet();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-4 bg-card rounded-xl border border-border shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Connect Wallet</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-2">
          {WALLETS.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => connectWallet(wallet.id).then(onClose).catch(() => {})}
              disabled={isConnecting}
              className={clsx(
                "w-full flex items-center gap-3 p-3 rounded-lg border",
                "border-border hover:bg-muted transition-colors text-left",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">{wallet.icon}</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{wallet.name}</p>
                {wallet.description && (
                  <p className="text-xs text-muted-foreground">{wallet.description}</p>
                )}
              </div>
              {isConnecting && (
                <Loader2 className="animate-spin h-4 w-4 text-primary" />
              )}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-border">
          <p className="text-xs text-center text-muted-foreground">
            By connecting, you agree to our Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
}
