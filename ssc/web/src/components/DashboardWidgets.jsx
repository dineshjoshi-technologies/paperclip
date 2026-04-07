import React from "react";
import clsx from "clsx";

export function TokenDisplay({ symbol = "SSC", balance = "0", price = null, className = "", size = "md" }) {
  const sizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-2xl font-bold",
    xl: "text-4xl font-bold",
  };

  const valueWithCommas = Number(balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });

  return (
    <div className={clsx("text-foreground", sizes[size], className)}>
      <span>{valueWithCommas}</span>
      <span className="ml-1 text-muted-foreground">{symbol}</span>
      {price != null && (
        <span className="ml-2 text-xs text-muted-foreground">
          ≈ ${(Number(balance) * price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      )}
    </div>
  );
}

export function TransactionRow({ hash, from, to, amount, status, timestamp, className = "" }) {
  const statusConfig = {
    pending: { label: "Pending", variant: "warning" },
    confirmed: { label: "Confirmed", variant: "success" },
    failed: { label: "Failed", variant: "destructive" },
  };

  const cfg = statusConfig[status] || statusConfig.pending;

  const timeAgo = (ts) => {
    if (!ts) return "";
    const diff = Date.now() - ts;
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  const shortHash = hash ? `${hash.slice(0, 6)}...${hash.slice(-4)}` : "";
  const shortAddr = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  return (
    <div className={clsx("flex items-center justify-between py-3 border-b border-border last:border-0", className)}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {shortHash && (
            <a href="#" className="text-primary hover:underline font-mono text-sm truncate">{shortHash}</a>
          )}
          <span className={clsx(
            "px-1.5 py-0.5 text-xs rounded-full",
            cfg.variant === "success" ? "bg-success/20 text-success" :
            cfg.variant === "destructive" ? "bg-destructive/20 text-destructive" :
            "bg-warning/20 text-warning"
          )}>{cfg.label}</span>
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <span>From: {shortAddr(from)}</span>
          <span>→</span>
          <span>To: {shortAddr(to)}</span>
        </div>
      </div>
      <div className="text-right ml-4">
        <p className="text-sm font-medium text-foreground">{amount}</p>
        <p className="text-xs text-muted-foreground">{timeAgo(timestamp)}</p>
      </div>
    </div>
  );
}

export function StatCard({ label, value, change = null, icon = null, className = "" }) {
  return (
    <div className={clsx("bg-card border border-border rounded-lg p-4", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
      {change != null && (
        <p className={clsx("text-xs mt-1", change >= 0 ? "text-success" : "text-destructive")}>
          {change >= 0 ? "↑" : "↓"} {Math.abs(change)}% from last period
        </p>
      )}
    </div>
  );
}
