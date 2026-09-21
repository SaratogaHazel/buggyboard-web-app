# Design theme

Visual and UI/UX design rules for BuggyBoard. Follow these when building or styling any part of the app. Where this file and the implementation disagree, this file wins; update the code or propose a change here.

The theme is inspired by classic air-cooled Volkswagens (the default users are `buggy` and `vanny`). It should feel warm, calm, and slightly retro: beige accent, warm stone neutrals, no pure grays or cold blues.

## Theming mechanism

- Colors are defined once as CSS custom properties on `:root` in `frontend/src/index.css`.
- `frontend/tailwind.config.js` maps `--color-primary` to the Tailwind color name `primary`, so utilities such as `bg-primary`, `text-primary`, `border-primary`, and `ring-primary` are available.
- Neutrals use Tailwind's built-in `stone` scale directly. Do not introduce `gray`, `slate`, `zinc`, or `neutral`.
- Do not hard-code hex values in components. Add a new variable here and in `index.css`, then use it.

## Color

### Primary

| Token             | Value     | Name                      |
| ----------------- | --------- | ------------------------- |
| `--color-primary` | `#b8ae76` | Volkswagen Savannah Beige |

Use the primary color for:

- Primary action buttons (Log In, Create, Save, New Bug).
- Focus rings on all interactive elements except destructive controls.
- Active or selected state of toggles and segmented controls (for example the board filter buttons).
- Focused border of the search field.
- Sparing highlights such as the app title accent.

Do **not** use the primary color for:

- Body text or labels. Beige on white fails WCAG AA contrast. Text placed **on** a primary background must be `stone-800`.
- Backgrounds of large areas (pages, panels, table rows).
- Links inside body text. Use `stone-800` with underline instead.

### Neutrals (Tailwind `stone`)

| Role                                                            | Class                                                                                       |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Page background                                                 | `bg-stone-100`                                                                              |
| Surface (cards, modals, header)                                 | `bg-white`                                                                                  |
| Subtle surface (table header, disabled inputs, secondary hover) | `bg-stone-50`                                                                               |
| Secondary button background                                     | `bg-stone-200`, hover `bg-stone-300`                                                        |
| Borders and dividers                                            | `border-stone-200`; input borders `border-stone-300`; table row dividers `border-stone-100` |
| Primary text and headings                                       | `text-stone-800`                                                                            |
| Body and label text                                             | `text-stone-700`                                                                            |
| Table header text                                               | `text-stone-600`                                                                            |
| Secondary and helper text, icons                                | `text-stone-500`                                                                            |
| Placeholder text                                                | `placeholder-stone-400`                                                                     |
| Modal overlay                                                   | `bg-stone-900/50`                                                                           |

### Semantic colors

| Token / role               | Value                                                           | Usage                                                       |
| -------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------- |
| `--color-severity-high`    | `#b84a2e` terracotta                                            | High severity badge and severity select                     |
| `--color-severity-mid`     | `#a67c47` amber                                                 | Mid severity badge and severity select                      |
| `--color-severity-low`     | `#4a6b5e` sage                                                  | Low severity badge and severity select                      |
| Error / validation text    | `text-red-600`                                                  | Inline error messages, rendered with `role="alert"`         |
| Destructive button         | `bg-red-600`, hover `bg-red-700`, `text-white`                  | Confirming an irreversible action (Delete)                  |
| Destructive outline button | `text-red-700`, `border-red-200`, `bg-white`, hover `bg-red-50` | Entering a destructive flow (the Delete button in Edit Bug) |
| Destructive focus ring     | `ring-red-500`                                                  | Focus ring on destructive buttons                           |
| Error panel background     | `bg-red-50`, `border-red-200`                                   | Grouped validation errors                                   |

Severity badges render the semantic color as text on a 22 percent tint of the same color (`color-mix(in srgb, <color> 22%, transparent)`). Badge and dropdown selection colors must match so the board and modals agree.

No success (green) or informational (blue) colors are defined. Do not add them without updating this file.

## Typography

- **Font family:** the browser default sans-serif stack provided by Tailwind Preflight. No web fonts are loaded.
- **App title:** `text-3xl font-bold text-stone-800`, single line, truncates with ellipsis.
- **Modal and dialog titles:** `text-lg font-semibold text-stone-800`.
- **Form labels:** `text-sm font-medium text-stone-700`, placed above the control with `mb-1`.
- **Body text:** default size, `text-stone-700`.
- **Table headers:** `text-sm font-medium uppercase tracking-wide text-stone-600`.
- **Buttons:** `text-sm font-medium`.
- **Identifiers (bug ID):** `font-mono text-sm`.
- **Severity badges:** `0.875rem`, weight 600.

## Shape, spacing, and elevation

- **Border radius:** `rounded` (0.25rem) for buttons, inputs, and badges; `rounded-lg` (0.5rem) for panels, modals, the search field, and the logo container; `rounded-md` for segmented filter buttons.
- **Button padding:** `px-4 py-2`. Icon-only buttons use `p-1` or `p-1.5`.
- **Input padding:** `px-3 py-2`, full width inside forms.
- **Table cells:** `px-4 py-3`.
- **Modal and header padding:** `px-6 py-4`.
- **Gap between sibling buttons:** `gap-3`.
- **Elevation:** header uses `shadow-sm`; modals use `shadow-lg`. Nothing else casts a shadow.
- **Transitions:** color changes use `transition-colors`. No other animation.

