# Triage Labels

The skills speak in terms of five canonical triage roles. This file maps those roles to the actual label strings used in this repo's GitHub issue tracker, tailored to split autonomous agent work from human handoffs for BCH BLAZE 2026.

| Label in mattpocock/skills | Label in our tracker | Meaning in this project |
| -------------------------- | -------------------- | ---------------------------------------- |
| `needs-triage`             | `needs-triage`       | New hackathon idea, bug, or task awaiting scope & eligibility check |
| `needs-info`               | `needs-info`         | Blocked on user decision, BCH domain spec, or missing requirement |
| `ready-for-agent`          | `ready-for-agent`    | Fully specified for autonomous agent execution (CashScript `.cash` contracts, TypeScript SDK/TransactionBuilder, `MockNetworkProvider` tests, WizardConnect wiring, frontend scaffolding, docs) |
| `ready-for-human`          | `ready-for-human`    | Requires human handoff & judgment (UI/UX design review & visual polish, buying/withdrawing BCH on exchange, testing real wallet QR signing on mainnet, DoraHacks registration, Telegram `@bchblaze` check-in, Widget Factory slides) |
| `wontfix`                  | `wontfix`            | Cut from hackathon MVP scope / will not be actioned |

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), use the corresponding label string from this table.
