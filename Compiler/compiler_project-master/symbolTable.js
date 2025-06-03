// -----------------------------------------------------------------------------
// SECTION 2: SYMBOL TABLE Implementation
// -----------------------------------------------------------------------------

// Represents an entry in the symbol table about a symbol
class SymbolEntry {
    constructor(name, kind, dataType, scope, line, column, value = null, params = []) {
        this.name = name;       // Identifier name
        this.kind = kind;       // example: variable, function, parameter
        this.dataType = dataType; // example: int, float, string
        this.scope = scope;     // Scope where the symbol is defined
        this.line = line;       // Line of declaration
        this.column = column;   // Column of declaration
        this.value = value;     // Optional: initial or current value
        this.params = params;   // Optional: parameter list (for functions)
    }
}

// Manages symbol entries organized by scope
class SymbolTable {
    constructor() {
        this.scopes = new Map();           
        this.scopeStack = ['global'];    
        this.scopes.set('global', new Map()); 
    }

    // Returns the name of the current scope
    getCurrentScopeName() {
        return this.scopeStack[this.scopeStack.length - 1];
    }

    // Enters a new scope; creates it if it doesn't exist
    enterScope(scopeName) {
        this.scopeStack.push(scopeName);
        if (!this.scopes.has(scopeName)) {
            this.scopes.set(scopeName, new Map());
        }
    }

    // Exits the current scope
    exitScope() {
        this.scopeStack.pop();
    }

    // Adds a symbol to the table; returns false if redefined in same scope
    addSymbol(symbol) {
        const scopeName = symbol.scope;
        const scopeMap = this.scopes.get(scopeName);
        if (!scopeMap) {
            return false;
        }
        if (scopeMap.has(symbol.name)) {
            return false;
        }
        scopeMap.set(symbol.name, symbol);
        return true;
    }

    // Looks up a symbol by name in a specific scope
    lookupSymbolInScope(name, scopeName) {
        const scopeMap = this.scopes.get(scopeName);
        return scopeMap ? (scopeMap.get(name) || null) : null;
    }

    // Searches for a symbol in current and outer scopes (from innermost to outermost)
    findSymbol(name) {
        for (let i = this.scopeStack.length - 1; i >= 0; i--) {
            const scopeName = this.scopeStack[i];
            const symbol = this.lookupSymbolInScope(name, scopeName);
            if (symbol) return symbol;
        }
        return null;
    }

    // Returns a flat list of all symbols from all scopes
    getAllSymbols() {
        let all = [];
        for (const scopeMap of this.scopes.values()) {
            all = all.concat(Array.from(scopeMap.values()));
        }
        return all;
    }
}

module.exports = { SymbolEntry, SymbolTable };
