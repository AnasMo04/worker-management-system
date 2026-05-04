# FLMS Project Rules (Karpathy-Inspired)

## 1. Core Principles
1. **Think Before Coding**: State assumptions explicitly. If a variable like `Filter` is missing, ask for its location instead of guessing.
2. **Simplicity First**: Do not overcomplicate APIs. If a fix takes 10 lines, don't rewrite 1000.
3. **Surgical Changes**: ONLY touch code related to the task. Do not refactor adjacent code or change existing styling/imports unless broken.
4. **Goal-Driven Execution**: Work must be verified against the success criteria below.

## 2. Architecture Restrictions
- **New Architecture (Fabric)**: Must remain strictly DISABLED (`newArchEnabled=false` in `gradle.properties`) unless all native modules are confirmed 100% TurboModule compatible.
- **Platform Separation**: The Web Backend (`/api/dashboard/system`) serves global Admin data. The Mobile Backend (`/api/dashboard/officer`) serves isolated, officer-specific data. Do not mix these logics.

## 3. Project Specific Standards
- **Formatting**: ALWAYS use `src/utils/formatDate.ts` for all dates/numbers.
- **Digits**: Force English digits (1, 2, 3) globally in the UI across both Web and Mobile (e.g., using `.replace(/[٠-٩]/g, ...)` utility functions).
- **Stability**: Use Optional Chaining (`?.`) for ALL database-driven fields to prevent White Screens.
- **Backend**: Ensure `Sponsor_ID` is parsed as an Integer in controllers.

## 4. Native Hardware & Sensors (Strict Rules)
- **Null Safety**: NEVER call a native module method without explicitly checking if the module exists. Always wrap hardware calls (NFC, Biometrics, GPS) in rigorous `try/catch` blocks.
- **NFC Integration (`react-native-nfc-manager`)**:
  - Use `NfcTech.NfcA` to read hardware UIDs, completely avoiding OS-level "Empty Tag" interceptions.
  - ALWAYS call `NfcManager.cancelTechnologyRequest()` in a `finally` block to release the scanner lock.
- **Permissions**: Ensure all hardware permissions (NFC, Camera, Location, Biometrics) are explicitly defined in `AndroidManifest.xml`.

## 5. Success Criteria for Current Tasks
- [ ] Sponsors page renders without `ReferenceError`.
- [ ] Workers Filter Bar includes: Gender, Nationality, and 'From-To' Date Pickers.
- [ ] Fuzzy Search (fuse.js) works combined with dropdown filters.
- [ ] PDF Export shows 'FLMS' branding and respects active filters.
- [ ] NFC hardware explicitly connects to physical devices without throwing `TypeError: Cannot convert null value to object`.