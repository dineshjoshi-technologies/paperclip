import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useWallet } from "../contexts/WalletContext";
import { Container, Layout } from "../components/Layout";
import { WalletButton } from "../components/WalletComponents";
import { Card, CardHeader, CardTitle, CardContent } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/Table";
import { Badge } from "../components/Badge";

const MOCK_REQUESTS = [
  { id: "BB-1021", amount: "750", rate: "0.050", payout: "37.50 USDT", status: "pending", requestedAt: "2026-04-01" },
  { id: "BB-1018", amount: "500", rate: "0.050", payout: "25.00 USDT", status: "approved", requestedAt: "2026-03-26" },
  { id: "BB-1009", amount: "1200", rate: "0.048", payout: "57.60 USDT", status: "completed", requestedAt: "2026-03-14" },
];

export default function Buyback() {
  const { isConnected, balance } = useWallet();
  const [amount, setAmount] = useState("");
  const unitRate = 0.05;
  const numericAmount = Number(amount || 0);
  const estimatedPayout = Number.isFinite(numericAmount) ? (numericAmount * unitRate).toFixed(2) : "0.00";

  if (!isConnected) {
    return (
      <Layout>
        <Head><title>Buyback - SSC Platform</title></Head>
        <Container className="py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Connect Your Wallet</h1>
          <p className="text-muted-foreground mb-6">You need to connect your wallet to request a token buyback.</p>
          <WalletButton />
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head><title>Buyback - SSC Platform</title></Head>

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
          <h1 className="text-2xl font-bold text-foreground mb-6">Token Buyback</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Create Buyback Request</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Current SSC Balance</p>
                  <p className="text-2xl font-bold text-foreground">{balance ?? "0.00"} SSC</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Amount to Sell (SSC)</label>
                  <Input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter SSC amount"
                    type="number"
                    min="0"
                  />
                </div>
                <div className="bg-muted rounded-md p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reference Rate</span>
                    <span className="font-medium">{unitRate.toFixed(3)} USDT</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-muted-foreground">Estimated Payout</span>
                    <span className="font-medium">{estimatedPayout} USDT</span>
                  </div>
                </div>
                <Button className="w-full">Submit Buyback Request</Button>
                <p className="text-xs text-muted-foreground">
                  Requests are reviewed by admins before payout is released.
                </p>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Request History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Estimated Payout</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_REQUESTS.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-mono text-sm">{request.id}</TableCell>
                        <TableCell>{request.amount} SSC</TableCell>
                        <TableCell>{request.rate} USDT</TableCell>
                        <TableCell>{request.payout}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              request.status === "completed"
                                ? "success"
                                : request.status === "approved"
                                  ? "info"
                                  : "warning"
                            }
                          >
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{request.requestedAt}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </Container>
      </main>
    </Layout>
  );
}

