// -----------------------------------------------------------------------------
// SECTION 1: TOKENIZER with Line/Column Tracking
// -----------------------------------------------------------------------------

// Tokenizes the input text, returning a list of tokens with type, value, line, and column info.
function tokenize(sourceText) {
    const parsedTokens = [];
    const tokenizationPatterns = [
        { type: 'whitespace', regex: /^\s+/ },
        { type: 'comment', regex: /^#.*/ },
        { type: 'multiline_string_double', regex: /^"""(?:\\.|[\s\S])*?"""/ },
        { type: 'multiline_string_single', regex: /^'''(?:\\.|[\s\S])*?'''/ },
        { type: 'str_double_quote', regex: /^"(?:\\.|[^"\\])*"/ },
        { type: 'str_single_quote', regex: /^'(?:\\.|[^'\\])*'/ },
        { type: 'keyword', regex: /^(?:False|None|True|and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield)\b/ },
        { type: 'num', regex: /^[0-9]+(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?/ },
        { type: 'operator', regex: /^(?:\+|\-|\|\/|%|\/\/|\\|\+=|\-=|\=|\/=|%=|==|!=|<=|>=|<|>|\&\&|\|\||\!)/ },
        { type: 'symbol', regex: /^[()\[\]{}:.,=*]/ },
        { type: 'identifier', regex: /^[A-Za-z_][A-Za-z0-9_]*/ },
        { type: 'unknown', regex: /^./ }
    ];

    let remainingSource = sourceText;
    let currentLine = 1;
    let currentColumn = 1;

    while (remainingSource.length) {
        let patternMatched = false;

        for (const pattern of tokenizationPatterns) {
            const regexMatch = remainingSource.match(pattern.regex);
            if (regexMatch) {
                patternMatched = true;
                const matchedValue = regexMatch[0];
                const startColumn = currentColumn;

                // Only add tokens that are not whitespace or comments
                if (!pattern.type.startsWith('whitespace') && pattern.type !== 'comment') {
                    let currentTokenType = pattern.type;

                    // Normalize all string types under a single str type
                    if (['multiline_string_double', 'multiline_string_single', 'str_double_quote', 'str_single_quote'].includes(currentTokenType)) {
                        currentTokenType = 'str';
                    }

                    parsedTokens.push({
                        type: currentTokenType,
                        value: matchedValue,
                        line: currentLine,
                        column: startColumn
                    });
                }

                // Update line and column tracking
                const linesInMatch = matchedValue.split('\n');
                if (linesInMatch.length > 1) {
                    currentLine += linesInMatch.length - 1;
                    currentColumn = linesInMatch[linesInMatch.length - 1].length + 1;
                } else {
                    currentColumn += matchedValue.length;
                }

                remainingSource = remainingSource.slice(matchedValue.length);
                break;
            }
        }

        // If no pattern is matched, classify the character as 'unknown'
        if (!patternMatched) {
            const unknownChar = remainingSource[0];
            parsedTokens.push({
                type: 'unknown',
                value: unknownChar,
                line: currentLine,
                column: currentColumn
            });
            remainingSource = remainingSource.slice(1);
            currentColumn++;
        }
    }

    // Append EOF token at the end of parsing
    parsedTokens.push({ type: 'EOF', value: '<eof>', line: currentLine, column: currentColumn });

    return parsedTokens;
}

module.exports = { tokenize };
