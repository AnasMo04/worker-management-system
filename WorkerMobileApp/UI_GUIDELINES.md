# 🎨 Mobile UI & Integration Guidelines

This document outlines the strict principles for updating the Mobile UI to match the Web Dashboard, ensuring zero disruption to the existing API integration and core logic.

## ⚠️ Core Rule: The Logic is Locked
The core logic of the application (API calls, state management, contexts) has been finalized and successfully integrated with the backend (`flms-backend`). 
**DO NOT modify any logical functions (e.g., `handleLogin`, `fetchWorkers`, API services) while updating the UI.**

## 📏 UI Update Principles (Web to Mobile Mapping)

1. **Separation of Concerns:**
   - **Only** modify the `return (...)` JSX block and the `StyleSheet` definitions.
   - If a new UI component requires local state (e.g., toggling a modal), keep it strictly within the UI layer. Do not alter global states or context.

2. **Component Translation:**
   - Web `<div>` ➡️ Mobile `<View>`
   - Web `<p>` or `<span>` ➡️ Mobile `<Text>`
   - Web `<button>` ➡️ Mobile `<TouchableOpacity>` (with active opacity feedback).

3. **Centralized Theming (Strictly Enforced):**
   - **Do NOT** hardcode hex colors (e.g., `#0F172A`) directly into component styles.
   - **MUST** use the centralized `theme.js` file (located in `src/theme.js`).
   - Example: Use `color: theme.colors.primary` instead of `color: '#34D399'`.

4. **Incremental Updates (One Screen at a Time):**
   - Update **one single screen** completely.
   - Run the app, verify the UI matches the design, and **critically**, test the functionality (e.g., login, fetching data) to ensure the API still works.
   - Commit the changes for that specific screen before moving to the next.

## 🎨 Theme Configuration (`src/theme.js`)
Please ensure all components reference these exact colors:
- `background`: '#0F172A' (Dark Navy)
- `surface`: '#1E293B' (Cards/Inputs)
- `primary`: '#34D399' (Mint Green)
- `textPrimary`: '#FFFFFF'
- `textSecondary`: '#94A3B8'
- `danger`: '#EF4444'
- `success`: '#10B981'