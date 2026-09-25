/**
 * Python & Telebot Script Code Beautifier / Formatter
 * Formats indentation (4 spaces), operators, commas, and line breaks
 */

export function beautifyPythonCode(code: string): string {
  if (!code || typeof code !== 'string') return '';

  const lines = code.split('\n');
  const formattedLines: string[] = [];
  let indentLevel = 0;
  let inMultiLineString = false;
  let multiLineStringDelimiter = '';
  let consecutiveEmptyLines = 0;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Check for multiline string start/end
    if (!inMultiLineString) {
      if (trimmed.startsWith('"""') || trimmed.startsWith("'''")) {
        multiLineStringDelimiter = trimmed.slice(0, 3);
        // Check if it closes on the same line
        if (trimmed.length > 3 && trimmed.slice(3).includes(multiLineStringDelimiter)) {
          inMultiLineString = false;
        } else {
          inMultiLineString = true;
        }
        formattedLines.push('    '.repeat(indentLevel) + trimmed);
        consecutiveEmptyLines = 0;
        continue;
      }
    } else {
      // Inside multiline string, preserve raw content
      formattedLines.push(rawLine);
      if (rawLine.includes(multiLineStringDelimiter)) {
        inMultiLineString = false;
      }
      consecutiveEmptyLines = 0;
      continue;
    }

    // Handle empty lines (allow at most 1 consecutive empty line)
    if (trimmed.length === 0) {
      consecutiveEmptyLines++;
      if (consecutiveEmptyLines <= 1 && formattedLines.length > 0) {
        formattedLines.push('');
      }
      continue;
    }
    consecutiveEmptyLines = 0;

    // Comments: preserve indentation and format
    if (trimmed.startsWith('#')) {
      formattedLines.push('    '.repeat(indentLevel) + trimmed);
      continue;
    }

    // Dedent keywords check
    const isDedentLine =
      trimmed.startsWith('elif ') ||
      trimmed.startsWith('else:') ||
      trimmed.startsWith('except') ||
      trimmed.startsWith('finally:') ||
      trimmed === 'else' ||
      trimmed === 'finally';

    const effectiveIndent = isDedentLine ? Math.max(0, indentLevel - 1) : indentLevel;

    // Clean up commas: replace "," with ", " if not inside string
    let formattedText = cleanLinePunctuation(trimmed);

    formattedLines.push('    '.repeat(effectiveIndent) + formattedText);

    // Calculate next indent level
    if (trimmed.endsWith(':')) {
      indentLevel++;
    } else if (
      trimmed.startsWith('return') ||
      trimmed === 'pass' ||
      trimmed === 'break' ||
      trimmed === 'continue'
    ) {
      // Next line might dedent if next line is not indented, handled naturally
    }
  }

  return formattedLines.join('\n');
}

/**
 * Basic spacing cleanup for non-string tokens
 */
function cleanLinePunctuation(line: string): string {
  // If line has strings or comments, be careful
  if (line.includes('"') || line.includes("'") || line.includes('#')) {
    // Preserve string literals while trimming extra whitespace around = where safe
    return line;
  }

  let cleaned = line
    .replace(/\s*([=+\-*/%<>!]=|[=+\-*/%<>])\s*/g, ' $1 ')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s*:\s*/g, ': ')
    .replace(/\s+/g, ' ')
    .trim();

  // Fix accidental spaces like ': ' at line end
  if (cleaned.endsWith(': ')) {
    cleaned = cleaned.slice(0, -1);
  }
  // Fix double spaces inside parentheses
  cleaned = cleaned.replace(/\(\s+/g, '(').replace(/\s+\)/g, ')');
  cleaned = cleaned.replace(/\[\s+/g, '[').replace(/\s+\]/g, ']');

  return cleaned;
}
