import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="pt-40 pb-40 min-h-screen flex items-center justify-center px-6">
          <div className="max-w-sm w-full bg-white rounded-[28px] border border-red-100 shadow-sm p-10 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="font-display italic text-2xl text-[var(--verde-profundo)] mb-2">Algo salió mal</h2>
            <p className="font-ui text-sm text-[var(--texto-suave)] mb-6">
              Esta sección no pudo cargar. Recarga la página para continuar.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[var(--verde-main)] text-white font-ui font-bold py-3 px-6 rounded-[14px] hover:bg-[var(--verde-vivo)] transition-all"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
