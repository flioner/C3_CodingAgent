// -----------------------------------------------------------------------------
// SECTION 3: PARSER
// -----------------------------------------------------------------------------
// This module implements a parser for a simplified programming language.
// It processes a sequence of tokens, building a symbol table and collecting metrics
// about the code structure, such as class definitions, function definitions, and instantiations.
// The parser supports class definitions, function definitions, method definitions,
// inheritance, and instantiation of classes. It also handles function calls and parameter parsing.
// The parser is designed to be extensible and can be adapted for different language features.

const { SymbolEntry, SymbolTable } = require('./symbolTable.js');

class Parser {
    constructor(tokenSequence) {
        this.tokenStream = tokenSequence;
        this.tokenIndex = 0;
        this.symbolTable = new SymbolTable();
        this.metrics = {
            classCount: 0, methodCount: 0, constructorCount: 0, inheritanceCount: 0,
            superCallCount: 0, instantiationCount: 0, standAloneFunctionCount: 0,
        };
    }

    peek(offset = 0) {
        return this.tokenStream[this.tokenIndex + offset] || { type: 'EOF', value: '<eof>', line: -1, column: -1 };
    }

    at(expectedType, expectedValue = undefined, position = this.tokenIndex) {
        const tokenInfo = this.tokenStream[position];
        return tokenInfo && tokenInfo.type === expectedType && (expectedValue === undefined || tokenInfo.value === expectedValue);
    }

    match(expectedType, expectedValue = undefined) {
        if (this.at(expectedType, expectedValue)) {
            this.tokenIndex++;
            return true;
        }
        return false;
    }

    expect(expectedType, expectedValue = undefined) {
        const currentToken = this.peek();
        if (!this.match(expectedType, expectedValue)) {
            const errorMsg = `PARSER ERROR (L:${currentToken.line}, C:${currentToken.column}): Expected ${expectedValue ?? expectedType} but found ${currentToken.type} '${currentToken.value}'`;
            console.error(errorMsg); 
            throw new Error(errorMsg);
        }
    }

    skipBalancedParentheses(extractParamNames = false) {
        let level = 1; 
        const params = [];
        let currentParamIdentifierToken = null;

        while (level > 0 && !this.at('EOF')) {
            const token = this.peek();
            if (this.match('symbol', '(')) {
                level++;
            } else if (this.match('symbol', ')')) {
                level--;
                if (extractParamNames && currentParamIdentifierToken) {
                    params.push(currentParamIdentifierToken.value);
                    currentParamIdentifierToken = null;
                }
                if (level === 0) break;
            } else if (extractParamNames && level === 1 && token.type === 'identifier') {
                if (currentParamIdentifierToken) { 
                    params.push(currentParamIdentifierToken.value);
                }
                currentParamIdentifierToken = token; 
                this.tokenIndex++; 
            } else if (extractParamNames && level === 1 && this.match('symbol', ',')) {
                if (currentParamIdentifierToken) {
                    params.push(currentParamIdentifierToken.value);
                    currentParamIdentifierToken = null;
                }
            } else {
                this.tokenIndex++; 
            }
        }
        return params;
    }

    _parseParametersAndAddToSymbolTable(functionIdentifier, funcNameToken, isClassMethod) {
        const params = this.skipBalancedParentheses(true); 
        const currentScopeForFuncSymbol = this.symbolTable.getCurrentScopeName();
        this.symbolTable.addSymbol(new SymbolEntry(functionIdentifier, isClassMethod ? 'method' : 'function', null, currentScopeForFuncSymbol, funcNameToken.line, funcNameToken.column, null, params));
        this.symbolTable.enterScope(functionIdentifier); 
        params.forEach((paramName, index) => {
            let pKind = 'parameter';
            if (isClassMethod && index === 0 && (paramName === 'self' || paramName === 'cls')) {
                pKind = 'parameter_special';
            }
            this.symbolTable.addSymbol(new SymbolEntry(paramName, pKind, null, functionIdentifier, funcNameToken.line, funcNameToken.column));
        });
    }

    _parseInheritanceList() {
        this.metrics.inheritanceCount++; 
        let nestingDepth = 1; 
        while (nestingDepth > 0 && !this.at('EOF')) {
            if (this.at('identifier', 'super') && this.peek(1).type === 'symbol' && this.peek(1).value === '(') {
                this.metrics.superCallCount++;
            }
            if (this.match('symbol', '(')) nestingDepth++;
            else if (this.match('symbol', ')')) nestingDepth--;
            else this.tokenIndex++; 
        }
        return nestingDepth === 0;
    }

