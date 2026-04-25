# SAW-71 Pre-Execution Validation Packet (Blockchain)

Prepared for [SAW-37](/SAW/issues/SAW-37) kickoff readiness.

## 1) Final Scope Checklist (Runtime-Mapped)

Target contract: `contracts/SSCToken.sol`

| Checklist item | Runtime target(s) | Validation focus | Ready state |
| --- | --- | --- | --- |
| Initializer hardening | `initialize(...)`, constructor `_disableInitializers()` | Verify initializer can only execute once through proxy, confirm implementation contract cannot be initialized post-deploy | Ready |
| Upgrade authorization path | `_authorizeUpgrade(address)` (`onlyOwner`) | Attempt unauthorized UUPS upgrade via non-owner actor and delegated proxy call path | Ready |
| Owner-privileged function boundaries | `mint`, `burn`, `burnFrom`, `pause`, `unpause`, `_authorizeUpgrade` | Confirm only owner can invoke each privileged path; verify revert behavior for unauthorized callers | Ready |
| Pause gating on token movement | `_update(address,address,uint256)` with `whenNotPaused` | Confirm pause blocks `transfer` and `transferFrom`, and unpause restores path | Ready |
| Allowance edge behavior | `increaseAllowance`, `decreaseAllowance`, inherited `approve`/`transferFrom` | Validate race/boundary behavior, underflow guard in `decreaseAllowance`, and expected revert semantics | Ready |
| SWC-101 runtime relevance checks | `increaseAllowance` addition path, `decreaseAllowance` checked subtraction + `unchecked` block | Confirm no exploitable runtime overflow/underflow in Solidity `0.8.22`; classify constructor-context SWC-101 from Mythril as non-runtime unless contradictory dynamic evidence appears | Ready |

## 2) Kickoff Command Sheet (One Page)

Objective: enable immediate blockchain test execution when GO signal is issued.

### Commands

```bash
npm ci
npx hardhat compile
npm test
npm run mythril:scan
```

Optional deployment verification:

```bash
npx hardhat run scripts/deploy.js --network bsctest
# reference path for production deployment flow
npx hardhat run scripts/deploy-bsc-mainnet.js --network bsc
```

### Artifact paths for kickoff handoff

- Primary pentest handoff: `reports/security/pentest-handoff-blockchain.md`
- Mythril raw report: `reports/security/mythril-SSCToken.json`
- Mythril summary: `reports/security/mythril-SSCToken-summary.md`
- Mythril remediation/disposition: `reports/security/mythril-SSCToken-remediation.md`
- Bytecode reference used in prior static analysis: `reports/security/SSCToken.bytecode`
- Evidence template index: `reports/security/evidence/README.md`
- Contract source in scope: `contracts/SSCToken.sol`

### Immediate handoff pointers

1. Use `reports/security/pentest-handoff-blockchain.md` as the external tester scope + target matrix.
2. Use Mythril files as baseline context only; require independent runtime exploitability confirmation.
3. Record all kickoff findings in `reports/security/evidence/` placeholders (`01`-`06`) for unified report packaging.

## 3) Contingency Delta Note (Fallback Window)

If CEO confirms fallback kickoff window:

- Stays constant:
  - Contract scope and runtime checklist above.
  - Artifact paths and command sheet.
  - SWC-101 validation criteria and evidence structure.
- Changes:
  - Regenerate dynamic evidence timestamps and rerun `npm run mythril:scan` immediately before handoff.
  - Reconfirm deployment metadata (proxy/implementation addresses) in latest environment before external execution.
  - Repost final kickoff timestamp + owner acknowledgment on [SAW-37](/SAW/issues/SAW-37).

## 4) Missing Blockchain Prerequisites (Owner + ETA)

| Prerequisite | Owner | ETA | Status |
| --- | --- | --- | --- |
| External GO decision (legal/procurement) for pentest start window | CEO / procurement decision owner | Pending leadership confirmation; required before vendor execution | Open |
| Final runtime deployment metadata for active kickoff environment (proxy + implementation addresses) | Blockchain engineering (this stream) | Within 30 minutes of GO | Pending GO |
| Vendor kickoff acknowledgment on final window | Security QA / pentest coordinator | Within 1 business hour after GO | Pending GO |

## 5) Handoff Outcome for SAW-37

This packet removes blockchain-side startup latency. Once GO is confirmed, QA can start immediately using the checklist, command sheet, and artifact pointers above without additional scoping work.
