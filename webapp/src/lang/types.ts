export type TokenKind =
  | 'plain'
  | 'comment'
  | 'string'
  | 'number'
  | 'keyword'
  | 'type'
  | 'function'
  | 'property'
  | 'operator'
  | 'punctuation'
  | 'tag'
  | 'attr'
  | 'regexp'

export type Token = {
  kind: TokenKind
  text: string
  /** Offset of the token within the source. */
  start: number
  /**
   * Set by scanners that can tell a literal was never closed, for cases the
   * text alone cannot reveal (a template literal's lone backtick delimiter).
   */
  unterminated?: boolean
}

export type Severity = 'error' | 'warning'

export type Diagnostic = {
  /** 1-based. */
  line: number
  /** 1-based. */
  column: number
  message: string
  severity: Severity
}

/**
 * How much a validator was actually able to prove.
 *
 * 'parsed'     - the source was fully parsed, so anything not reported is valid.
 * 'structural' - only brackets, strings and comments were checked, so a clean
 *                result means "nothing structurally broken", not "compiles".
 */
export type CheckDepth = 'parsed' | 'structural'

export type Validation = {
  diagnostics: Diagnostic[]
  depth: CheckDepth
}
