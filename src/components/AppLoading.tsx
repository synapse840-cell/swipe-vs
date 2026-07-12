interface AppLoadingProps {
  message?: string;
  onRetry?: () => void;
}

export function AppLoading({ message = '読み込み中...', onRetry }: AppLoadingProps) {
  return (
    <div className="app-loading">
      {!onRetry && <div className="app-loading__spinner" aria-hidden />}
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="app-loading__retry" onClick={onRetry}>
          再試行
        </button>
      )}
    </div>
  );
}
