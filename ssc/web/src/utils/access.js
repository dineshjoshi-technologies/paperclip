export function getAdminWallets() {
  const raw = process.env.NEXT_PUBLIC_ADMIN_WALLETS || "";
  return raw
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminWallet(address) {
  if (!address) return false;
  return getAdminWallets().includes(address.toLowerCase());
}

