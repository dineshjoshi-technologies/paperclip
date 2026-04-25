# Mythril Remediation Disposition: SSCToken

## Scope

- Report analyzed: `reports/security/mythril-SSCToken.json`
- Contract under review: `contracts/SSCToken.sol`
- Scan command: `npm run mythril:scan`

## Finding Review

### [High] Integer Arithmetic Bugs (SWC-101)

- Report context: `contract=MAIN`, `function=constructor`, `sourceMap=5498`
- Impacted source function: none in `SSCToken.sol`
- Status: accepted false positive

Rationale:

- Mythril is scanning deployed bytecode and reports against synthetic `MAIN` constructor context, not a concrete source function in `SSCToken`.
- `SSCToken` uses Solidity `^0.8.22`, which has built-in checked arithmetic by default (overflow/underflow reverts).
- The only explicit `unchecked` block in `SSCToken` is in `decreaseAllowance`, guarded by `require(currentAllowance >= subtractedValue)`, so no underflow path is reachable there.
- No exploitable arithmetic path was identified in externally callable token logic (`mint`, `burn`, `burnFrom`, `transfer`, `transferFrom`, allowance flows).

Residual risk:

- Bytecode-only symbolic analysis can continue to emit synthetic constructor-level SWC-101 alerts with limited source correlation.
- Complementary checks remain recommended (`slither`, unit/invariant tests, and manual review) for defense in depth.

## Tooling Fix Applied

- Updated `scripts/run-mythril.sh` to auto-detect local Mythril binary at `.venv-mythril/bin/myth` before falling back to Docker.
- This makes project-local scan execution deterministic in environments without global `myth` on `PATH`.
