"use client";

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from "react";
import { web3Provider } from "../services/web3";

const WalletStateContext = createContext(null);
const WalletDispatchContext = createContext(null);

const initialState = {
  isConnected: false,
  account: null,
  chainId: null,
  balance: null,
  isConnecting: false,
  error: null,
  walletType: null,
  reconnectAttempted: false,
};

function walletReducer(state, action) {
  switch (action.type) {
    case "CONNECT_START":
      return { ...state, isConnecting: true, error: null };
    case "CONNECT_SUCCESS":
      return {
        ...state,
        isConnected: true,
        account: action.payload.account,
        chainId: action.payload.chainId,
        walletType: action.payload.walletType || null,
        isConnecting: false,
        error: null,
        reconnectAttempted: false,
      };
    case "SET_BALANCE":
      return { ...state, balance: action.payload };
    case "DISCONNECT":
      return { ...initialState };
    case "SET_CHAIN":
      return { ...state, chainId: action.payload };
    case "SET_ACCOUNT":
      return { ...state, account: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, isConnecting: false };
    case "SET_RECONNECT_ATTEMPTED":
      return { ...state, reconnectAttempted: true };
    default:
      return state;
  }
}

const RECONNECT_WALLET_KEY = "ssc-wallet-type";
const RECONNECT_ENABLED_KEY = "ssc-wallet-connected";
const BALANCE_POLL_INTERVAL_MS = Number(process.env.NEXT_PUBLIC_BALANCE_POLL_INTERVAL_MS || 15000);

export function WalletProvider({ children }) {
  const [state, dispatch] = useReducer(walletReducer, initialState);
  const reconnectAttemptedRef = useRef(false);

  const connectWallet = useCallback(async (walletId = "metamask") => {
    dispatch({ type: "CONNECT_START" });
    try {
      const result = await web3Provider.connect(walletId);
      dispatch({
        type: "CONNECT_SUCCESS",
        payload: { account: result.account, chainId: result.chainId, walletType: walletId },
      });
      localStorage.setItem(RECONNECT_ENABLED_KEY, "true");
      localStorage.setItem(RECONNECT_WALLET_KEY, walletId);
      return result;
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message || "Failed to connect wallet" });
      throw error;
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(RECONNECT_ENABLED_KEY);
    const savedWallet = localStorage.getItem(RECONNECT_WALLET_KEY);
    if (saved === "true" && savedWallet && !reconnectAttemptedRef.current) {
      reconnectAttemptedRef.current = true;
      dispatch({ type: "SET_RECONNECT_ATTEMPTED" });
      connectWallet(savedWallet);
    }
  }, [connectWallet]);

  useEffect(() => {
    if (state.isConnected && state.account) {
      const syncBalance = async () => {
        try {
          const currentBalance = await web3Provider.getBalance(state.account);
          dispatch({ type: "SET_BALANCE", payload: currentBalance });
        } catch {}
      };

      syncBalance();
      const intervalId = setInterval(syncBalance, BALANCE_POLL_INTERVAL_MS);
      return () => clearInterval(intervalId);
    }
  }, [state.isConnected, state.account, state.chainId]);

  useEffect(() => {
    const handleNetworkChanged = ({ chainId }) => {
      dispatch({ type: "SET_CHAIN", payload: chainId });
    };
    const handleAccountChanged = ({ account }) => {
      dispatch({ type: "SET_ACCOUNT", payload: account });
    };
    const handleDisconnected = () => {
      dispatch({ type: "DISCONNECT" });
      localStorage.removeItem(RECONNECT_ENABLED_KEY);
      localStorage.removeItem(RECONNECT_WALLET_KEY);
    };

    web3Provider.on("networkChanged", handleNetworkChanged);
    web3Provider.on("accountChanged", handleAccountChanged);
    web3Provider.on("disconnected", handleDisconnected);

    return () => {
      web3Provider.off("networkChanged", handleNetworkChanged);
      web3Provider.off("accountChanged", handleAccountChanged);
      web3Provider.off("disconnected", handleDisconnected);
    };
  }, []);

  const disconnectWallet = useCallback(() => {
    web3Provider.disconnect();
    dispatch({ type: "DISCONNECT" });
    localStorage.removeItem(RECONNECT_ENABLED_KEY);
    localStorage.removeItem(RECONNECT_WALLET_KEY);
  }, []);

  const switchNetwork = useCallback(async (chainId) => {
    try {
      await web3Provider.switchNetwork(chainId);
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: error.message || "Failed to switch network" });
      throw error;
    }
  }, []);

  return (
    <WalletStateContext.Provider value={state}>
      <WalletDispatchContext.Provider value={{ connectWallet, disconnectWallet, switchNetwork }}>
        {children}
      </WalletDispatchContext.Provider>
    </WalletStateContext.Provider>
  );
}

export function useWallet() {
  const state = useContext(WalletStateContext);
  const dispatch = useContext(WalletDispatchContext);
  if (state === null || dispatch === null) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return { ...state, ...dispatch };
}

export function useWalletState() {
  return useContext(WalletStateContext);
}

export function useWalletActions() {
  return useContext(WalletDispatchContext);
}
