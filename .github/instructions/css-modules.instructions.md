---
description: "Use when writing or editing CSS Module files. Covers naming conventions, theming with CSS variables, and dark mode patterns."
applyTo: "**/*.module.css"
---
# CSS Module Conventions

## Naming (BEM-like with underscores)
- **Block:** `.component_name`
- **Element:** `.component_name_element`
- **State:** `.item_active`, `.btn_disabled`
- **Variants:** `.card_blue`, `.icon_green`, `.badge_red`

## Theming — Always Use CSS Variables
```css
.card {
  background: var(--surface);
  color: var(--text-primary);
  border: 1px solid var(--border);
}
```

Available variable groups (defined in `src/styles/colors.css`):
- **Backgrounds:** `--bg`, `--surface`, `--surface-hover`
- **Text:** `--text-primary`, `--text-secondary`, `--text-muted`
- **Accents:** `--accent`, `--accent-hover`, `--accent-light`
- **Semantic:** `--success`, `--warning`, `--danger`, `--info`
- **Borders:** `--border`, `--border-light`

## Rules
- Never hardcode hex/rgb color values — always use CSS variables
- Never use inline styles in components — always use CSS Modules
- Dark mode is automatic via `[data-theme="dark"]` overrides in `theme.css`
- Import as `styles` in components: `import styles from './component.module.css'`
