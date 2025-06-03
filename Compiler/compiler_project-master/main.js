// -----------------------------------------------------------------------------
// SECTION 5: COMMAND-LINE EXECUTION AND MODULE INTERACTION
// -----------------------------------------------------------------------------

const fs = require('fs');
const { analyzeAndClassify } = require('./analyzer.js');

// Formats symbol table entries into a table with explanations
function formatSymbolTableAsExplanatoryTable(symbols) {
    return symbols.map(sym => {
        const regex = sym.name === "self" ? "^self$" : "^[A-Za-z_]\\w*$";
        let description = "";
        let justification = "";

        // Describe and justify each symbol based on its kind
        switch (sym.kind) {
            case "class":
                description = "Class name";
                justification = `Declared with 'class ${sym.name}:'`;
                break;
            case "variable":
                description = `Instance of ${sym.dataType || 'unknown'}`;
                justification = `Declared in scope '${sym.scope}'`;
                break;
            case "method":
                description = `Method of class ${sym.scope}`;
                justification = `Defined inside class ${sym.scope}`;
                break;
            case "parameter":
                description = "Function/method parameter";
                justification = `Used in method/function ${sym.scope}`;
                break;
            case "parameter_special":
                description = "Special instance parameter";
                justification = `Represents the instance (self) in ${sym.scope}`;
                break;
            default:
                description = "Unknown kind";
                justification = "Unrecognized symbol type";
        }

        return `${sym.name.padEnd(12)}| ${regex.padEnd(20)}| ${description.padEnd(28)}| ${justification}`;
    }).join("\n");
}

// If run directly via CLI, analyze input files or use test cases
if (typeof require !== 'undefined' && require.main === module) {
    const cliInputFilePaths = process.argv.slice(2);

    // Run test cases if no file paths are provided
    if (cliInputFilePaths.length === 0) {
        console.warn('No file paths provided. Running example test cases instead.\n');

        // Analyze each test snippet and print results
        exampleSnippets.forEach(snippet => {
            console.log(`--- Test Case: ${snippet.name} ---`);
            const classificationReport = analyzeAndClassify(snippet.code);

            console.log("Final Classification:", classificationReport.paradigm);
            console.log("Detailed Metrics:", classificationReport.metrics);

            if (classificationReport.error) console.log("Error:", classificationReport.error);
            if (classificationReport.symbolTable && classificationReport.symbolTable.length > 0) {
                console.log("Symbol Table:");
                console.log("Token       | Regex               | Description                 | Justification");
                console.log("-------------------------------------------------------------------------------");
                console.log(formatSymbolTableAsExplanatoryTable(classificationReport.symbolTable.slice(0, 5)));
            } else {
                console.log("Symbol Table: (empty)");
            }

            console.log("-----------------------------------\n");
        });

        process.exit(0);
    }

    // Process each file path given via CLI
    cliInputFilePaths.forEach((filePath) => {
        try {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            console.log(`\n--- Analyzing file: ${filePath} ---`);
            const report = analyzeAndClassify(fileContent);

            console.log("Final Classification:", report.paradigm);
            console.log("Detailed Metrics:", report.metrics);
            if (report.error) console.log("Error during analysis:", report.error);

            if (report.symbolTable && report.symbolTable.length > 0) {
                console.log("Symbol Table:");
                console.log("Token       | Regex               | Description                 | Justification");
                console.log("-------------------------------------------------------------------------------");
                console.log(formatSymbolTableAsExplanatoryTable(report.symbolTable));
            } else {
                console.log("Symbol Table: (empty)");
            }

        } catch (error) {
            console.error(`Error reading or processing file ${filePath}:`, error.message);
        }
        console.log("\n-----------------------------------\n");
    });
}
