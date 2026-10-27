# Translate Selection

VS Code / Cursor extension that translates the current editor selection via Google Translate’s public web endpoint. Results appear in a modal dialog with the original text and translation side by side.

## Features

- Translate any selected text from the active editor
- Configurable source language (including automatic detection) and target language
- Command palette entry and editor context menu (when text is selected)
- Progress notification while the request is in flight

## Requirements

- VS Code **1.85+** or Cursor with compatible extension host
- Network access to `translate.googleapis.com`

## Installation

### From source (development)

1. Clone this repository and open the folder in VS Code or Cursor.
2. Run `npm install`.
3. Press **F5** (or use **Run Extension** from `.vscode/launch.json`) to open an Extension Development Host.
4. In the new window, the extension loads from your workspace.

### From a VSIX (optional)

```bash
npm install
npm run compile
npx @vscode/vsce package
```

Install the generated `.vsix` via **Extensions → … → Install from VSIX…**.

## Usage

1. Select text in an editor.
2. Run **Translate Selection**:
   - **Command Palette** (`Ctrl+Shift+P` / `Cmd+Shift+P`) → `Translate Selection`
   - **Right-click** the selection → **Translate Selection**
3. Read the modal showing **Original** and **Translation**.

If nothing is selected, or there is no active editor, the extension shows a warning instead of calling the API.

## Configuration

| Setting | Default | Description |
|--------|---------|-------------|
| `cursorTranslateSelection.targetLanguage` | `vi` | BCP-47 / Google Translate language code for the result (e.g. `en`, `ja`, `ko`). |
| `cursorTranslateSelection.sourceLanguage` | `auto` | Source language code, or `auto` for detection. |

Open **Settings** and search for `Translate Selection`, or edit `settings.json`:

```json
{
  "cursorTranslateSelection.targetLanguage": "en",
  "cursorTranslateSelection.sourceLanguage": "auto"
}
```

Language codes match [Google Translate supported languages](https://cloud.google.com/translate/docs/languages) (ISO-639 where applicable).

## Commands

| Command ID | Title |
|------------|--------|
| `cursorTranslateSelection.translate` | Translate Selection |

## Development

| Script | Purpose |
|--------|---------|
| `npm run compile` | TypeScript → `out/` |
| `npm run watch` | Recompile on file changes |

Project layout:

- `src/extension.ts` — activation, command handler, UI
- `docs/API.md` — module and configuration reference for contributors

## Privacy and limitations

- Selected text is sent to **Google’s translate endpoint** over HTTPS. Do not use for secrets or regulated data unless your policy allows it.
- This uses an **unofficial** client-style URL (`client=gtx`), not the paid Cloud Translation API. Availability, rate limits, and response shape may change without notice.
- Translations are **shown in a dialog**; the extension does not replace text in the buffer.

## License

[MIT](LICENSE) — Copyright (c) 2026 ngocdrakula
