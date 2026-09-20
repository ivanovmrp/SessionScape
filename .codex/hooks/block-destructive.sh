#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# Destructive Operation Guard (Codex PreToolUse hook, shell commands)
# ═══════════════════════════════════════════════════════════════
#
# Denies destructive commands in five categories:
#
#   §1  Filesystem Destruction
#   §2  Git Destructive Operations
#   §3  Database Destruction
#   §4  Recursive Permission & Ownership Changes
#   §5  Disk & Partition Operations
#
# Input:  JSON on stdin (tool_input.command has the shell command)
# Output: JSON with permissionDecision "deny" when blocked
# Exit:   0 with JSON payload; 2 (fail closed) if jq is missing
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

if ! command -v jq >/dev/null 2>&1; then
  echo "block-destructive hook: jq is required — failing closed. Install jq or remove this hook from .codex/hooks.json." >&2
  exit 2
fi

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
CWD=$(echo "$INPUT" | jq -r '.cwd // empty')

if [[ -z "$COMMAND" ]]; then
  exit 0
fi

# Determine if cwd is a sensitive location (home directory or root).
# Relative-path exceptions for rm -rf are disabled in sensitive locations.
SENSITIVE_CWD=false
if [[ "$CWD" == "$HOME" || "$CWD" == "/" ]]; then
  SENSITIVE_CWD=true
fi

deny() {
  local policy_id="$1"
  local reason="$2"
  jq -n \
    --arg reason "[$policy_id] $reason" \
    '{
      "hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "deny",
        "permissionDecisionReason": $reason
      }
    }'
  exit 0
}

# ───────────────────────────────────────────────────────────────
# §1  Filesystem Destruction
# ───────────────────────────────────────────────────────────────

# forbid-rm-rf: rm with both -r and -f flags in any combination (rm -rf, rm -fr, rm -Rf, rm -rfi, sudo rm -rf, etc.)
# Exceptions:
#   - /tmp/ subpaths are always allowed (temporary test files live there)
#   - Relative paths (no leading / or ~) are allowed when cwd is NOT home or root
if echo "$COMMAND" | grep -qE '(^|[^a-zA-Z])rm\s+-[a-zA-Z]*([rR][a-zA-Z]*f|f[a-zA-Z]*[rR])'; then
  # Check if the rm target is /tmp/ subpath (not bare /tmp/) — always allowed
  if echo "$COMMAND" | grep -qE '(^|[^a-zA-Z])rm\s+-[a-zA-Z]*([rR][a-zA-Z]*f|f[a-zA-Z]*[rR])\s+/tmp/[^[:space:]]'; then
    : # allowed
  # Check if target is an absolute path (starts with / or ~) — always blocked
  elif echo "$COMMAND" | grep -qE '(^|[^a-zA-Z])rm\s+-[a-zA-Z]*([rR][a-zA-Z]*f|f[a-zA-Z]*[rR])\s+(/|~)'; then
    deny "forbid-rm-rf" \
      "Recursive force-delete (rm -rf) blocked — prevents accidental or malicious filesystem wipe."
  # Relative path in sensitive cwd (home or root) — blocked
  elif [[ "$SENSITIVE_CWD" == true ]]; then
    deny "forbid-rm-rf" \
      "Recursive force-delete (rm -rf) blocked — cwd is a sensitive location ($CWD), relative rm -rf not allowed."
  fi
  # else: relative path in a project directory — allowed
fi

# forbid-rm-recursive: rm -r targeting absolute paths (/ or ~)
# Exception: /tmp/ subpaths are allowed
if echo "$COMMAND" | grep -qE '(^|[^a-zA-Z])rm\s+-[a-zA-Z]*r[a-zA-Z]*\s+(/|~)' \
   && ! echo "$COMMAND" | grep -qE '(^|[^a-zA-Z])rm\s+-[a-zA-Z]*r[a-zA-Z]*\s+/tmp/[^[:space:]]'; then
  deny "forbid-rm-recursive" \
    "Recursive delete targeting root or home directory blocked — catastrophic data loss."
fi

# forbid-rm-root: any rm targeting / directly
if echo "$COMMAND" | grep -qE '(^|[^a-zA-Z])rm\s+[^|]*\s+/($|\s)'; then
  deny "forbid-rm-root" \
    "rm targeting root directory blocked — catastrophic data loss."
fi

# forbid-shred: shred makes recovery impossible
if echo "$COMMAND" | grep -qE '(^|[^a-zA-Z])shred\s'; then
  deny "forbid-shred" \
    "shred blocked — secure deletion makes file recovery impossible."
fi

# forbid-wipe-dd: dd writing to block devices
if echo "$COMMAND" | grep -qE 'dd\s.*of=/dev/'; then
  deny "forbid-wipe-dd" \
    "dd to block device blocked — can destroy entire disks."
fi

# forbid-mkfs: filesystem creation erases target device
if echo "$COMMAND" | grep -qE '(^|[^a-zA-Z])mkfs'; then
  deny "forbid-mkfs" \
    "mkfs blocked — filesystem creation erases all data on the target device."
fi

# forbid-dev-null-redirect: silently destroying data
if echo "$COMMAND" | grep -qE '>\s*/dev/null\s+2>&1\s*<|cat\s+/dev/null\s*>'; then
  deny "forbid-dev-null-redirect" \
    "Redirecting file content to /dev/null blocked — silently destroys data."
fi

# ───────────────────────────────────────────────────────────────
# §2  Git Destructive Operations
# ───────────────────────────────────────────────────────────────

# forbid-git-force-push: rewrites remote history, can destroy collaborators' work
if echo "$COMMAND" | grep -qE 'git\s+push\s+(.*\s)?(-f|--force)(\s|$)'; then
  deny "forbid-git-force-push" \
    "git force push blocked — rewrites remote history, can destroy collaborators' work."
