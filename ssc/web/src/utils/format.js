export function formatAddress(address, startLength = 6, endLength = 4) {
  if (!address) return "";
  if (address.length < startLength + endLength) return address;
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

export function formatBalance(balance, decimals = 18, displayDecimals = 4) {
  if (balance === undefined || balance === null) return "0";
  const formatted = Number(balance) / 10 ** decimals;
  return formatted.toFixed(displayDecimals).replace(/\.?0+$/, "");
}

export function formatCurrency(amount, currency = "USD") {
  if (amount === undefined || amount === null) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date, options = { includeTime = false } = {}) {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "-";
  const baseOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  if (options.includeTime) {
    Object.assign(baseOptions, {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return d.toLocaleDateString("en-US", baseOptions);
}

export function formatPercentage(value, showSign = false) {
  if (value === undefined || value === null) return "-";
  const num = Number(value);
  if (isNaN(num)) return "-";
  const formatted = num.toFixed(2);
  if (showSign && num > 0) {
    return `+${formatted}%`;
  }
  return `${formatted}%`;
}
