import React from "react";

export default function App({ Component, pageProps }) {
  const { WalletProvider } = require("../contexts/WalletContext");
  
  return (
    <WalletProvider>
      <Component {...pageProps} />
    </WalletProvider>
  );
}
