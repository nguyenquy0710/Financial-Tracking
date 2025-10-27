---
applyTo: '**/*.ts'
---

# FinTrack TypeScript Development Instructions

## Overview

This document provides guidelines and best practices for developing TypeScript components within the FinTrack codebase. It covers project structure, coding conventions, and specific patterns to ensure consistency and maintainability as we migrate from JavaScript to TypeScript.

## TypeScript Development Guidelines

### Project Structure

- Place all TypeScript files in the `src/` directory, following the existing structure.
- Separate TypeScript models, domains, middleware, plugins, and repositories into their respective folders under `src/`.

### Coding Conventions

- Use `IAbsBaseModel` from `src/abstracts/absBase.model.ts` as the base interface for all models.
- Leverage the `createBaseSchema()` helper function to ensure consistent schema definitions across models.
