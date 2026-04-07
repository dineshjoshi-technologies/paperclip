import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { Wallet, ArrowUpRight, ArrowDownLeft, History, DollarSign, TrendingUp, RefreshCw, Send, ShoppingCart } from "lucide-react";
import { useWallet } from "../contexts/WalletContext";
import { Container, Layout } from "../components/Layout";
import { Button } from "../components/Button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/Card";
import { WalletButton, NetworkBadge } from "../components/WalletComponents";
import { TokenDisplay, StatCard, TransactionRow } from "../components/DashboardWidgets";
import { formatAddress } from "../utils/format";

const MOCK_TRANSACTIONS = [
  { hash: "0x7af8...93b2", from: "0x1234...5678", to: "0x8765...4321", amount: "500 SSC", status: "confirmed", timestamp: Date.now() - 3600000 },
  { hash: "0x2bc3...4d1e", from: "0x9abc...0def", to: "0x2345...6789", amount: "1,200 SSC", status: "confirmed", timestamp: Date.now() - 86400000 },
  { hash: "0x5ef6...9ab1", from: "0x3456...789a", to: "0xbcde...f012", amount: "750 SSC", status: "pending", timestamp: Date.now() - 1800000 },
];

export default function Dashboard() {
  const { isConnected, account, balance, chainId } = useWallet();
  const [displayBalance, setDisplayBalance] = useState(balance);

  useEffect(() => {
    if (balance !== displayBalance) {
      setDisplayBalance(balance);
    }
  }, [balance]);

  if (!isConnected) {
    return (
      <Layout>
        <Head><title>Dashboard - SSC Platform</title></Head>
        <Container className="py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Connect Your Wallet</h1>
          <p className="text-muted-foreground mb-6">You need to connect your wallet to view your dashboard.</p>
          <WalletButton />
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head><title>Dashboard - SSC Platform</title></Head>

      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-sticky">
        <Container>
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-bold text-primary">SSC Platform</Link>
            <nav className="flex items-center gap-6">
              <Link href="/dashboard" className="text-sm text-foreground font-medium">Dashboard</Link>
              <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Admin</Link>
              <WalletButton />
            </nav>
          </div>
        </Container>
      </header>

      <main className="py-8">
        <Container>
          <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard</h1>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="SSC Balance"
              value={displayBalance ?? "0.00"}
              icon={<Wallet className="w-4 h-4" />}
            />
            <StatCard
              label="ETH Balance"
              value={`${parseFloat(balance || 0).toFixed(4)}`}
              icon={<TrendingUp className="w-4 h-4" />}
            />
            <StatCard
              label="Profit Earned"
              value="1,250"
              icon={<DollarSign className="w-4 h-4" />}
              change={12.5}
            />
            <StatCard
              label="Transactions"
              value="24"
              icon={<History className="w-4 h-4" />}
              change={-3.2}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Token Balance */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Token Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <TokenDisplay symbol="SSC" balance={displayBalance} price={0.05} size="xl" />
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Wallet</p>
                    <p className="font-mono text-sm text-foreground">{formatAddress(account)}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Network</p>
                    <div className="mt-1">
                      <NetworkBadge />
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button variant="primary" size="sm" className="gap-1">
                    <ShoppingCart className="w-3 h-3" /> Buy SSC
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <ArrowUpRight className="w-3 h-3" /> Sell SSC
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <ArrowDownLeft className="w-3 h-3" /> Request Buyback
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <DollarSign className="w-4 h-4" /> View Profit Distributions
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <History className="w-4 h-4" /> Transaction History
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Send className="w-4 h-4" /> Buyback Request
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Wallet className="w-4 h-4" /> Account Settings
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Transactions */}
          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <Button variant="ghost" size="sm" className="gap-1">
                <History className="w-3 h-3" /> View All
              </Button>
            </CardHeader>
            <CardContent>
              {MOCK_TRANSACTIONS.map((tx, i) => (
                <TransactionRow key={i} {...tx} />
              ))}
            </CardContent>
          </Card>
        </Container>
      </main>
    </Layout>
  );
}
