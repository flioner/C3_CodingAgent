// -----------------------------------------------------------------------------
// SECTION 4: MAIN ANALYSIS FUNCTIONS
// -----------------------------------------------------------------------------
// This module provides the main analysis function that classifies code based on its structure and metrics.
// It uses the tokenizer to generate tokens and the parser to analyze the code structure.
const { tokenize } = require('./tokenizer.js');
const { Parser } = require('./parser.js');

// -----------------------------------------------------------------------------
// Function: analyzeAndClassify
// This function takes a string of code, tokenizes it, parses the tokens to analyze the code structure,
// and classifies the code into a programming paradigm based on the analysis.

function analyzeAndClassify(codeText) {
    let paradigm = "Unknown"; let error = null;
    let metrics = {}; let symbols = [];
    
    try {
        const generatedTokens = tokenize(codeText);
        if (generatedTokens.length <= 1 && generatedTokens[0]?.type === 'EOF') {
            paradigm = "Empty";
            return { paradigm, metrics, symbolTable: symbols, error };
        }
        const codeStructureParser = new Parser(generatedTokens);
        codeStructureParser.parseProgram();
        metrics = codeStructureParser.metrics;
        symbols = codeStructureParser.symbolTable.getAllSymbols();

        const hasClasses = metrics.classCount > 0;
        const hasStandAloneFunctions = metrics.standAloneFunctionCount > 0;
        const hasMethodsOrConstructors = metrics.methodCount > 0 || metrics.constructorCount > 0;
        const hasInstantiations = metrics.instantiationCount > 0;

        if (hasClasses && (hasMethodsOrConstructors || hasInstantiations)) {
            if (hasStandAloneFunctions) {
                if (metrics.standAloneFunctionCount > metrics.classCount || 
                    (metrics.standAloneFunctionCount > 0 && metrics.classCount <= 2 && metrics.standAloneFunctionCount >=1 )) {
                    paradigm = "Hybrid";
                } else {
                    paradigm = "OOP";
                }
            } else {
                paradigm = "OOP";
            }
        } else if (hasStandAloneFunctions) {
            paradigm = "Procedural";
        } else if (hasInstantiations && !hasClasses && !hasStandAloneFunctions) {
            paradigm = "Procedural (with object usage)";
        } else if (!hasClasses && !hasStandAloneFunctions && generatedTokens.filter(t=>t.type !== 'EOF').length > 0 ) {
            paradigm = "Script/Declarative";
        } else if (generatedTokens.filter(t => t.type !== 'EOF').length === 0){
            paradigm = "Empty";
        }
    } catch (errObj) {
        error = errObj.message; 
        paradigm = "Error";
        console.error("[MainAnalysis] Error during analysis:", errObj.stack || errObj); 
    }
    return { paradigm, metrics, symbolTable: symbols, error };
}

module.exports = { analyzeAndClassify };