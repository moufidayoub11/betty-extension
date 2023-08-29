const vscode = require('vscode');
const { exec } = require('child_process');
const BettyQuickFixProvider = require('./BettyQuickFixProvider');

class BettyExtension {
	constructor() {
		this.showedError = false;
		this.isActive = true;
		this.diagnosticsCollection = vscode.languages.createDiagnosticCollection('Betty');
	}

	/**
	 * Initializes the extension and hooks up event listeners and commands.
	 * 
	 * @param {vscode.ExtensionContext} context - The extension context.
	 */
	activate(context) {
		console.log("Betty extension is now active!");

		const toggleCommand = vscode.commands.registerCommand('extension.toggle', () => this.toggleExtension());
		context.subscriptions.push(
			vscode.workspace.onDidSaveTextDocument((document) => this.checkAndHighlight(document)),
			vscode.languages.registerCodeActionsProvider(
				{ scheme: 'file', language: 'c' },
				new BettyQuickFixProvider()
			),
			toggleCommand,
		);
	}

	/**
	 * Handle the deactivate event
	 *
	 * @param {vscode.ExtensionContext} context - The extension context.
	 */
	deactivate() {
		if (this.isActive)
		{
			this.toggleExtension();
		}
	}

	/**
	 * Toggle the activation status of the extension.
	 */
	toggleExtension() {
		this.isActive = !this.isActive;
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			this.checkAndHighlight(editor.document);
		}
		vscode.window.showInformationMessage(`Betty: Extension ${this.isActive ? "Activated" : "Deactivated"}`);
	}

	/**
	 * Checks the document when saved and highlights issues using Betty, a C code linter.
	 * 
	 * @param {vscode.TextDocument} document - The text document that was saved.
	 */
	checkAndHighlight(document) {
		const editor = vscode.window.activeTextEditor;
		if (document.languageId !== 'c' || !editor)
			return;
		if (!this.isActive) {
			this.diagnosticsCollection.delete(document.uri);
			return;
		}

		const filename = document.fileName.replace(/^.*[\\\/]/, '');
		exec(`betty "${filename}"`, { cwd: document.fileName.replace(filename, "") }, (error, stdout, stderr) => {
			const full_output = stderr + stdout;
			if (full_output.includes("betty: not found")) {
				this.handleErrorNotFound();
				return;
			}
			this.showedError = false;
			this.diagnosticsCollection.delete(document.uri);
			const diagnostics = this.parseBettyOutput(full_output, editor);
			this.diagnosticsCollection.set(document.uri, diagnostics);
		});
	}

	/**
	 * Parses the output from Betty to create diagnostics that highlight issues in the editor.
	 * 
	 * @param {string} output - The raw output from the Betty linter.
	 * @param {vscode.TextEditor} editor - The active text editor.
	 * @returns {Array} - Array of vscode.Diagnostic objects.
	 */
	parseBettyOutput(output, editor) {
		const lines = output.split('\n');
		const diagnostics = [];
		for (const line of lines) {
			if (line.trim() !== '') {
				const match = line.split(":");
				if (match.length >= 4) {
					var lineNumber = parseInt(match[1].trim()) - 1;
					const type = match[2].trim().toLowerCase();
					const message = match.slice(3).join(":").trim();
					const severity = type == 'error' ? vscode.DiagnosticSeverity.Error : vscode.DiagnosticSeverity.Warning;

					const textAtLine = editor.document.lineAt(lineNumber).text;
					var start = this.getStartingIndex(textAtLine);
					var finish = textAtLine.length;
					if (start == finish)
						start -= 1;

					const range = new vscode.Range(lineNumber, start, lineNumber, finish)
					const diagnostic = new vscode.Diagnostic(range, message, severity);
					diagnostic.source = 'Betty'
					diagnostics.push(diagnostic);
				}
			}
		}

		return [...new Set(diagnostics)];
	}

	/**
	 * Handle 'betty not found' error by showing a notification.
	 */
	handleErrorNotFound() {
		if (!this.showedError) {
			this.showedError = true;
			vscode.window.showErrorMessage('Betty: betty not found');
		}
	}

	/**
	 * Calculates the index at which the diagnostic should begin.
	 * 
	 * @param {string} text - The text of the line to be analyzed.
	 * @returns {number} - The index at which the diagnostic should begin.
	 */
	getStartingIndex(text) {
		var leadingSpaces = text.match(/^[\s\t]*/);
		var countLeadingSpaces = 0
		if (leadingSpaces)
			countLeadingSpaces = leadingSpaces[0].length;
		return (countLeadingSpaces);
	}
}

module.exports = BettyExtension;
