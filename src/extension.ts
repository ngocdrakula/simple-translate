/**
 * Translate Selection — VS Code extension entry point.
 *
 * Registers {@link translateSelection} on command `cursorTranslateSelection.translate`.
 * Settings: `cursorTranslateSelection.targetLanguage`, `cursorTranslateSelection.sourceLanguage`.
 *
 * @see docs/API.md
 */
import * as vscode from "vscode";

/** Workspace settings used for each translation request. */
interface TranslateConfig {
  targetLanguage: string;
  sourceLanguage: string;
}

/**
 * Reads translation language settings from the workspace.
 * Defaults: target `vi`, source `auto` (detect language).
 */
function getConfig(): TranslateConfig {
  const cfg = vscode.workspace.getConfiguration("cursorTranslateSelection");
  return {
    targetLanguage: cfg.get<string>("targetLanguage", "vi"),
    sourceLanguage: cfg.get<string>("sourceLanguage", "auto"),
  };
}

/**
 * Calls Google Translate's public `translate_a/single` endpoint and returns joined segment text.
 *
 * @param text - Plain text to translate.
 * @param sourceLanguage - Source ISO code or `auto`.
 * @param targetLanguage - Target ISO code.
 * @throws When HTTP fails, JSON shape is unexpected, or result is empty.
 */
async function fetchTranslation(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> {
  const url =
    "https://translate.googleapis.com/translate_a/single" +
    `?client=gtx&sl=${encodeURIComponent(sourceLanguage)}` +
    `&tl=${encodeURIComponent(targetLanguage)}&dt=t&q=${encodeURIComponent(text)}`;

  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!response.ok) {
    throw new Error(`Translate request failed (${response.status})`);
  }

  const json = (await response.json()) as unknown;
  if (!Array.isArray(json) || !Array.isArray(json[0]) || !Array.isArray(json[0][0])) {
    throw new Error("Unexpected translate response");
  }

  const translated = json[0]
    .map((chunk: unknown) =>
      Array.isArray(chunk) && typeof chunk[0] === "string" ? chunk[0] : ""
    )
    .join("");

  if (!translated.trim()) {
    throw new Error("Empty translation result");
  }

  return translated;
}

/**
 * Command handler: translate the active editor selection and show a modal result.
 */
async function translateSelection(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage("No active editor");
    return;
  }

  const selection = editor.selection;
  const text = editor.document.getText(selection).trim();
  if (!text) {
    vscode.window.showWarningMessage("Select text to translate");
    return;
  }

  const { targetLanguage, sourceLanguage } = getConfig();

  let translated: string;
  try {
    translated = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Translating…",
        cancellable: false,
      },
      () => fetchTranslation(text, sourceLanguage, targetLanguage)
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await vscode.window.showErrorMessage(`Translation failed: ${message}`);
    return;
  }

  await vscode.window.showInformationMessage(
    "Translation",
    {
      modal: true,
      detail: `Original:\n${text}\n\nTranslation:\n${translated}`,
    },
    "OK"
  );
}

/**
 * Extension activation: register commands and subscriptions.
 */
export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("cursorTranslateSelection.translate", () =>
      translateSelection()
    )
  );
}

/** Extension deactivation hook (no resources to dispose). */
export function deactivate(): void {}
