import { Component, ErrorInfo, ReactNode } from 'react'

type Props = {
  /** Named in the message so a user can say which tool broke. */
  label: string
  children: ReactNode
}

type State = { error: Error | null }

/**
 * Wraps a single panel. Without this, one tool throwing during render unmounts
 * the whole app and takes every other open panel with it.
 *
 * React only routes render and lifecycle errors here — event handlers and
 * async work still need their own try/catch.
 */
class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`"${this.props.label}" failed to render`, error, info)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div
        data-testid="panel-error"
        className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-3"
      >
        <p className="text-sm font-medium text-red-700 dark:text-red-300">
          This tool hit an error
        </p>
        <p className="mt-1 text-xs text-red-700/80 dark:text-red-300/80 break-words">
          {error.message || String(error)}
        </p>
        <button
          type="button"
          onClick={() => this.setState({ error: null })}
          className="mt-2 rounded-md border border-red-500/40 px-2 py-1 text-xs text-red-700 dark:text-red-300 hover:bg-red-500/10 transition-colors"
        >
          Try again
        </button>
      </div>
    )
  }
}

export default ErrorBoundary