fi

# forbid-git-reset-hard: discards all uncommitted changes irreversibly
if echo "$COMMAND" | grep -qE 'git\s+reset\s+--hard'; then
  deny "forbid-git-reset-hard" \
    "git reset --hard blocked — discards all uncommitted changes irreversibly."
fi

# forbid-git-clean-force: permanently deletes untracked files
# Match any flag combination containing 'f' (the force flag)
if echo "$COMMAND" | grep -qE 'git\s+clean\s+-[a-zA-Z]*f'; then
  deny "forbid-git-clean-force" \
    "git clean -f blocked — permanently deletes untracked files."
fi

# forbid-git-checkout-discard: discards all unstaged changes in working tree
# Match only bare "." (not "./path"), using end-of-string or whitespace after the dot
if echo "$COMMAND" | grep -qE 'git\s+checkout\s+(--\s+)?\.\s*$'; then
  deny "forbid-git-checkout-discard" \
    "git checkout . blocked — discards all unstaged changes in working tree."
fi

# forbid-git-restore-discard: discards all unstaged changes (modern equivalent)
if echo "$COMMAND" | grep -qE 'git\s+restore\s+(\.|--(staged\s+--worktree|worktree\s+--staged))'; then
  deny "forbid-git-restore-discard" \
    "git restore . blocked — discards all unstaged changes in working tree."
fi

# forbid-git-branch-force-delete: force-deletes branches without merge check
if echo "$COMMAND" | grep -qE 'git\s+branch\s+-D\s'; then
  deny "forbid-git-branch-force-delete" \
    "git branch -D blocked — force-deletes branches without checking if merged, can lose unmerged work."
fi

# forbid-git-no-verify: bypasses pre-commit/pre-push hooks and safety checks
if echo "$COMMAND" | grep -qE 'git\s+(commit|push|merge)\s+.*--no-verify'; then
  deny "forbid-git-no-verify" \
    "git --no-verify blocked — bypasses pre-commit hooks and safety checks."
fi

# forbid-git-filter-branch: rewrites entire repository history
if echo "$COMMAND" | grep -qE 'git\s+filter-(branch|repo)'; then
  deny "forbid-git-filter-branch" \
    "git filter-branch/filter-repo blocked — rewrites entire repository history."
fi

# ───────────────────────────────────────────────────────────────
# §3  Database Destruction
# ───────────────────────────────────────────────────────────────

# forbid-drop-database
if echo "$COMMAND" | grep -qiE 'DROP\s+DATABASE|dropdb\s'; then
  deny "forbid-drop-database" \
    "DROP DATABASE blocked — permanently destroys entire databases."
fi

# forbid-drop-table
if echo "$COMMAND" | grep -qiE 'DROP\s+TABLE'; then
  deny "forbid-drop-table" \
    "DROP TABLE blocked — permanently destroys tables and their data."
fi

# forbid-truncate-table (requires SQL context: TRUNCATE TABLE or TRUNCATE followed by a table name pattern)
if echo "$COMMAND" | grep -qiE 'TRUNCATE\s+TABLE\s|TRUNCATE\s+[a-z_][a-z0-9_]*\s*;'; then
  deny "forbid-truncate-table" \
    "TRUNCATE blocked — irrecoverably deletes all rows from a table."
fi

# forbid-delete-without-where
if echo "$COMMAND" | grep -qiE 'DELETE\s+FROM' && ! echo "$COMMAND" | grep -qiE 'WHERE'; then
  deny "forbid-delete-without-where" \
    "DELETE FROM without WHERE clause blocked — would delete all rows in the table."
fi

# forbid-redis-flushall
if echo "$COMMAND" | grep -qiE 'FLUSHALL|FLUSHDB'; then
  deny "forbid-redis-flushall" \
    "Redis FLUSHALL/FLUSHDB blocked — destroys all data in Redis."
fi

# forbid-mongo-dropDatabase
if echo "$COMMAND" | grep -qE 'dropDatabase|\.drop\(\)'; then
  deny "forbid-mongo-dropDatabase" \
    "MongoDB dropDatabase/drop() blocked — permanently destroys a database."
fi

# ───────────────────────────────────────────────────────────────
# §4  Recursive Permission & Ownership Changes
# ───────────────────────────────────────────────────────────────

# forbid-chmod-recursive-permissive
if echo "$COMMAND" | grep -qE 'chmod\s+-R\s+(777|666|a\+rwx)\s'; then
  deny "forbid-chmod-recursive-permissive" \
    "Recursive chmod to 777/666/a+rwx blocked — breaks file security model."
fi

# forbid-chown-recursive-root
if echo "$COMMAND" | grep -qE 'chown\s+-R\s+root(:|$|\s)'; then
  deny "forbid-chown-recursive-root" \
    "Recursive chown to root blocked — can lock out the current user from their own files."
fi

# ───────────────────────────────────────────────────────────────
# §5  Disk & Partition Operations
# ───────────────────────────────────────────────────────────────

# forbid-fdisk
if echo "$COMMAND" | grep -qE '(^|[^a-zA-Z])(fdisk|parted|gdisk)\s'; then
  deny "forbid-fdisk" \
    "Partition tool blocked — partition table modification can destroy all data on a disk."
fi

# forbid-wipefs
if echo "$COMMAND" | grep -qE '(^|[^a-zA-Z])wipefs\s'; then
  deny "forbid-wipefs" \
    "wipefs blocked — erases filesystem signatures from block devices."
fi

# ───────────────────────────────────────────────────────────────
# All checks passed — allow the command
# ───────────────────────────────────────────────────────────────
exit 0
