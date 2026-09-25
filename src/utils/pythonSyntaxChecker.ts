export interface SyntaxErrorItem {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning';
  suggestion?: string;
  snippet?: string;
}

export interface SyntaxCheckResult {
  isValid: boolean;
  errors: SyntaxErrorItem[];
  warnings: SyntaxErrorItem[];
}

/**
 * Robust Python 3 & Telebot Script Syntax Checker.
 * Validates indentation, statement colons, bracket matching, string literals,
 * assignment-in-condition checks, block structures, and print statements.
 */
export function validatePythonSyntax(code: string): SyntaxCheckResult {
  const errors: SyntaxErrorItem[] = [];
  const warnings: SyntaxErrorItem[] = [];

  if (!code || code.trim().length === 0) {
    return { isValid: true, errors: [], warnings: [] };
  }

  const lines = code.split('\n');

  // Track multiline strings """ or '''
  let inTripleDouble = false;
  let inTripleSingle = false;
  let tripleStartLine = 0;

  // Bracket stack for (), [], {}
  const bracketStack: { char: string; line: number; col: number }[] = [];
  const bracketPairs: Record<string, string> = {
    ')': '(',
    ']': '[',
    '}': '{',
  };

  // Indentation stack for Python blocks
  const indentStack: number[] = [0];
  let expectingIndentedBlock = false;
  let expectingBlockLine = 0;

  // Control structure tracker for dangling elif/else/except/finally
  const controlStack: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const lineNum = i + 1;

    // Multiline string handling
    if (inTripleDouble) {
      if (rawLine.includes('"""')) {
        inTripleDouble = false;
      }
      continue;
    }
    if (inTripleSingle) {
      if (rawLine.includes("'''")) {
        inTripleSingle = false;
      }
      continue;
    }

    // Check if multiline string starts on this line
    const countTD = (rawLine.match(/"""/g) || []).length;
    if (countTD % 2 === 1) {
      inTripleDouble = true;
      tripleStartLine = lineNum;
      continue;
    }
    const countTS = (rawLine.match(/'''/g) || []).length;
    if (countTS % 2 === 1) {
      inTripleSingle = true;
      tripleStartLine = lineNum;
      continue;
    }

    // Strip leading spaces to find indent
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      // Empty line or comment-only line does not satisfy or break expected indented block
      continue;
    }

    // Measure leading whitespace indentation (tabs = 4 spaces)
    let indent = 0;
    let hasTabs = false;
    let hasSpaces = false;
    for (let c = 0; c < rawLine.length; c++) {
      if (rawLine[c] === ' ') {
        indent += 1;
        hasSpaces = true;
      } else if (rawLine[c] === '\t') {
        indent += 4;
        hasTabs = true;
      } else {
        break;
      }
    }

    if (hasTabs && hasSpaces) {
      warnings.push({
        line: lineNum,
        column: 1,
        message: 'TabError: Inconsistent use of tabs and spaces in indentation.',
        severity: 'warning',
        suggestion: 'Convert all tabs to 4 spaces for consistent Python execution.',
        snippet: rawLine,
      });
    }

    // Check if an indented block was expected from previous statement
    if (expectingIndentedBlock) {
      const parentIndent = indentStack[indentStack.length - 1];
      if (indent <= parentIndent) {
        errors.push({
          line: lineNum,
          column: indent + 1,
          message: 'IndentationError: expected an indented block after statement on line ' + expectingBlockLine,
          severity: 'error',
          suggestion: `Indent this line by at least ${parentIndent + 4} spaces.`,
          snippet: rawLine,
        });
      } else {
        indentStack.push(indent);
      }
      expectingIndentedBlock = false;
    } else {
      // Check if indentation decreased
      const currentIndent = indentStack[indentStack.length - 1];
      if (indent > currentIndent) {
        // Unexpected indent without preceding ':'
        errors.push({
          line: lineNum,
          column: indent + 1,
          message: 'IndentationError: unexpected indent',
          severity: 'error',
          suggestion: `Align this line with previous block indentation (${currentIndent} spaces).`,
          snippet: rawLine,
        });
      } else if (indent < currentIndent) {
        // Unindenting: must match one of the outer indentation levels
        let matched = false;
        while (indentStack.length > 1) {
          indentStack.pop();
          if (controlStack.length > 0) controlStack.pop();
          if (indentStack[indentStack.length - 1] === indent) {
            matched = true;
            break;
          }
        }
        if (!matched && indent !== 0) {
          errors.push({
            line: lineNum,
            column: indent + 1,
            message: 'IndentationError: unindent does not match any outer indentation level',
            severity: 'error',
            suggestion: 'Ensure the indentation level matches an outer block (typically 0, 4, 8 spaces).',
            snippet: rawLine,
          });
        }
      }
    }

    // Check Python 2 print statement: e.g. print "message" or print 'message'
    const printMatch = trimmed.match(/^print\s+("[^"]*"|'[^']*'|[a-zA-Z0-9_]+)/);
    if (printMatch && !trimmed.startsWith('print(')) {
      errors.push({
        line: lineNum,
        column: rawLine.indexOf('print') + 1,
        message: "SyntaxError: Missing parentheses in call to 'print'. Did you mean print(...) ?",
        severity: 'error',
        suggestion: `Change '${printMatch[0]}' to 'print(${printMatch[1]})'`,
        snippet: rawLine,
      });
    }

    // Check compound statement headers that REQUIRE a trailing ':'
    const compoundRegex = /^(async\s+def|async\s+for|async\s+with|def|class|if|elif|else|for|while|try|except|finally|with)(\b.*|$)/;
    const matchCompound = trimmed.match(compoundRegex);

    if (matchCompound) {
      const keyword = matchCompound[1].trim();
      const afterKw = matchCompound[2]?.trim() || '';

      // Clean inline comments for colon check
      let cleanStatement = trimmed;
      let inQuote = false;
      let quoteChar = '';
      for (let c = 0; c < cleanStatement.length; c++) {
        const ch = cleanStatement[c];
        if ((ch === '"' || ch === "'") && cleanStatement[c - 1] !== '\\') {
          if (!inQuote) {
            inQuote = true;
            quoteChar = ch;
          } else if (quoteChar === ch) {
            inQuote = false;
          }
        } else if (ch === '#' && !inQuote) {
          cleanStatement = cleanStatement.slice(0, c).trim();
          break;
        }
      }

      if (!cleanStatement.endsWith(':')) {
        errors.push({
          line: lineNum,
          column: rawLine.length + 1,
          message: `SyntaxError: expected ':' at end of '${keyword}' statement`,
          severity: 'error',
          suggestion: `Add ':' to the end of line ${lineNum}`,
          snippet: rawLine,
        });
      } else {
        expectingIndentedBlock = true;
        expectingBlockLine = lineNum;
      }

      // Check conditional statements for accidental single assignment '='
      if (keyword === 'if' || keyword === 'elif') {
        // Look for assignment like 'if x = 5:' or 'elif var = "a":'
        // Ignore ==, !=, <=, >=, :=
        const conditionText = cleanStatement.slice(keyword.length, -1).trim();
        const invalidSingleEqual = /(?<![=!<>:])=(?![=])/.test(conditionText);
        if (invalidSingleEqual) {
          errors.push({
            line: lineNum,
            column: rawLine.indexOf('=') + 1,
            message: `SyntaxError: invalid syntax. Maybe you meant '==' for comparison instead of assignment '='?`,
            severity: 'error',
            suggestion: "Replace '=' with '==' in the conditional check.",
            snippet: rawLine,
          });
        }
      }

      // Track block type
      if (keyword === 'if' || keyword === 'try' || keyword === 'for' || keyword === 'while' || keyword === 'def') {
        controlStack.push(keyword);
      }
    }

    // Bracket & string balance check inside line
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let isEscaped = false;

    for (let c = 0; c < rawLine.length; c++) {
      const char = rawLine[c];

      if (char === '#' && !inSingleQuote && !inDoubleQuote) {
        break; // inline comment
      }

      if (char === '\\' && (inSingleQuote || inDoubleQuote)) {
        isEscaped = !isEscaped;
        continue;
      }

      if (char === '"' && !inSingleQuote && !isEscaped) {
        inDoubleQuote = !inDoubleQuote;
      } else if (char === "'" && !inDoubleQuote && !isEscaped) {
        inSingleQuote = !inSingleQuote;
      } else if (!inSingleQuote && !inDoubleQuote) {
        if (char === '(' || char === '[' || char === '{') {
          bracketStack.push({ char, line: lineNum, col: c + 1 });
        } else if (char === ')' || char === ']' || char === '}') {
          const expectedOpen = bracketPairs[char];
          const last = bracketStack.pop();
          if (!last || last.char !== expectedOpen) {
            errors.push({
              line: lineNum,
              column: c + 1,
              message: `SyntaxError: unmatched '${char}'`,
              severity: 'error',
              suggestion: `Check bracket pairing around line ${lineNum}`,
              snippet: rawLine,
            });
          }
        }
      }

      isEscaped = false;
    }

    if (inSingleQuote) {
      errors.push({
        line: lineNum,
        column: rawLine.length,
        message: `SyntaxError: EOL while scanning string literal (unclosed single quote ')`,
        severity: 'error',
        suggestion: "Close the single quote '",
        snippet: rawLine,
      });
    }

    if (inDoubleQuote) {
      errors.push({
        line: lineNum,
        column: rawLine.length,
        message: `SyntaxError: EOL while scanning string literal (unclosed double quote ")`,
        severity: 'error',
        suggestion: 'Close the double quote "',
        snippet: rawLine,
      });
    }
  }

  // Check EOF trailing errors
  if (inTripleDouble) {
    errors.push({
      line: tripleStartLine,
      column: 1,
      message: 'SyntaxError: EOF while scanning triple-quoted string literal (""")',
      severity: 'error',
      suggestion: 'Close the multiline string with """',
    });
  }

  if (inTripleSingle) {
    errors.push({
      line: tripleStartLine,
      column: 1,
      message: "SyntaxError: EOF while scanning triple-quoted string literal (''')",
      severity: 'error',
      suggestion: "Close the multiline string with '''",
    });
  }

  if (expectingIndentedBlock) {
    errors.push({
      line: expectingBlockLine,
      column: 1,
      message: 'IndentationError: expected an indented block at end of file',
      severity: 'error',
      suggestion: 'Add indented code block under statement.',
    });
  }

  while (bracketStack.length > 0) {
    const unclosed = bracketStack.pop()!;
    const closeChar = unclosed.char === '(' ? ')' : unclosed.char === '[' ? ']' : '}';
    errors.push({
      line: unclosed.line,
      column: unclosed.col,
      message: `SyntaxError: '${unclosed.char}' was never closed`,
      severity: 'error',
      suggestion: `Add '${closeChar}' to close the bracket opened on line ${unclosed.line}`,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
