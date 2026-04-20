# FLMS Project Rules (Karpathy-Inspired)

## Core Principles
1. **Think Before Coding**: State assumptions explicitly. If a variable like `Filter` is missing, ask for its location instead of guessing.
2. **Simplicity First**: Do not overcomplicate APIs. If a fix takes 10 lines, don't rewrite 1000.
3. **Surgical Changes**: ONLY touch code related to the task. Do not refactor adjacent code or change existing styling/imports unless broken.
4. **Goal-Driven Execution**: Work must be verified against the success criteria below.

## Project Specific Standards
- **Formatting**: ALWAYS use `src/utils/formatDate.ts` for all dates/numbers.
- **Digits**: Force English digits (1, 2, 3) globally in the UI.
- **Stability**: Use Optional Chaining (`?.`) for ALL database-driven fields to prevent White Screens.
- **Backend**: Ensure `Sponsor_ID` is parsed as an Integer in controllers.

## Success Criteria for Current Tasks
- [ ] Sponsors page renders without `ReferenceError`.
- [ ] Workers Filter Bar includes: Gender, Nationality, and 'From-To' Date Pickers.
- [ ] Fuzzy Search (fuse.js) works combined with dropdown filters.
- [ ] PDF Export shows 'FLMS' branding and respects active filters.