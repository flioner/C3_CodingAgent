# Object-Oriented vs Procedural Code Classifier (Compiler Project)

This project is a lexical and syntax analyzer that determines whether a given Python source file is written using the:

- **OOP (Object-Oriented Programming) Paradigm**
- **PP (Procedural Programming) Paradigm**
- **Hybrid Approach (a mix of both)**
  
---

## Authors:
1. Andrea Núñez García - A01640839
2. Alfonso Ramirez Alvarado - A01641937
3. Emilio Berber Maldonado - A01640603
4. Juan Pablo Zambrano - A01636420
5. Edgar Fabian Lioner Rocha - A01633776

---

## Overview

This partial compiler performs:

- Token recognition using regular expressions.
- Symbol table construction.
- Code paradigm classification (OOP / PP / Hybrid).
- Basic parsing of code structure.

---

## Project Structure

project/
- analyzer.js # Main module: classification logic
- tokenizer.js # Scanner: regex-based lexical analysis
- parser.js # Syntax analysis: structure identification
- utils.js/symbolTable.js # Helpers for token and symbol handling
- main.js # CLI script
- examples/ # Embedded test cases or input scripts (.py) using OOP, PP, Hybrid examples
- README.md

---

## Key Features

- Detects classes, methods, functions, and object usage.
- Builds a symbol table (with type, scope, line, column, etc.).
- Identifies hybrid code patterns (e.g., object usage with top-level functions).
- Executes built-in test cases if no file is passed.

---

## Installation & Execution

### 1. Prerequisites

Make sure you have **Node.js v14+** installed, if not you have to install it.

### 2. Clone the repository
[cmd/powershell/bash]
<pre lang="markdown"> 
git clone https://github.com/emilioberber/compiler_project.git
cd compiler_project
</pre>

### 3. Run your own .py files:

Pass one or more Python files as arguments
Example: if you want to run all the examples:

<pre lang="markdown"> 
node main.js example1.py example2.py example3.py example4.py example5.py    
</pre>

### 4. Sample Output:
<pre lang="markdown"> 
--- Analyzing file: example2.py ---
Final Classification: OOP
Detailed Metrics: {
  classCount: 2,
  methodCount: 3,
  constructorCount: 1,
  inheritanceCount: 1,
  superCallCount: 0,
  instantiationCount: 1,
  standAloneFunctionCount: 0
}

Symbol Table Explanation Table:
Token       | Regex               | Description                 | Justification
-------------------------------------------------------------------------------
Dog         | ^[A-Za-z_]\w*$      | Class name                  | Declared using 'class Dog'
speak       | ^[A-Za-z_]\w*$      | Method                      | Defined inside class body
my_dog      | ^[A-Za-z_]\w*$      | Object / instance           | Assigned from class: my_dog = Dog(...)

</pre>


## Professor:
- Victor Rodríguez
