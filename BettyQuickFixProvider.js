/* eslint-disable no-unused-vars */
const vscode = require('vscode');

/**
 * A mapping of error types to their corresponding fixing functions.
 */
const errorFixingFunctions = {
	'indentation should be tabs': replaceSpacesWithTabs,
	'no spaces at the start of a line': replaceSpacesWithTabs,
	'trailing whitespace': removeTrailingWhitespace,
	'adding a line without newline at end of file': addNewLineAtEndOfFile,
	'parentheses are required on a return statement': addParenthesesToReturn,
	'Missing a blank line after declarations': addNewLineAfterVarDeclaration,
};

/**
 * Class for providing quick-fix code actions.
 */
class BettyQuickFixProvider {
	/**
	 * Provide code actions based on diagnostics.
	 * 
	 * @param {vscode.TextDocument} document - The active text document.
	 * @param {vscode.Range} range - The range of text to consider for code actions.
	 * @param {vscode.CodeActionContext} context - Context for code actions.
	 * @param {vscode.CancellationToken} token - Token for operation cancellation.
	 * @returns {Array} - Array of vscode.CodeAction objects.
	 */
	provideCodeActions(document, range, context, token) {
		const diagnostics = context.diagnostics;
		const codeActions = [];

		for (const diagnostic of diagnostics) {
			if (diagnostic.source !== 'Betty') continue;
			const fixToAdd = Object.entries(errorFixingFunctions)
				.find(([error]) => diagnostic.message.includes(error));
			if (fixToAdd) {
				const [error, fixingFunction] = fixToAdd;
				const fix = new vscode.CodeAction("Fix " + error, vscode.CodeActionKind.QuickFix);
				fix.edit = new vscode.WorkspaceEdit();
				fixingFunction(document, fix, range);
				codeActions.push(fix);
			}
		}

		if (codeActions.length > 0)
		{
			const fixALL = new vscode.CodeAction('Fix easy/obvious Betty errors/warnings at once', vscode.CodeActionKind.QuickFix);
			fixALL.edit = new vscode.WorkspaceEdit();
			replaceSpacesWithTabs(document, fixALL, undefined);
			removeTrailingWhitespace(document, fixALL, undefined);
			addNewLineAtEndOfFile(document, fixALL, undefined);
			addParenthesesToReturn(document, fixALL, undefined);
			addNewLineAfterVarDeclaration(document, fixALL, undefined);
			codeActions.unshift(fixALL);
		}

		if (token.isCancellationRequested) {
			return [];
		}

		return codeActions;
	}
}

function addParenthesesToReturn(document, fix, range) {
    var startLine = range ? range.start.line : 0;
    var endLine = range ? range.end.line : document.lineCount - 1;
    for (let i = startLine; i <= endLine; i++) {
        const line = document.lineAt(i);
        const returnMatch = line.text.match(/return(\s+)(.*);/);
        if (returnMatch && !returnMatch[2].startsWith('(') && !returnMatch[2].endsWith(')')) {
            const whiteSpaces = returnMatch[1].length; // Number of whitespaces
            const startPos = line.text.indexOf('return') + 'return'.length;
            const endPos = startPos + returnMatch[2].length + whiteSpaces;
            const replaceRange = new vscode.Range(new vscode.Position(i, startPos), new vscode.Position(i, endPos));
            const newValue = ` (${returnMatch[2]})`;
            fix.edit.replace(document.uri, replaceRange, newValue);
        }
    }
}

/**
 * Replace leading spaces with tabs.
 * 
 * @param {vscode.TextDocument} document - The active text document.
 * @param {vscode.CodeAction} fix - The code action to populate.
 * @param {vscode.Range|null} range - The range to consider, or null for the whole document.
 */
function replaceSpacesWithTabs(document, fix, range) {
	var startLine = range ? range.start.line : 0;
	var endLine = range ? range.end.line : document.lineCount - 1;
	for (let i = startLine; i <= endLine; i++) {
		const line = document.lineAt(i);
		const leadingSpaces = line.text.match(/^( +)/);

		if (leadingSpaces) {
			const spaceCount = leadingSpaces[1].length;
			const tabCount = Math.floor(spaceCount / 4); // Assuming 4 spaces per tab
			const tabs = '\t'.repeat(tabCount);

			const replaceRange = new vscode.Range(
				new vscode.Position(i, 0),
				new vscode.Position(i, spaceCount)
			);

			fix.edit.replace(document.uri, replaceRange, tabs);
		}
	}
}

/**
 * Remove trailing whitespace.
 * 
 * @param {vscode.TextDocument} document - The active text document.
 * @param {vscode.CodeAction} fix - The code action to populate.
 * @param {vscode.Range|null} range - The range to consider, or null for the whole document.
 */
function removeTrailingWhitespace(document, fix, range) {
	var startLine = range ? range.start.line : 0;
	var endLine = range ? range.end.line : document.lineCount - 1;
	for (let i = startLine; i <= endLine; i++) {
		const line = document.lineAt(i);
		const trailingSpaces = line.text.match(/[\s\t]+$/);
		if (trailingSpaces) {
			const start = line.text.length - trailingSpaces[0].length;
			const end = line.text.length;
			const replaceRange = new vscode.Range(new vscode.Position(i, start), new vscode.Position(i, end));
			fix.edit.replace(document.uri, replaceRange, '');
		}
	}
}

/**
 * Add a new line after variable declarations.
 * 
 * @param {vscode.TextDocument} document - The active text document.
 * @param {vscode.CodeAction} fix - The code action to populate.
 * @param {vscode.Range|null} range - The range to consider, or null for the whole document.
 */
function addNewLineAfterVarDeclaration(document, fix, range) {
	var startLine = range ? range.start.line - 1 : 0;
	var endLine = range ? range.end.line : document.lineCount - 1;
	const regex = /\b(?:(?:auto\s*|const\s*|unsigned\s*|signed\s*|register\s*|volatile\s*|static\s*|void\s*|short\s*|long\s*|char\s*|int\s*|float\s*|double\s*|_Bool\s*|complex\s*)+)(?:\s+\*?\*?\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*[\[;,=)]/;
	for (let i = startLine; i < endLine; i++) {
		const line = document.lineAt(i);
		const nextLine = document.lineAt(i+1);
		const varDeclarationMatch = line.text.match(regex);
		if (nextLine && nextLine.text.length != 0 && varDeclarationMatch) {
			const position = new vscode.Position(i, line.text.length);
			fix.edit.insert(document.uri, position, '\n');
		}
	}
}

/**
 * Add a new line at the end of the file.
 * 
 * @param {vscode.TextDocument} document - The active text document.
 * @param {vscode.CodeAction} fix - The code action to populate.
 * @param {vscode.Range|null} range - The range to consider, or null for the whole document.
 */
function addNewLineAtEndOfFile(document, fix, range) {
	const beforelastLine = document.lineAt(document.lineCount - 2);
	const lastLine = document.lineAt(document.lineCount - 1);
	if (beforelastLine.text.length > 0 && lastLine.text.length > 0) {
		const position = new vscode.Position(document.lineCount - 1, lastLine.text.length);
		fix.edit.insert(document.uri, position, '\n');
	}
}


module.exports = BettyQuickFixProvider;