## Interactive states

- **Focus:** every focusable element shows `focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2` (offset 1 in compact toolbars). Destructive buttons use `ring-red-500`; secondary buttons use `ring-stone-400`. Never remove the focus ring without replacing it.
- **Hover:** primary buttons use `hover:opacity-90`; secondary buttons darken one stone step; destructive buttons darken one red step; table rows and toolbar toggles use `hover:bg-stone-50/80`.
- **Disabled:** `disabled:opacity-50 disabled:cursor-not-allowed`. Read-only inputs (bug ID) use `bg-stone-50 text-stone-500 cursor-not-allowed`.
- **Loading:** a button that triggered an async action shows progress text with an ellipsis ("Saving…", "Deleting…") and is disabled until the request finishes.

## Buttons

| Variant             | Appearance                                                         | When                                         |
| ------------------- | ------------------------------------------------------------------ | -------------------------------------------- |
| Primary             | `bg-primary text-stone-800`                                        | The one main action in a view or modal       |
| Secondary           | `bg-stone-200 text-stone-700`                                      | Cancel and other non-primary actions         |
| Destructive         | `bg-red-600 text-white`                                            | Final confirmation of an irreversible action |
| Destructive outline | `bg-white text-red-700 border-red-200`                             | Opening a destructive confirmation           |
| Icon                | Transparent, `text-stone-500`, hover `bg-stone-100 text-stone-700` | Close X, clear search                        |

A view or modal has at most one primary button.

## Modals

All modals share the `bug-modal-*` classes defined in `index.css` (overlay, panel, header, body). Do not restyle a modal ad hoc.

- **Structure:** full-screen overlay `bg-stone-900/50`, centered white panel `rounded-lg shadow-lg border-stone-200`, header with title left and close X right, scrollable body, footer with actions.
- **Width:** `max-w-lg` for form modals; `max-w-sm` for confirmation dialogs. Panels never exceed the viewport height; the body scrolls instead.
- **Footer button order:** actions are right-aligned in the order Cancel, then Primary. A destructive outline button, when present, sits alone on the left of the footer.
- **Close control:** every modal has an X button in the upper right with `aria-label="Close"`. Clicking it is identical to Cancel: close without saving and without side effects.
- **Escape key:** pressing Escape is identical to Cancel. When one modal is stacked on another (for example Delete confirmation over Edit Bug), Escape closes only the topmost modal.
- **Backdrop click:** clicking the overlay outside the panel does **nothing**. Modals close only through X, Escape, Cancel, or a successful action.
- **Unsaved changes:** closing a modal discards unsaved input silently. No "are you sure" prompt.
- **Stacking:** form modals use `z-50`; a confirmation dialog on top uses `z-[60]`.
- **Initial focus:** when a form modal opens, focus moves to its first input (the Title field). Confirmation dialogs focus their Cancel button.
- **Focus return:** when a modal closes, focus returns to the element that opened it.

## Layout

- **Title bar:** white header, `border-b border-stone-200 shadow-sm`, `px-4 py-3`. Logo and title on the left; search field, divider, and user controls on the right. The title truncates rather than wrapping.
- **Page:** `min-h-screen bg-stone-100`. Content sits on white panels.
- **Board table:** full-width, header row `bg-stone-50/80`, sortable headers indicate sort with `aria-sort` and a visible indicator. Rows are clickable (`cursor-pointer`) and open the Edit Bug modal.
- **Responsive:** the app targets desktop widths. Controls must remain usable down to 640px (the search field narrows from `w-80` to `w-64`). No separate mobile layout is required.

## Feedback

- **Validation errors:** shown inline beneath the form or field in `text-sm text-red-600` with `role="alert"`, so screen readers announce them.
- **Server errors:** same treatment, with a generic fallback message ("Something went wrong. Please try again.").
- **Empty states:** when the board has no bugs, or a search matches nothing, show a short centered `text-stone-500` message in place of the table body.
- **Success:** no toast or banner. A successful action closes the modal and the board updates in place.

## Accessibility

- Dialogs use `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` pointing at the visible title.
- Every icon-only control has an `aria-label` and a visually hidden text label (`sr-only`).
- Decorative glyphs use `aria-hidden="true"`.
- Every form control has a `<label htmlFor>`.
- Text on white or stone backgrounds must meet WCAG AA (4.5:1). The primary color is never used as text on light backgrounds.
- Color is never the only indicator: severity badges also show the word (High, Mid, Low).
- All actions are reachable by keyboard.

## Related specs

- `specs/features/04-title-bar.md` – title bar content
- `specs/features/08-board-severity.md` – severity colors and ordering
- `specs/features/06-create-bug.md`, `09-edit-bug.md`, `12-delete-bug.md` – modal behavior
