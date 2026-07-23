# Living Documentation

PURPOSE
  TECH:  This directory records the current frontend structure, file ownership,
         meaningful symbols, routes, APIs, and dated documentation changes.
  PLAIN: Start here when you want to understand the application without reading
         every source file.

READING ORDER
  TECH:  Read structures.txt, files.txt, methods.txt, then logs.txt. CLAUDE.md is
         the maintenance protocol and defines the required TECH/PLAIN format.
  PLAIN: Begin with the map, continue to file explanations and behavior, and use
         the log to see what changed most recently.

structures.txt
  TECH:  Mirrors the tracked frontend-playground source tree and identifies route
         and architectural boundaries; generated output is intentionally omitted.
  PLAIN: Shows where each part of the frontend lives.

files.txt
  TECH:  Describes the responsibility of every tracked application, configuration,
         asset, template, style, and test file under frontend-playground/.
  PLAIN: Explains why each file exists and what it contributes.

methods.txt
  TECH:  Catalogs meaningful methods, signals, computed state, outputs, routes,
         guards, storage effects, timers, and HTTP calls.
  PLAIN: Explains what the application does when a user signs in, navigates, filters
         logs, or interacts with the world clock.

logs.txt
  TECH:  Stores newest-first dated entries for documentation and behavior changes.
  PLAIN: Provides a short history of what changed and why.

MAINTENANCE
  TECH:  Follow CLAUDE.md and update the matching .txt documents in the same change
         whenever frontend code, routes, methods, or behavior changes.
  PLAIN: Keep these explanations updated whenever the application changes so future
         readers are not misled.
