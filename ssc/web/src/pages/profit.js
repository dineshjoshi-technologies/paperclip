import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useWallet } from "../contexts/WalletContext";
import { Container, Layout } from "../components/Layout";
import { WalletButton } from "../components/WalletComponents";
import { Card, CardHeader, CardTitle, CardContent } from "../components/Card";
import { Button } from "../components/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/Table";
import { Badge } from "../components/Badge";
import { Input } from "../components/Input";
import { Select } from "../components/FormControls";

const MOCK_DISTRIBUTIONS = [
  { id: "DIST-001", date: "2024-03-01", amount: "2,500 USDT", holders: 124, pricePerToken: "0.05", status: "completed" },
  { id: "DIST-002", date: "2024-02-01", amount: "2,200 USDT", holders: 118, pricePerToken: "0.047", status: "completed" },
  { id: "DIST-003", date: "2024-01-01", amount: "1,800 USDT", holders: 105, pricePerToken: "0.042", status: "completed" },
  { id: "DIST-004", date: "2024-04-01", amount: "Pending", holders: 130, pricePerToken: "—", status: "scheduled" },
];

export default function ProfitDistribution() {
  const { isConnected, account, balance } = useWallet();
  const [activeTab, setActiveTab] = useState("history");

  if (!isConnected) {
    return (
      <Layout>
        <Head><title>Profit Distribution - SSC Platform</title></Head>
        <Container className="py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Connect Your Wallet</h1>
          <p className="text-muted-foreground mb-6">You need to connect your wallet to view profit distribution details.</p>
          <WalletButton />
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head><title>Profit Distribution - SSC Platform</title></Head>

      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-sticky">
        <Container>
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-bold text-primary">SSC Platform</Link>
            <nav className="flex items-center gap-6">
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
              <Button variant="ghost" size="sm" as={Link} href="/profit">Profit</Button>
              <Button variant="ghost" size="sm" as={Link} href="/buyback">Buyback</Button>
              <WalletButton />
            </nav>
          </div>
        </Container>
      </header>

      <main className="py-8">
        <Container>
          <h1 className="text-2xl font-bold text-foreground mb-6">Profit Distribution</h1>

          {/* User Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="py-4">
                <p className="text-sm text-muted-foreground mb-1">Your Share</p>
                <p className="text-2xl font-bold text-success">125.50 USDT</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <p className="text-sm text-muted-foreground mb-1">Total Earned</p>
                <p className="text-2xl font-bold text-foreground">1,250 USDT</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <p className="text-sm text-muted-foreground mb-1">Next Distribution</p>
                <p className="text-2xl font-bold text-primary">Apr 1, 2024</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={activeTab === "history" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("history")}
            >
              Distribution History
            </Button>
            <Button
              variant={activeTab === "claim" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("claim")}
            >
              Claim Profits
            </Button>
          </div>

          {activeTab === "history" && (
            <Card>
              <CardHeader>
                <CardTitle>Distribution History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Holders</TableHead>
                      <TableHead>Per Token</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_DISTRIBUTIONS.map((dist) => (
                      <TableRow key={dist.id}>
                        <TableCell className="font-mono text-sm">{dist.id}</TableCell>
                        <TableCell>{dist.date}</TableCell>
                        <TableCell className="font-medium">{dist.amount}</TableCell>
                        <TableCell>{dist.holders}</TableCell>
                        <TableCell>{dist.pricePerToken} USDT</TableCell>
                        <TableCell>
                          <Badge variant={dist.status === "completed" ? "success" : "warning"}>
                            {dist.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {activeTab === "claim" && (
            <Card>
              <CardHeader>
                <CardTitle>Claim Unclaimed Profits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Available to Claim</p>
                  <p className="text-3xl font-bold text-success mb-4">125.50 USDT</p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Wallet</span>
                      <span className="font-mono text-foreground">{account}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SSC Balance</span>
                      <span className="text-foreground">{balance ?? "0"} SSC</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Share Percentage</span>
                      <span className="text-foreground">0.081%</span>
                    </div>
                  </div>
                </div>
                <Button variant="success" size="lg" className="w-full">
                  Claim 125.50 USDT
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Claiming will trigger a transaction to your connected wallet. Gas fees apply.
                </p>
              </CardContent>
            </Card>
          )}
        </Container>
      </main>
    </Layout>
  );
}
