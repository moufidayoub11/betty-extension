const vscode = require('vscode');
const { exec } = require('child_process');

const errorMessages = {};
const warningMessages = {};

const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);

const errorDecorationType = vscode.window.createTextEditorDecorationType({
	textDecoration: 'dotted underline red',
});
const warningDecorationType = vscode.window.createTextEditorDecorationType({
	textDecoration: 'dotted underline yellow',
});


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	console.log("Congratulations, your extension \"betty - extension\" is now active!");
	context.subscriptions.push(
		vscode.workspace.onDidOpenTextDocument(checkAndHighlight),
		vscode.workspace.onDidSaveTextDocument(checkAndHighlight),
		vscode.window.onDidChangeActiveTextEditor(checkAndHighlight),
	);

	vscode.languages.registerHoverProvider('c', {
		provideHover(document, position) {
			const editor = vscode.window.activeTextEditor;
			if (!editor || document.languageId !== 'c') {
				return;
			}
			const lineNumber = position.line;

			const errorMessage = errorMessages[lineNumber];
			const warningMessage = warningMessages[lineNumber];
			const markdownContent = new vscode.MarkdownString();

			if (errorMessage) {
				markdownContent.appendMarkdown(`**Betty Error:**`);
				markdownContent.appendText(`\n${errorMessage}`)
				return new vscode.Hover(markdownContent);
			} else if (warningMessage) {
				markdownContent.appendMarkdown(`**Betty Warning:**`);
				markdownContent.appendText(`\n${warningMessage}`)
				return new vscode.Hover(markdownContent);
			}

			return null;
		}
	});

}

function checkAndHighlight(document) {
	const editor = vscode.window.activeTextEditor;
	if (document.languageId !== 'c' || !editor)
		return;
	const filename = document.fileName.replace(/^.*[\\\/]/, '');
	exec(`betty "${filename}"`, { cwd: document.fileName.replace(filename, "") }, (error, stdout, stderr) => {
		const full_output = stderr + stdout;

		for (const line in errorMessages)
			delete errorMessages[line];
		for (const line in warningMessages)
			delete warningMessages[line];

		const decorations = parseBettyOutput(full_output, editor);
		const errorRanges = decorations.filter(v => v.decorationType == errorDecorationType).map(v => v.range);
		const warningRanges = decorations.filter(v => v.decorationType == warningDecorationType).map(v => v.range);


		editor.setDecorations(warningDecorationType, warningRanges);
		editor.setDecorations(errorDecorationType, errorRanges);
		updateStatusBar();
	});
}

function parseBettyOutput(output, editor) {
	const lines = output.split('\n');
	const decorations = [];
	for (const line of lines) {
		if (line.trim() !== '') {
			const match = line.split(":");
			if (match.length >= 4) {
				const lineNumber = parseInt(match[1].trim()) - 1;
				const type = match[2].trim().toLowerCase();
				const message = match.slice(3).join(":").trim();
				const decorationType = type == 'error' ? errorDecorationType : warningDecorationType;

				const textAtLine = editor.document.lineAt(lineNumber).text;
				var start = getStartingIndex(textAtLine);
				const finish = textAtLine.length;
				if (start == finish)
					start  -= 1;

				const decoration = {
					range: new vscode.Range(lineNumber, start, lineNumber, finish),
					decorationType: decorationType,
				};

				if (decorationType == errorDecorationType) {
					errorMessages[lineNumber] = message;
				}
				else if (decorationType == warningDecorationType) {
					warningMessages[lineNumber] = message;
				}
				decorations.push(decoration);
			}
		}
	}

	return [...new Set(decorations)];;
}

function getStartingIndex(text) {
	var leadingSpaces = text.match(/^[\s\t]*/);
	var countLeadingSpaces = 0
	if (leadingSpaces)
		countLeadingSpaces = leadingSpaces[0].length;
	return (countLeadingSpaces);
}


function updateStatusBar() {
	const { errorCount, warningCount } = countErrorsAndWarnings();
	statusBar.text = `$(error) ${errorCount} $(warning) ${warningCount}`;
	statusBar.show();
}
function countErrorsAndWarnings() {
	const errorCount = Object.keys(errorMessages).length;
	const warningCount = Object.keys(warningMessages).length;
	return { errorCount, warningCount };
}

module.exports = {
	activate,
	checkAndHighlight
}
