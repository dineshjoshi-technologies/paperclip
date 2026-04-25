#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

REPORT_DIR="reports/security"
BYTECODE_FILE="$REPORT_DIR/SSCToken.bytecode"
REPORT_FILE="$REPORT_DIR/mythril-SSCToken.json"

mkdir -p "$REPORT_DIR"

echo "Compiling contracts..."
npx hardhat compile >/dev/null

echo "Extracting deployed bytecode..."
node -e "const fs=require('fs');const p='artifacts/contracts/SSCToken.sol/SSCToken.json';const a=JSON.parse(fs.readFileSync(p,'utf8'));const b=(typeof a.deployedBytecode==='string'?a.deployedBytecode:a.deployedBytecode?.object)||'';if(!b||b==='0x'){console.error('Missing deployed bytecode in '+p);process.exit(1);}fs.writeFileSync('$BYTECODE_FILE', b.startsWith('0x')?b.slice(2):b);"

run_myth() {
  local out_file="$1"
  local myth_args=(analyze -f "$BYTECODE_FILE" -o json --execution-timeout 300)
  local timeout_seconds="${MYTHRIL_TIMEOUT_SECONDS:-420}"
  local status=0
  local local_myth="$ROOT_DIR/.venv-mythril/bin/myth"

  if command -v myth >/dev/null 2>&1; then
    timeout "${timeout_seconds}s" myth "${myth_args[@]}" >"$out_file" || status=$?
    if [[ "$status" -eq 124 ]]; then
      echo "Mythril scan timed out after ${timeout_seconds}s." >&2
      return 124
    fi
    return "$status"
  fi

  if [[ -x "$local_myth" ]]; then
    timeout "${timeout_seconds}s" "$local_myth" "${myth_args[@]}" >"$out_file" || status=$?
    if [[ "$status" -eq 124 ]]; then
      echo "Mythril scan timed out after ${timeout_seconds}s." >&2
      return 124
    fi
    return "$status"
  fi

  if command -v docker >/dev/null 2>&1; then
    timeout "${timeout_seconds}s" docker run --rm -v "$ROOT_DIR:/work" -w /work mythril/myth:latest \
      "${myth_args[@]}" >"$out_file" || status=$?
    if [[ "$status" -eq 124 ]]; then
      echo "Mythril scan timed out after ${timeout_seconds}s." >&2
      return 124
    fi
    return "$status"
  fi

  echo "Neither 'myth' nor 'docker' is available. Install Mythril or Docker to run this scan." >&2
  return 1
}

echo "Running Mythril scan..."
run_myth "$REPORT_FILE"

echo "Mythril report written to: $REPORT_FILE"
