---
name: translate-ptbr-to-english
description: Translate technical documents from Brazilian Portuguese to English with high semantic fidelity, preserving markdown structure, commands, and critical terminology. Use this skill when you need production-ready English technical docs without changing operational behavior.
---

## Context

This skill translates technical engineering docs from pt-BR to English while preserving behavior and structure.

## Process

1. **Pre-analysis**
   - Identify document type and audience.
   - Extract critical terms and decide preferred translations.

2. **Structured translation**
   - Translate section-by-section, preserving markdown shape.
   - Preserve tables, checklists, and links.

3. **Technical protection**
   - Keep code, shell commands, paths, env vars, payload keys, and API names unchanged.

4. **Semantic review**
   - Ensure requirement intensity is preserved (`must/should/never`).
   - Remove ambiguity and false cognates.

5. **Consistency review**
   - Standardize recurring terms and style.

## Expected output

A translated document with:

1. Equivalent markdown structure
2. Stable technical terminology
3. Intact code/command blocks
4. No operational meaning drift

## Fast rules

- Translate meaning, not word-by-word.
- Keep globally accepted technical terms when appropriate.
- Never remove constraints or anti-pattern sections.

## Constraints

- Do not rewrite architecture while translating.
- Do not convert translation into summary.
- Do not alter instruction behavior.