    parseProgram() {
        while (!this.at('EOF')) {
            const iterationStartIndex = this.tokenIndex;
            if (this.parseClassDefinition()) continue;
            if (this.parseFunctionDefinition(false)) continue; 
            if (this.parseInstantiationOrCallStatement()) continue;

            if (this.tokenIndex === iterationStartIndex && !this.at('EOF')) {
                this.tokenIndex++; 
            }
        }
    }

    parseClassDefinition() {
        if (!this.at('keyword', 'class')) return false; 
        
        const classKeywordToken = this.peek(); 
        this.match('keyword', 'class'); 
        this.metrics.classCount++;

        const classNameToken = this.peek();
        if (!this.match('identifier')) {
            console.error(`PARSER ERROR (L:${classNameToken.line}, C:${classNameToken.column}): Expected class name after 'class' keyword.`);
            this.tokenIndex = classKeywordToken.type !== 'EOF' ? this.tokenIndex -1 : this.tokenIndex; 
            return false;
        }
        const className = classNameToken.value;
        this.symbolTable.addSymbol(new SymbolEntry(className, 'class', className, this.symbolTable.getCurrentScopeName(), classNameToken.line, classNameToken.column));
        this.symbolTable.enterScope(className);

        if (this.match('symbol', '(')) {
            if (!this._parseInheritanceList()) {
                console.error(`PARSER ERROR (L:${this.peek(-1).line}, C:${this.peek(-1).column}): Malformed inheritance list for class '${className}'.`);
                this.symbolTable.exitScope();
                return false;
            }
        }
        this.expect('symbol', ':');

        const classStartColumn = classKeywordToken.column;
        
        while (!this.at('EOF')) {
            const currentTokenInBody = this.peek();

            if (currentTokenInBody.type === 'keyword' && currentTokenInBody.value === 'def') {
                const defKeywordColumn = currentTokenInBody.column;
                
                if (defKeywordColumn > classStartColumn) { 
                    if (this.parseFunctionDefinition(true)) { 
                        continue; 
                    } else {
                        break; 
                    }
                } else {
                    break; 
                }
            } else if (currentTokenInBody.type === 'keyword' && currentTokenInBody.value === 'class') {
                break; 
            } else if (currentTokenInBody.type === 'EOF') {
                break; 
            } else {
                break; 
            }
        }
        this.symbolTable.exitScope(); 
        return true;
    }

    parseFunctionDefinition(isClassMethod = false) {
        if (!this.at('keyword', 'def')) return false;
        
        const defToken = this.peek(); 
        this.match('keyword', 'def'); 

        const funcNameToken = this.peek();
        if (!this.match('identifier')) {
            console.error(`PARSER ERROR (L:${funcNameToken.line}, C:${funcNameToken.column}): Expected function name after 'def' keyword.`);
            this.tokenIndex = defToken.type !== 'EOF' ? this.tokenIndex -1: this.tokenIndex;
            return false;
        }
        const functionIdentifier = funcNameToken.value;

        if (isClassMethod) {
            this.metrics.methodCount++;
            if (functionIdentifier === '__init__') {
                this.metrics.constructorCount++;
            }
        } else {
            this.metrics.standAloneFunctionCount++;
        }

        this.expect('symbol', '(');
        this._parseParametersAndAddToSymbolTable(functionIdentifier, funcNameToken, isClassMethod);
        this.expect('symbol', ':');

        const defTokenStartColumn = defToken.column;
        const defTokenLine = defToken.line; 

        while (!this.at('EOF')) {
            const currentToken = this.peek();

            if (currentToken.type === 'EOF') {
                break;
            }

            if (currentToken.type === 'identifier' && currentToken.value === 'super' &&
                this.peek(1) && this.peek(1).type === 'symbol' && this.peek(1).value === '(') {
                this.metrics.superCallCount++;
                this.tokenIndex++; 
                this.expect('symbol', '('); 
                this.skipBalancedParentheses(); 
                continue; 
            }

            let endFunctionBody = false;
            if (currentToken.type === 'keyword' && (currentToken.value === 'def' || currentToken.value === 'class')) {
                if (currentToken.column <= defTokenStartColumn) {
                    endFunctionBody = true;
                }
            }

            if (!endFunctionBody && currentToken.line > defTokenLine && currentToken.column <= defTokenStartColumn) {
                const isClosingDelim = currentToken.type === 'symbol' && (currentToken.value === ')' || currentToken.value === ']' || currentToken.value === '}');
                const isBlockContinuationKeyword = currentToken.type === 'keyword' &&
                    (currentToken.value === 'else' || currentToken.value === 'elif' ||
                     currentToken.value === 'except' || currentToken.value === 'finally');

                if (!isClosingDelim && !isBlockContinuationKeyword) {
                    endFunctionBody = true;
                }
            }
            
            if (endFunctionBody) {
                break;
            }
            this.tokenIndex++;
        }
        this.symbolTable.exitScope(); 
        return true;
    }

