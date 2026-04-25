import React from "react";
import Head from "next/head";
import Link from "next/link";
import { useWallet } from "../contexts/WalletContext";
import { Container, Layout, Grid } from "../components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "../components/Card";
import { Button } from "../components/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/Table";
import { Badge } from "../components/Badge";
import { WalletButton } from "../components/WalletComponents";
import { formatAddress } from "../utils/format";
import { isAdminWallet } from "../utils/access";

const MOCK_USERS = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", wallet: "0x1234...5678", tokens: "5,000", status: "active", joined: "2024-01-15" },
  { id: 2, name: "Bob Smith", email: "bob@example.com", wallet: "0x8765...4321", tokens: "12,000", status: "active", joined: "2024-02-03" },
  { id: 3, name: "Charlie Brown", email: "charlie@example.com", wallet: "0x2468...1357", tokens: "3,200", status: "suspended", joined: "2024-03-10" },
];

const MOCK_BUYBACKS = [
  { id: 1, user: "Alice Johnson", amount: "500 SSC", price: "$25.00", status: "pending", date: "2024-03-15" },
  { id: 2, user: "Bob Smith", amount: "1,000 SSC", price: "$50.00", status: "approved", date: "2024-03-14" },
];

const MOCK_AUDIT = [
  { id: 1, action: "Profit distributed", user: "System", details: "500 USDT to 12 holders", timestamp: "2024-03-15 14:30" },
  { id: 2, action: "Buyback approved", user: "Admin", details: "1,000 SSC for Bob Smith", timestamp: "2024-03-14 10:15" },
  { id: 3, action: "User suspended", user: "Admin", details: "Charlie Brown - suspicious activity", timestamp: "2024-03-13 08:45" },
];

export default function Admin() {
  const { isConnected, account } = useWallet();
  const hasAdminAccess = isAdminWallet(account);

  if (!isConnected) {
    return (
      <Layout>
        <Head><title>Admin Panel - SSC Platform</title></Head>
        <Container className="py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Connect Your Wallet</h1>
          <p className="text-muted-foreground mb-6">Admin panel access requires a connected wallet.</p>
          <WalletButton />
        </Container>
      </Layout>
    );
  }

  if (!hasAdminAccess) {
    return (
      <Layout>
        <Head><title>Admin Panel - SSC Platform</title></Head>
        <Container className="py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Restricted</h1>
          <p className="text-muted-foreground mb-2">
            Wallet <span className="font-mono text-foreground">{formatAddress(account)}</span> does not have admin privileges.
          </p>
          <p className="text-muted-foreground mb-6">
            Ask the platform owner to add your wallet to `NEXT_PUBLIC_ADMIN_WALLETS`.
          </p>
          <Button as={Link} href="/dashboard">Go to Dashboard</Button>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head><title>Admin Panel - SSC Platform</title></Head>
      
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-sticky">
        <Container>
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-bold text-primary">SSC Platform</Link>
            <nav className="flex items-center gap-6">
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
              <Link href="/admin" className="text-sm text-foreground font-medium">Admin</Link>
            </nav>
          </div>
        </Container>
      </header>

      <main className="py-8">
        <Container>
          <h1 className="text-2xl font-bold text-foreground mb-6">Admin Panel</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="text-center">
              <CardContent className="py-4">
                <p className="text-3xl font-bold text-primary">842</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="py-4">
                <p className="text-3xl font-bold text-success">50,000</p>
                <p className="text-sm text-muted-foreground">Total SSC Minted</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="py-4">
                <p className="text-3xl font-bold text-accent">$12,450</p>
                <p className="text-sm text-muted-foreground">Reserve Balance</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="py-4">
                <p className="text-3xl font-bold text-info">24</p>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
              </CardContent>
            </Card>
          </div>

          <Grid cols={{ default: 1, lg: 2 }} gap={6} className="mb-8">
            {/* User Management */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>User Management</CardTitle>
                <Button size="sm" variant="outline">Add User</Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Wallet</TableHead>
                      <TableHead>SSC Tokens</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_USERS.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{user.wallet}</TableCell>
                        <TableCell>{user.tokens}</TableCell>
                        <TableCell>
                          <Badge variant={user.status === "active" ? "success" : "destructive"}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{user.joined}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="xs" variant="ghost">Edit</Button>
                            <Button size="xs" variant="ghost">Suspend</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Buyback Management */}
            <Card>
              <CardHeader>
                <CardTitle>Buyback Requests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {MOCK_BUYBACKS.map((req) => (
                  <div key={req.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium">{req.user}</p>
                      <p className="text-xs text-muted-foreground">{req.amount} - {req.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={req.status === "approved" ? "success" : "warning"}>{req.status}</Badge>
                      {req.status === "pending" && (
                        <div className="flex gap-1">
                          <Button size="xs" variant="success">Approve</Button>
                          <Button size="xs" variant="destructive">Deny</Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Audit Log */}
            <Card>
              <CardHeader>
                <CardTitle>Audit Log</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {MOCK_AUDIT.map((log) => (
                  <div key={log.id} className="py-2 border-b border-border last:border-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{log.action}</p>
                      <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{log.user} - {log.details}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Container>
      </main>
    </Layout>
  );
}
