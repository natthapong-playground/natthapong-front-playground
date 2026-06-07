# Project guidance for Claude Code

## 📚 Always keep `docs/` up to date — read `docs/CLAUDE.md` first

This repo has a **living-documentation folder at `docs/`**. Its head file,
[`docs/CLAUDE.md`](docs/CLAUDE.md), is the authoritative protocol for keeping the
project documented. **Read it at the start of any task, and follow it.**

The non-negotiable rule from that file:

> Whenever you create, change, move, rename, or delete code, you MUST update the
> matching `.txt` file(s) in `docs/` in the SAME change.

The `docs/` files (all plain `.txt`, written in **both** a technical and a
plain-English style so engineers and non-engineers can both read them):

- `docs/structures.txt` — the file/folder map of the frontend
- `docs/files.txt` — what every source file is and why
- `docs/methods.txt` — every meaningful method / function / signal / route / API
- `docs/logs.txt` — dated changelog (newest at top), one entry per change
- `docs/CLAUDE.md` — the rules that govern all of the above

Before finishing any task, run the checklist in `docs/CLAUDE.md §5` to confirm
the docs still match the code on disk.

## App layout
The frontend app lives in `frontend-playground/` (Angular 21, standalone
components, Angular Material). `docs/structures.txt` is the current source of
truth for its file/folder layout and routes.
