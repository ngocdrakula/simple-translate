# API reference

This document describes the extension’s public surface: VS Code contributions, exported lifecycle hooks, and internal modules intended for reading or reuse within the repo.

## Extension lifecycle

### `activate(context: vscode.ExtensionContext): void`

Called when the user runs `cursorTranslateSelection.translate` (lazy activation via `activationEvents` in `package.json`).

Registers:

- Command `cursorTranslateSelection.translate` → `translateSelection()`

All disposables are pushed to `context.subscriptions`.

### `deactivate(): void`

No teardown required today; kept for VS Code extension contract compatibility.

## Command flow

```
translateSelection()
  ├─ active editor + non-empty selection?
  ├─ getConfig() → targetLanguage, sourceLanguage
  ├─ withProgress → fetchTranslation(text, source, target)
  └─ showInformationMessage (modal: original + translation)
```

Errors from `fetchTranslation` are caught and shown with `showErrorMessage`.

## Configuration reader

### `getConfig(): { targetLanguage: string; sourceLanguage: string }`

Reads `cursorTranslateSelection.*` from workspace configuration. Defaults: target `vi`, source `auto`.

## Translation client

### `fetchTranslation(text, sourceLanguage, targetLanguage): Promise<string>`

| Parameter | Description |
|-----------|-------------|
| `text` | UTF-8 string to translate (caller should trim if needed). |
| `sourceLanguage` | Source code or `auto`. |
| `targetLanguage` | Target language code. |

**HTTP:** `GET https://translate.googleapis.com/translate_a/single` with query `client=gtx`, `sl`, `tl`, `dt=t`, `q`.

**Response:** Parses Google’s nested array JSON: concatenates `json[0][*][0]` string segments.

**Throws:**

- `Translate request failed (<status>)` — non-OK HTTP
- `Unexpected translate response` — malformed JSON shape
- `Empty translation result` — no usable text in response

## `package.json` contributions

### Commands

```json
"cursorTranslateSelection.translate"
```

### Configuration keys

- `cursorTranslateSelection.targetLanguage` (string)
- `cursorTranslateSelection.sourceLanguage` (string)

### Menus

- `editor/context`: **Translate Selection**, `when: editorHasSelection`, group `navigation@100`

## Extending the extension

Common extension points (not implemented yet):

- Replace `fetchTranslation` with Cloud Translation API + API key setting
- Insert translation at cursor or replace selection via `editor.edit`
- Keybinding in `contributes.keybindings` for `cursorTranslateSelection.translate`

When adding settings, extend `contributes.configuration` and document defaults in `README.md`.
