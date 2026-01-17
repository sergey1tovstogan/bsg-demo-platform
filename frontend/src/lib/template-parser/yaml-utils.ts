/**
 * YAML Parsing Utilities
 * Handles MD frontmatter extraction and YAML parsing with robust error handling
 */

import matter from 'gray-matter';

/**
 * Parse error type
 */
export type ParseErrorType =
  | 'YAML_PARSE_ERROR'
  | 'MISSING_FRONTMATTER'
  | 'INVALID_FORMAT'
  | 'VALIDATION_ERROR';

/**
 * Parse error interface
 */
export interface ParseError {
  type: ParseErrorType;
  message: string;
  line?: number;
  column?: number;
  details?: string;
}

/**
 * Parse result interface
 */
export interface ParseResult {
  data: any;
  content: string;
  errors: ParseError[];
}

/**
 * Create a parse error with helpful context
 */
function createParseError(
  error: unknown,
  type: ParseErrorType = 'YAML_PARSE_ERROR'
): ParseError {
  const err = error as Error;

  return {
    type,
    message: err.message || 'Unknown parsing error',
    details: err.stack,
  };
}

/**
 * Parse markdown file with YAML frontmatter
 *
 * @param content - Raw markdown file content
 * @returns ParseResult with data, content, and any errors
 *
 * @example
 * ```typescript
 * const result = parseMarkdownFile(fileContent);
 * if (result.errors.length === 0) {
 *   console.log(result.data.card.id);
 * }
 * ```
 */
export function parseMarkdownFile(content: string): ParseResult {
  // Handle empty content
  if (!content || content.trim() === '') {
    return {
      data: {},
      content: '',
      errors: [],
    };
  }

  try {
    // Use gray-matter to parse frontmatter
    const { data, content: markdown } = matter(content, {
      // Explicitly handle errors
      // @ts-ignore - gray-matter types are incomplete
      excerpt: false,
    });

    // Return successful parse
    return {
      data,
      content: markdown,
      errors: [],
    };
  } catch (error) {
    // Handle parsing errors gracefully
    const parseError = createParseError(error, 'YAML_PARSE_ERROR');

    // Try to extract any partial data if possible
    let partialData = {};
    let partialContent = content;

    // Check if content has frontmatter delimiters
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/;
    const match = content.match(frontmatterRegex);

    if (!match) {
      // No frontmatter found - return content as-is
      return {
        data: {},
        content: content,
        errors: [],
      };
    }

    // Frontmatter exists but failed to parse
    partialContent = match[2] || '';

    return {
      data: partialData,
      content: partialContent,
      errors: [parseError],
    };
  }
}

/**
 * Validate required fields in parsed data
 *
 * @param data - Parsed YAML data
 * @param requiredFields - Array of required field paths (e.g., ['card.id', 'card.name'])
 * @returns Array of validation errors
 *
 * @example
 * ```typescript
 * const errors = validateRequiredFields(data, ['card.id', 'card.name']);
 * if (errors.length > 0) {
 *   console.error('Missing required fields:', errors);
 * }
 * ```
 */
export function validateRequiredFields(
  data: any,
  requiredFields: string[]
): ParseError[] {
  const errors: ParseError[] = [];

  for (const fieldPath of requiredFields) {
    const parts = fieldPath.split('.');
    let current = data;
    let found = true;

    for (const part of parts) {
      if (current === null || current === undefined || !(part in current)) {
        found = false;
        break;
      }
      current = current[part];
    }

    if (!found || current === null || current === undefined) {
      errors.push({
        type: 'VALIDATION_ERROR',
        message: `Required field "${fieldPath}" is missing or null`,
        details: `Please ensure ${fieldPath} is defined in the frontmatter`,
      });
    }
  }

  return errors;
}

/**
 * Validate field type
 *
 * @param data - Parsed data
 * @param fieldPath - Field path (e.g., 'card.id')
 * @param expectedType - Expected type ('string', 'number', 'boolean', 'array', 'object')
 * @returns Validation error if type doesn't match, null otherwise
 */
export function validateFieldType(
  data: any,
  fieldPath: string,
  expectedType: string
): ParseError | null {
  const parts = fieldPath.split('.');
  let current = data;

  for (const part of parts) {
    if (current === null || current === undefined || !(part in current)) {
      return null; // Field doesn't exist - not a type error
    }
    current = current[part];
  }

  const actualType = Array.isArray(current) ? 'array' : typeof current;

  if (actualType !== expectedType) {
    return {
      type: 'VALIDATION_ERROR',
      message: `Field "${fieldPath}" has incorrect type. Expected ${expectedType}, got ${actualType}`,
      details: `Value: ${JSON.stringify(current)}`,
    };
  }

  return null;
}

/**
 * Get nested field value safely
 *
 * @param data - Data object
 * @param fieldPath - Field path (e.g., 'card.metadata.author')
 * @param defaultValue - Default value if field doesn't exist
 * @returns Field value or default
 */
export function getNestedField(
  data: any,
  fieldPath: string,
  defaultValue?: any
): any {
  const parts = fieldPath.split('.');
  let current = data;

  for (const part of parts) {
    if (current === null || current === undefined || !(part in current)) {
      return defaultValue;
    }
    current = current[part];
  }

  return current !== undefined ? current : defaultValue;
}
