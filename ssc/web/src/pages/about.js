import React from "react";
import Head from "next/head";
import Link from "next/link";
import { Container, Layout } from "../components/Layout";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Shield, Coins, BarChart3, Users, ArrowRight } from "lucide-react";
import { useWallet } from "../contexts/WalletContext";
import { WalletButton } from "../components/WalletComponents";

const FEATURES = [
  {
    icon: <Coins className="w-6 h-6" />,
    title: "Token Buyback",
    description: "Sell your SSC tokens back to the platform at fair market prices, backed by reserve funds.",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Profit Distribution",
    description: "Receive regular distributions based on your SSC holdings, automatically calculated.",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Secure by Design",
    description: "Built on BSC with audited smart contracts, role-based access, and transparent audit logs.",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Community-Driven",
    description: "Governed by the Sawariya Seth Community, with transparent operations and shared rewards.",
  },
];

const TECHNICALS = [
  { label: "Blockchain", value: "Binance Smart Chain (BSC)" },
  { label: "Token Standard", value: "BEP-20" },
  { label: "Frontend", value: "Next.js 14 + React 18" },
  { label: "Wallets", value: "MetaMask, Trust Wallet, WalletConnect" },
  { label: "Networks", value: "BSC Mainnet & Testnet" },
  { label: "Styling", value: "Tailwind CSS + Custom Design Tokens" },
];

export default function About() {
  const { isConnected } = useWallet();

  return (
    <Layout>
      <Head>
        <title>About SSC Platform</title>
        <meta name="description" content="Learn about the Sawariya Seth Community SSC Token Platform" />
      </Head>

      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-sticky">
        <Container>
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-bold text-primary">SSC Platform</Link>
            <nav className="flex items-center gap-6">
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
              <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Admin</Link>
              <WalletButton />
            </nav>
          </div>
        </Container>
      </header>

      <main className="py-12">
        <Container>
          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl font-bold text-foreground mb-4">About SSC Platform</h1>
            <p className="text-lg text-muted-foreground">
              The Sawariya Seth Community SSC Token Platform provides transparent profit distribution,
              secure token buyback, and real-time portfolio tracking for community members.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {["50,000+", "4,800+", "1,200+", "99.9%"].map((stat, i) => (
              <Card key={i} className="text-center py-6">
                <p className="text-3xl font-bold text-primary">{stat}</p>
                <p className="text-sm text-muted-foreground mt-1">Total SSC Minted</p>
              </Card>
            ))}
          </div>

          {/* Features */}
          <h2 className="text-2xl font-bold text-foreground mb-8">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {FEATURES.map((feature, i) => (
              <Card key={i} variant="elevated" className="p-6">
                <div className="flex items-start gap-4">
                  <div className="text-primary flex-shrink-0">{feature.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Technical Details */}
          <h2 className="text-2xl font-bold text-foreground mb-8">Technical Details</h2>
          <Card className="p-6 mb-16 max-w-xl">
            <dl className="space-y-3">
              {TECHNICALS.map(({ label, value }, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <dt className="text-sm text-muted-foreground">{label}</dt>
                  <dd className="text-sm font-medium text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          {/* CTA */}
          <Card variant="elevated" className="text-center p-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Ready to get started?</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Connect your wallet and start managing your SSC tokens today.
            </p>
            <div className="flex items-center justify-center gap-4">
              {isConnected ? (
                <Link href="/dashboard">
                  <Button size="lg" variant="primary" className="gap-2">
                    Go to Dashboard <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <WalletButton />
              )}
            </div>
          </Card>
        </Container>
      </main>

      <footer className="border-t border-border py-6">
        <Container>
          <p className="text-sm text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} SSC Platform. All rights reserved.
          </p>
        </Container>
      </footer>
    </Layout>
  );
}
