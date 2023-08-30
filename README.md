# Betty Extension
Betty Extension is a Visual Studio Code extension that helps you identify and handle Betty coding style and documentation errors and warnings in real-time.
<img src="https://i.imgur.com/iEhoUfL.png" alt="Betty Extension Interface" width="100%">

## Features
<img src="https://i.imgur.com/G5SrSGk.gif" alt="Quick fix" width="50%">

### New in Latest Release 🎉🔥

- 🌟 **Automatic Betty Fixes:** Tired of manual corrections? Our latest update auto-fixes some Betty errors for you. Just click 'Quick Fix,' and voila!
- **Toggle Shortcut:** Instantly toggle the Betty extension on or off with the shortcut `(Ctrl+Alt+A)`.
- **Efficient and Smart:** Our revamped, clean code is faster and smarter—no spaghetti code here!
- **Integrated Warnings:** We now use VS Code's built-in diagnostic tools for more streamlined error and warning displays.
- **Error Visibility:** Never miss an error again! Issues are highlighted at the top of your file and in the problem terminal.

### Previously Existing Features 🛠

- **Instant Alerts:** The Betty extension constantly monitors your code, providing instant alerts for any errors or warnings.
- **Error Details:** Hover over any error, and we'll provide detailed info and a 'Quick Fix' option if available.

## Requirements

Before using the Betty extension, ensure you have the following installed:

- [Betty Style Checker](https://github.com/alx-tools/Betty) - This extension depends on the Betty Style Checker for code analysis. Ensure it's configured on your system.

## Extension Settings

No additional configuration needed! The Betty extension works seamlessly with your VS Code setup.

## Release Notes 📘

### Version 3.0.0 (New)

- **Shortcut Toggle:** Added a `(Ctrl+Alt+A)` shortcut for dynamic enable/disable.
- **OOP Refactoring:** Redesigned the codebase using Object-Oriented Programming for modular, scalable, and optimized performance.
- **Diagnostic Class Integration:** Switched to VS Code's Diagnostic API for a consistent and integrated user experience.
- **Enhanced Error Display:** Errors and warnings now appear in VS Code's 'Problems' terminal and at the top of the active file.
- **Automated Betty Error Fixes:** Implemented algorithms to identify and auto-correct certain Betty errors with a single command.

### Previous Versions

#### 2.0.0
- Added icon
- Fixed 'Betty not found' bug
- Minor improvements

#### 1.0.0
- Initial release

## Known Issues

No known issues at the moment. For problems or suggestions, please report them on [GitHub Issues](https://github.com/moufidayoub/betty-extension/issues).

## How to Contribute to the Quick Fix Feature 🛠️

Contributing to the Quick Fix feature is a great way to improve the Betty Extension for everyone. Follow the steps below to get started:

### Prerequisites

- Familiarity with JavaScript and Node.js
- Visual Studio Code installed on your machine
- A fork of the [Betty Extension repository](https://github.com/moufidayoub/betty-extension)

### Steps

1. **Clone Your Fork**: Clone your forked repository to your local machine.

    ```bash
    git clone https://github.com/YOUR_USERNAME/betty-extension.git
    ```

2. **Navigate to the Quick Fix File**: Open the project in VS Code and navigate to the file that handles the Quick Fix feature (`BettyQuickFixProvider.js` or equivalent).

3. **Add Your Error Message and Fixing Function**: Locate the `errorFixingFunctions` object. Add a new key-value pair where the key is the error message you want to handle, and the value is the function that handles it.

    ```javascript
    const errorFixingFunctions = {
        // ...existing error handlers
        'your new error message': yourFixingFunction,
    };
    ```

4. **Implement Your Fixing Function**: Write the function that will fix the error. Make sure to follow the existing coding style and guidelines.

    ```javascript
    function yourFixingFunction(document, fix, range) {
        // Your code here
    }
    ```

5. **Test Your Changes**: Before submitting a pull request, make sure to test your changes thoroughly.

6. **Commit and Push**: Commit your changes and push them to your forked repository.

    ```bash
    git add .
    git commit -m "Added quick fix for 'your new error message'"
    git push origin main
    ```

7. **Create a Pull Request**: Go to the GitHub page of your forked repository and create a new pull request.

### Example

Here's a simple example to demonstrate how to add a new quick fix for the error message "missing semicolon":

```javascript
// Add to errorFixingFunctions object
const errorFixingFunctions = {
    // ...existing error handlers
    'missing semicolon': addMissingSemicolon,
};

// Implement the fixing function
function addMissingSemicolon(document, fix, range) {
    // Your code to add a missing semicolon
}
```

## Contact Information

- **Email:** moufidayoub883@gmail.com
- **Discord:** moufidayoub11

## License

This project is licensed under the GPL License. See the [LICENSE](LICENSE) file for details.
