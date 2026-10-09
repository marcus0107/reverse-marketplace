export function Loading({ text = 'Loading…' }) {
  return <div className="loading" role="status"><span className="spinner" /> {text}</div>;
}

export function ErrorBox({ message, onRetry }) {
  return (
    <div className="notice error-box">
      <b>Something went wrong.</b>
      <p>{message}</p>
      {onRetry && <button className="btn btn-primary" onClick={onRetry}>Try again</button>}
    </div>
  );
}

export function Empty({ title, children }) {
  return <div className="empty"><h3>{title}</h3><div>{children}</div></div>;
}
