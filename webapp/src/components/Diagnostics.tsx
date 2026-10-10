import { Validation } from '../lang/types'

export function DiagnosticsSummary({
  result,
  hasContent,
}: {
  result: Validation
  hasContent: boolean
}) {
  if (!hasContent) {
    return <span className="text-faint">Nothing to check yet</span>
  }

  const errors = result.diagnostics.filter((d) => d.severity === 'error').length
  const warnings = result.diagnostics.length - errors

  if (errors > 0) {
    return (
      <span className="text-red-600 dark:text-red-400 font-medium">
        {errors} error{errors === 1 ? '' : 's'}
        {warnings > 0 && `, ${warnings} warning${warnings === 1 ? '' : 's'}`}
      </span>
    )
  }
  if (warnings > 0) {
    return (
      <span className="text-amber-600 dark:text-amber-400 font-medium">
        {warnings} warning{warnings === 1 ? '' : 's'}
      </span>
    )
  }
  return (
    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
      {result.depth === 'parsed' ? 'Valid' : 'No problems found'}
    </span>
  )
}
