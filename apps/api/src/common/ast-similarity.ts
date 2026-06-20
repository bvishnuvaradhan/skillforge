import * as acorn from 'acorn';

// Map of acorn AST node types to compact characters
const AST_CHAR_MAP: Record<string, string> = {
  Program: 'P',
  FunctionDeclaration: 'F',
  FunctionExpression: 'F',
  ArrowFunctionExpression: 'F',
  IfStatement: 'I',
  WhileStatement: 'L',
  DoWhileStatement: 'L',
  ForStatement: 'L',
  ForInStatement: 'L',
  ForOfStatement: 'L',
  SwitchStatement: 'S',
  SwitchCase: 'C',
  ReturnStatement: 'R',
  BreakStatement: 'B',
  ContinueStatement: 'O',
  VariableDeclaration: 'D',
  VariableDeclarator: 'd',
  ExpressionStatement: 'E',
  AssignmentExpression: 'A',
  BinaryExpression: 'X',
  LogicalExpression: 'X',
  CallExpression: 'c',
  MemberExpression: 'M',
  ObjectExpression: 'G',
  ArrayExpression: 'Y',
  Identifier: 'i',
  Literal: 'l',
};

/**
 * Counts total nodes recursively in an acorn AST
 */
export function countASTNodes(node: any): number {
  if (!node || typeof node !== 'object') return 0;
  let count = 1;
  for (const key in node) {
    if (Object.prototype.hasOwnProperty.call(node, key)) {
      const child = node[key];
      if (Array.isArray(child)) {
        for (const item of child) {
          count += countASTNodes(item);
        }
      } else if (child && typeof child === 'object') {
        count += countASTNodes(child);
      }
    }
  }
  return count;
}

/**
 * Serializes an acorn AST into a normalized character string representing the structure
 */
export function serializeAcornAST(node: any): string {
  if (!node || typeof node !== 'object') return '';
  let result = AST_CHAR_MAP[node.type] || 'z';
  
  // Recursively process properties in a fixed order to preserve structure representation
  const keysToVisit = ['body', 'consequent', 'alternate', 'arguments', 'left', 'right', 'init', 'test', 'update', 'declarations'];
  for (const key of keysToVisit) {
    const child = node[key];
    if (child) {
      if (Array.isArray(child)) {
        for (const item of child) {
          result += serializeAcornAST(item);
        }
      } else {
        result += serializeAcornAST(child);
      }
    }
  }
  return result;
}

/**
 * Generate structural fingerprint for non-JS languages (Python, Java, C++, etc.)
 */
export function serializeRegexStructure(code: string, language: string): string {
  // Strip comments
  let cleaned = code;
  if (language === 'PYTHON') {
    cleaned = code.replace(/#.*$/gm, '');
  } else {
    cleaned = code.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
  }

  // Tokenize structure
  const tokens: string[] = [];
  const lines = cleaned.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Detect function definitions
    if (
      trimmed.startsWith('def ') ||
      trimmed.match(/function\s+\w+/) ||
      trimmed.match(/(?:public|private|protected|static)\s+\w+\s+\w+\s*\(/) ||
      trimmed.match(/^(?:int|void|double|float|char|bool)\s+\w+\s*\(/)
    ) {
      tokens.push('F');
    }
    
    // Detect conditionals
    if (trimmed.match(/\b(if|elif|else if)\b/)) {
      tokens.push('I');
    } else if (trimmed.match(/\b(else)\b/)) {
      tokens.push('i');
    }

    // Detect loops
    if (trimmed.match(/\b(for|while)\b/)) {
      tokens.push('L');
    }

    // Detect returns
    if (trimmed.match(/\breturn\b/)) {
      tokens.push('R');
    }

    // Detect assignments
    if (trimmed.includes('=')) {
      tokens.push('A');
    }

    // Detect calls
    if (trimmed.match(/\w+\s*\([\s\S]*?\)/)) {
      tokens.push('c');
    }
  }

  return tokens.join('');
}

/**
 * Compute the Levenshtein distance between two strings
 */
export function computeLevenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) {
    const row = dp[i];
    if (row) row[0] = i;
  }
  const firstRow = dp[0];
  if (firstRow) {
    for (let j = 0; j <= n; j++) {
      firstRow[j] = j;
    }
  }

  for (let i = 1; i <= m; i++) {
    const row = dp[i];
    const prevRow = dp[i - 1];
    if (!row || !prevRow) continue;
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        row[j] = prevRow[j - 1] ?? 0;
      } else {
        row[j] = Math.min(
          (prevRow[j] ?? 0) + 1,    // Deletion
          (row[j - 1] ?? 0) + 1,    // Insertion
          (prevRow[j - 1] ?? 0) + 1 // Substitution
        );
      }
    }
  }
  return dp[m]?.[n] ?? 0;
}

/**
 * Calculates similarity (0.0 to 1.0) and structural node count
 */
export function checkSimilarity(
  code1: string,
  code2: string,
  language: string,
): { similarity: number; nodeCount: number; isSubstantial: boolean } {
  const langUpper = language.toUpperCase();
  
  if (langUpper === 'JAVASCRIPT' || langUpper === 'TYPESCRIPT') {
    try {
      const ast1 = acorn.parse(code1, { ecmaVersion: 'latest', sourceType: 'module' });
      const ast2 = acorn.parse(code2, { ecmaVersion: 'latest', sourceType: 'module' });

      const count1 = countASTNodes(ast1);
      const count2 = countASTNodes(ast2);

      const seq1 = serializeAcornAST(ast1);
      const seq2 = serializeAcornAST(ast2);

      const distance = computeLevenshteinDistance(seq1, seq2);
      const maxLength = Math.max(seq1.length, seq2.length);
      const similarity = maxLength === 0 ? 1.0 : 1.0 - distance / maxLength;

      return {
        similarity,
        nodeCount: Math.max(count1, count2),
        isSubstantial: Math.max(count1, count2) >= 50,
      };
    } catch {
      // Fallback if parsing fails
    }
  }

  // Fallback / Non-JS tokenization similarity
  const seq1 = serializeRegexStructure(code1, langUpper);
  const seq2 = serializeRegexStructure(code2, langUpper);

  const distance = computeLevenshteinDistance(seq1, seq2);
  const maxLength = Math.max(seq1.length, seq2.length);
  const similarity = maxLength === 0 ? 1.0 : 1.0 - distance / maxLength;

  // Approximate node count for non-JS structure using code character length / 10
  const approximateNodeCount = Math.max(code1.length, code2.length) / 10;

  return {
    similarity,
    nodeCount: approximateNodeCount,
    isSubstantial: approximateNodeCount >= 50 || seq1.length >= 8,
  };
}
