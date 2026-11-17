---
name: remote-skill-init
description: Suggest and select global agent skills to copy into .agents/skills/ and commit for Antigravity remote agents.
disable-model-invocation: true
---

# Remote Skill Init

Select global skills from the local machine, copy them into this repository's `.agents/skills/` folder, and commit them so Antigravity remote agents have the needed capabilities after pushing to GitHub.

## Process

### 1. Inspect Repo and Global Skills

Inspect the current workspace and available global skills before proposing anything:

- **Workspace context**: Check root files (e.g., `package.json`, `foundry.toml`, `Cargo.toml`, `pyproject.toml`, `README.md`) to infer the project domain and tech stack.
- **Git root**: Compare the current directory against `git rev-parse --show-toplevel` to verify whether this directory already has its own `.git` folder (do not rely on a parent directory's `.git`).
- **Existing workspace skills**: Check `<repo>/.agents/skills/` if it already exists.
- **Global skill sources**: Scan both `~/.gemini/config/skills/` and `~/.agents/skills/`.
  - A valid skill directory contains a `SKILL.md` directly inside it (`<skill>/SKILL.md`).
  - Read each valid skill's frontmatter (`name`, `description`) so recommendations are grounded in actual descriptions.
  - Note any wrapper folders without a direct `SKILL.md` separately (do not treat them as skills).

### 2. Suggest and Confirm Selection

Present a clear summary of what was found and help the user choose which skills to add:

- **Recommended for this repo**: Highlight skills matching the detected stack/workflow (and note any already present in `.agents/skills/`).
- **Remaining available skills**: List the rest concisely grouped by purpose (e.g., engineering workflow, frontend, web3, utilities).
- **Selection**: Let the user pick how to filter — e.g., accept all recommended, include all except specific exclusions, or pick individual skills. Use `ask_question` when helpful, and allow free-form adjustments.

Completion criterion: Wait for the user's explicit confirmation of the final list of skills to copy before modifying any files.

### 3. Copy to `.agents/skills/`

- Create `.agents/skills/` at the repository root if missing.
- Copy each confirmed skill directory recursively (preserving `SKILL.md` and any subfolders like `scripts/`, `references/`, `agents/`) into `.agents/skills/<skill-name>/`.
- Use regular file copies (never symlinks) so skills stay portable across OSes on GitHub and in remote containers.
- Verify every copied folder contains `<repo>/.agents/skills/<skill-name>/SKILL.md`.

### 4. Git Init and Commit

- If the repository root does not have its own `.git` directory, run `git init`.
- Stage `.agents/skills/`: `git add .agents/skills`.
- Commit with a clean message: `chore: add workspace skills for remote agent` (ask first if the user wants other untracked files committed separately).
- Check `git remote -v`: if no remote is configured yet, tell the user the repo is committed and ready to link/push to GitHub.
