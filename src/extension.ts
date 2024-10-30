import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  const saveDisposable = vscode.workspace.onWillSaveTextDocument((event) => {
    const document = event.document;
    const fileName = document.fileName;

    if (/\.(php|html|htm|svelte|js|jsx|ts|tsx)$/.test(fileName)) {
      const text = document.getText();
      const sortedText = sortClassNames(text);

      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(text.length)
      );

      event.waitUntil(
        Promise.resolve([vscode.TextEdit.replace(fullRange, sortedText)])
      );
    }
  });

  context.subscriptions.push(saveDisposable);
}

function sortClassNames(text: string): string {
  return text.replace(
    /class(Name)?="([^"]+)"/g,
    (match, classNameType, classList) => {
      const bladeConditionMatch = classList.match(/{{[^}]+}}/);
      const bladeCondition = bladeConditionMatch
        ? bladeConditionMatch[0].trim()
        : "";
      const remainingClasses = classList.replace(bladeCondition, "").trim();

      const sortedClassList = remainingClasses
        .split(/\s+/)
        .filter(Boolean)
        .sort((a: string, b: string) => a.localeCompare(b))
        .join(" ");

      const outputClass = `${bladeCondition} ${sortedClassList}`;
      return `class${classNameType || ""}="${outputClass.trim()}"`;
    }
  );
}

export function deactivate() {}
