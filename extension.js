const BettyExtension = require('./BettyExtension');
const bettyExtension = new BettyExtension();

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	bettyExtension.activate(context);
}

/**
 * @param {vscode.ExtensionContext} context
 */
function deactivate() {
	bettyExtension.deactivate()
}

module.exports = {
	activate,
	deactivate
};
