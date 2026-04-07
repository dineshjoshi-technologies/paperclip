import React from "react";
import Head from "next/head";
import Link from "next/link";
import { useWallet } from "../contexts/WalletContext";
import { WalletButton } from "../components/WalletComponents";
import { Container, Layout } from "../components/Layout";
import { Card } from "../components/Card";
import { Button } from "../components/Button";

export default function Home() {
  const { isConnected, account } = useWallet();

  return (
    <Layout>
      <Head>
        <title>SSC Platform</title>
        <meta name="description" content="Sawariya Seth Community SSC Token Platform" />
      </Head>

      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-sticky">
        <Container>
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-bold text-primary">
              SSC Platform
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Admin
              </Link>
              <WalletButton />
            </nav>
          </div>
        </Container>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <Container className="py-16">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              SSC Token
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Manage your SSC tokens, view profit distributions, and track your
              investment all in one place.
            </p>
            <div className="flex items-center justify-center gap-4">
              {isConnected ? (
                <Link href="/dashboard">
                  <Button size="lg" variant="primary">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <WalletButton />
              )}
              <Link href="/about">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <Card variant="elevated" className="text-center">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Profit Distribution
              </h3>
              <p className="text-sm text-muted-foreground">
                Receive regular profit distributions based on your SSC holdings
              </p>
            </Card>
            <Card variant="elevated" className="text-center">
              <div className="text-3xl mb-3">🔄</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Token Buyback
              </h3>
              <p className="text-sm text-muted-foreground">
                Sell your SSC tokens back to the platform at fair market prices
              </p>
            </Card>
            <Card variant="elevated" className="text-center">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Real-Time Tracking
              </h3>
              <p className="text-sm text-muted-foreground">
                Monitor your balance, transactions, and platform activity 24/7
              </p>
            </Card>
          </div>
        </Container>
      </main>

      {/* Footer */}
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
