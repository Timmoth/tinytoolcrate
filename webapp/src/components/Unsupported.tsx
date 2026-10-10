/** Shown instead of a tool when the browser lacks something it needs. */
function Unsupported({ feature, available }: { feature: string; available: string }) {
  return (
    <div
      data-testid="unsupported"
      className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-3"
    >
      <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
        This tool needs {feature}
      </p>
      <p className="mt-1 text-xs text-amber-700/80 dark:text-amber-300/80">
        Your browser does not support it. {available}
      </p>
    </div>
  )
}

export default Unsupported
