import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { AlertOctagon, RefreshCw } from 'lucide-react'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled runtime error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg text-text flex items-center justify-center p-6 font-sans">
          <Card className="max-w-md w-full p-8 border border-border text-center flex flex-col items-center gap-4 animate-fadeIn">
            <div className="p-4 bg-red-500/10 text-red-500 rounded-full border border-red-500/20">
              <AlertOctagon className="w-10 h-10" />
            </div>

            <div>
              <h1 className="text-xl font-serif font-bold text-text">Something Went Wrong</h1>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                An unexpected application error occurred. Please try reloading the page.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-surface/80 rounded-xl border border-border/50 text-[11px] font-mono text-red-400 w-full text-left overflow-x-auto">
                {this.state.error.toString()}
              </div>
            )}

            <Button
              onClick={() => window.location.reload()}
              className="text-xs py-2 px-4 flex items-center gap-2 cursor-pointer w-full justify-center mt-2"
            >
              <RefreshCw className="w-4 h-4" /> Reload Application
            </Button>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
