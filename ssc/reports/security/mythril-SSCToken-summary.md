# Mythril Scan Summary: SSCToken

- Generated: 2026-04-10T18:27:25Z
- Source report: `reports/security/mythril-SSCToken.json`
- Total findings: 1
- Severity counts: High=1

## Findings

- [High] Integer Arithmetic Bugs (SWC-N/A)
  - Contract: MAIN, Function: constructor, SWC-101

## Disposition

- The previous Medium `Exception State` item is no longer present in the rerun output.
- The remaining High item is in synthetic `MAIN` bytecode constructor context (not in `SSCToken` source functions).
- See `reports/security/mythril-SSCToken-remediation.md` for false-positive rationale and acceptance notes.
