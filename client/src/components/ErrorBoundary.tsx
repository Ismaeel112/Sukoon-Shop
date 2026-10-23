import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean };

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="error-boundary" role="alert">
          <AlertTriangle size={42} aria-hidden="true" />
          <p className="eyebrow">A quiet interruption</p>
          <h1>Something needs<br />a moment.</h1>
          <p>Please refresh the page. If the problem continues, contact us at hello@sukoon.studio.</p>
          <button className="button button-dark" onClick={() => window.location.reload()}>
            Refresh the page <RotateCcw size={16} />
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
