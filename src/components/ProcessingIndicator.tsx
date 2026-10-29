import { LoaderCircle } from 'lucide-react';

type Props = { label: string; detail?: string; state?: 'working' | 'success' | 'error' };

/** Shared status pattern: meaningful stage labels, never guessed percentages. */
export function ProcessingIndicator({ label, detail, state = 'working' }: Props) {
  return <div className={'processing processing--' + state} role="status" aria-live="polite">
    {state === 'working' ? <LoaderCircle size={17} aria-hidden="true" className="spin" /> : <span className="processing-dot" aria-hidden="true" />}
    <span><strong>{label}</strong>{detail ? <small>{detail}</small> : null}</span>
  </div>;
}