    parseInstantiationOrCallStatement() {
        const initialParserIndex = this.tokenIndex;
        let evaluationIndex = this.tokenIndex;
        let isAssignmentExpression = false;
        let lhsIdentifierToken = null;

        let lhsEvaluationIndex = this.tokenIndex;
        if (this.at('identifier', undefined, lhsEvaluationIndex)) {
            lhsIdentifierToken = this.tokenStream[lhsEvaluationIndex];
            lhsEvaluationIndex++;
            while (this.at('symbol', '.', lhsEvaluationIndex) && this.at('identifier', undefined, lhsEvaluationIndex + 1)) {
                lhsEvaluationIndex += 2; 
            }
            if (this.at('symbol', '=', lhsEvaluationIndex)) {
                evaluationIndex = lhsEvaluationIndex + 1; 
                isAssignmentExpression = true;
            }
        }
        if (!isAssignmentExpression) {
            evaluationIndex = initialParserIndex; 
            lhsIdentifierToken = null; 
        }

        let finalIdentifierTokenInfo = null; 
        let tempIndex = evaluationIndex; 
        let callableChain = [];

        while(!this.at('EOF', undefined, tempIndex)) {
            const currentChainToken = this.tokenStream[tempIndex];
            const nextChainToken = this.tokenStream[tempIndex + 1];

            if (currentChainToken && currentChainToken.type === 'identifier') {
                callableChain.push(currentChainToken); 
                finalIdentifierTokenInfo = currentChainToken; 
                tempIndex++;

                if (nextChainToken && nextChainToken.type === 'symbol' && nextChainToken.value === '.') {
                    tempIndex++; 
                    continue;
                } else if (nextChainToken && nextChainToken.type === 'symbol' && nextChainToken.value === '(') {
                    if (isAssignmentExpression) {
                         this.tokenIndex = lhsEvaluationIndex; 
                         this.expect('symbol','='); 
                    }
                    
                    for(let i=0; i<callableChain.length; i++){
                        this.expect('identifier', callableChain[i].value);
                        if(i < callableChain.length -1) this.expect('symbol','.');
                    }
                    
                    const isLikelyClass = finalIdentifierTokenInfo.value.match(/^[A-Z]/);
                    const knownClass = this.symbolTable.findSymbol(finalIdentifierTokenInfo.value);
                    if (isLikelyClass || (knownClass && knownClass.kind === 'class')) {
                        this.metrics.instantiationCount++;
                    }
                    
                    if (isAssignmentExpression && lhsIdentifierToken) {
                         if(!this.symbolTable.lookupSymbolInScope(lhsIdentifierToken.value, this.symbolTable.getCurrentScopeName())){
                            const typeOfVar = (isLikelyClass || (knownClass && knownClass.kind === 'class')) 
                                            ? finalIdentifierTokenInfo.value 
                                            : 'unknown_type_call_result';
                            this.symbolTable.addSymbol(new SymbolEntry(
                                lhsIdentifierToken.value, 'variable', typeOfVar,
                                this.symbolTable.getCurrentScopeName(),
                                lhsIdentifierToken.line, lhsIdentifierToken.column
                            ));
                        }
                    }
                    this.expect('symbol', '('); 
                    this.skipBalancedParentheses(); 
                    return true; 
                } else { 
                    this.tokenIndex = initialParserIndex; return false; 
                }
            } else { 
                this.tokenIndex = initialParserIndex; return false;
            }
        }
        this.tokenIndex = initialParserIndex; return false; 
    }
}

module.exports = { Parser };