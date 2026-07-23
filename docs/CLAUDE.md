# 📘 docs/ — Living Documentation (HEAD / governing file)

> **This file is the "head" of the `docs/` folder.** It tells Claude Code how to
> keep this documentation alive. Read it before touching anything in this folder,
> and follow it whenever you change application code.

---

## 0. The one rule

**Whenever you create, change, move, rename, or delete code in this repo, you
MUST update the matching `.txt` file(s) in `docs/` in the SAME change.**

Code and docs ship together. A pull request that changes behaviour but leaves
these files stale is considered incomplete.

---

## 1. What lives here

| File             | Tracks…                                                            |
|------------------|--------------------------------------------------------------------|
| `CLAUDE.md`      | (this file) the rules for keeping docs updated — the head          |
| `README.txt`     | human entry point: what this folder is, how to read it             |
| `structures.txt` | the file/folder tree of the frontend + one-line purpose per item   |
| `files.txt`      | every source file: what it is and why it exists                    |
| `methods.txt`    | every meaningful method / function / signal: signature + behaviour |
| `logs.txt`       | a dated changelog of what changed and why (newest at top)          |

> `structures.txt` here documents the **frontend app** (`frontend-playground/`) and
> is the source of truth for day-to-day frontend work.

---

## 2. The dual-format rule (technical + plain)

Every entry is written for **two readers at once**:

- **TECH:** precise, for engineers — real names, signatures, types, return
  values, side effects, file paths.
- **PLAIN:** one or two sentences a non-developer can follow — no jargon,
  explain *what it does for the user / why it matters*.

Template for any documented item:

```
NAME            <symbol / file / route>
  TECH:  <signature, types, where it lives, what it returns / mutates>
  PLAIN: <plain-English: what it does and why someone would care>
```

Keep both lines in sync. If you can't write the PLAIN line without jargon, the
code is probably doing too much — say so in `logs.txt`.

`structures.txt` may include a compact tree index using `path - one-line purpose`
for each item. The tree is an index, not a set of standalone entries; its surrounding
section and all explanatory entries below it still use the TECH/PLAIN format. The
full dual-format responsibility for each file remains in `files.txt`.

---

## 3. When to update which file

| You did this…                                  | Update…                              |
|------------------------------------------------|--------------------------------------|
| Added / removed / renamed / moved a file       | `structures.txt` + `files.txt`       |
| Added / changed a method, function, or signal  | `methods.txt`                        |
| Added / changed a route, guard, or API call    | `methods.txt` (+ `files.txt` if new) |
| Any behaviour change worth remembering         | `logs.txt` (always)                  |
| Changed how docs themselves work               | this `CLAUDE.md`                      |

`logs.txt` gets an entry for **every** functional change, even small ones.

---

## 4. House style

- Plain `.txt`, wrap around ~100 columns, UTF-8.
- Group by area (core / features / config), mirroring `structures.txt`.
- Newest changelog entries go at the **top** of `logs.txt`.
- Use absolute, real symbol names — never "the function above".
- Prefer updating an existing entry over appending a duplicate.
- If something is planned but not built yet, mark it `(planned)`.

---

## 5. Quick checklist before you finish a task

1. Did any file get added/removed/renamed? → `structures.txt`, `files.txt`
2. Did any method/signal/route change? → `methods.txt`
3. Did behaviour change at all? → `logs.txt` (dated entry, newest on top)
4. Are both **TECH** and **PLAIN** lines present and consistent?
5. Does `structures.txt` still match the real tree on disk?

If all five are true, the docs are in sync. ✅
