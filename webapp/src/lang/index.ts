import * as grammars from './grammars'
import { Tokenizer } from './grammars'
import { Token } from './types'

export type LanguageId =
  | 'plain'
  | 'json'
  | 'yaml'
  | 'xml'
  | 'html'
  | 'markdown'
  | 'javascript'
  | 'typescript'
  | 'css'
  | 'python'
  | 'sql'
  | 'shell'
  | 'java'
  | 'csharp'
  | 'go'
  | 'rust'
  | 'cpp'
  | 'php'

export type Language = {
  id: LanguageId
  tokenize: Tokenizer
  /** Prefix the editor uses to toggle comments. */
  lineComment?: string
}

export const LANGUAGES: Language[] = [
  { id: 'plain', tokenize: grammars.plainTokenizer },
  { id: 'json', tokenize: grammars.jsonTokenizer },
  { id: 'yaml', tokenize: grammars.yamlTokenizer, lineComment: '#' },
  { id: 'xml', tokenize: grammars.markupTokenizer },
  { id: 'html', tokenize: grammars.markupTokenizer },
  { id: 'markdown', tokenize: grammars.markdownTokenizer },
  { id: 'javascript', tokenize: grammars.javascriptTokenizer, lineComment: '//' },
  { id: 'typescript', tokenize: grammars.typescriptTokenizer, lineComment: '//' },
  { id: 'css', tokenize: grammars.cssTokenizer },
  { id: 'python', tokenize: grammars.pythonTokenizer, lineComment: '#' },
  { id: 'sql', tokenize: grammars.sqlTokenizer, lineComment: '--' },
  { id: 'shell', tokenize: grammars.shellTokenizer, lineComment: '#' },
  { id: 'java', tokenize: grammars.javaTokenizer, lineComment: '//' },
  { id: 'csharp', tokenize: grammars.csharpTokenizer, lineComment: '//' },
  { id: 'go', tokenize: grammars.goTokenizer, lineComment: '//' },
  { id: 'rust', tokenize: grammars.rustTokenizer, lineComment: '//' },
  { id: 'cpp', tokenize: grammars.cppTokenizer, lineComment: '//' },
  { id: 'php', tokenize: grammars.phpTokenizer, lineComment: '//' },
]

const BY_ID = new Map(LANGUAGES.map((language) => [language.id, language]))

export function languageById(id: string): Language {
  return BY_ID.get(id as LanguageId) ?? LANGUAGES[0]
}

/** Highlighting is skipped past this size to keep typing responsive. */
const HIGHLIGHT_LIMIT = 120_000

export function tokensFor(id: string, code: string): Token[] {
  if (code.length > HIGHLIGHT_LIMIT) {
    return code ? [{ kind: 'plain', text: code, start: 0 }] : []
  }
  return languageById(id).tokenize(code)
}

export * from './types'
