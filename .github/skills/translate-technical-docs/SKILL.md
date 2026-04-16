---
name: translate-technical-docs
description: Translate technical documents from English to Brazilian Portuguese with high semantic fidelity, preserving markdown structure, commands, and critical terminology. Use this skill when you need production-ready technical translation without changing operational behavior.
---

## Context

This skill is for technical EN → pt-BR translation in engineering documentation, playbooks, manuals, instructions, and workflow guides.

## Process

1. **Pre-analysis**
   - Identify document type and target audience.
   - Extract critical terms and choose preferred translations.

2. **Structural translation**
   - Translate section by section while preserving original structure.
   - Preserve tables, checklists, and links.

3. **Technical protection**
   - Do not change code, commands, paths, variables, payloads, or API names.

4. **Semantic review**
   - Verify mandatory requirements remain mandatory.
   - Avoid false cognates and ambiguities.

5. **Consistency review**
   - Validate repeated terms and standardize pt-BR style.

## Expected output

Translated document containing:

1. Equivalent markdown structure
2. Consistent technical terminology
3. Intact commands and code blocks
4. No operational precision loss

## Quick rules

- Translate **meaning**, not word-for-word literal text.
- If there is doubt about a technical term, keep the term in English and explain context when needed.
- Never remove constraints, warnings, or anti-patterns.

## Constraints

- Do not rewrite content architecture.
- Do not convert translation into summary.
- Do not alter implicit behavior of operational instructions.
