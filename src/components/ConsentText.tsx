import Link from 'next/link';
import { CONSENT_DISCLAIMER, CONSENT_INTRO, CONSENT_POINTS, CONSENT_WITHDRAW, PRIVACY_PATH } from '@/lib/consent';

/** Текст согласия — один и тот же в окне согласия и при гостевой консультации. */
export default function ConsentText({ compact = false }: { compact?: boolean }) {
  const size = compact ? '13px' : '14px';
  return (
    <div style={{ fontSize: size, lineHeight: 1.55, color: 'var(--s-text-secondary, var(--s-secondary))' }}>
      {!compact && <p style={{ marginBottom: 10 }}>{CONSENT_INTRO}</p>}
      <p style={{ marginBottom: 6 }}>Вы соглашаетесь:</p>
      <ul style={{ paddingLeft: 18, marginBottom: 10, listStyle: 'disc' }}>
        {CONSENT_POINTS.map((p) => <li key={p} style={{ marginBottom: 4 }}>{p}</li>)}
      </ul>
      {!compact && <p style={{ marginBottom: 10 }}>{CONSENT_WITHDRAW}</p>}
      <p>
        {CONSENT_DISCLAIMER}{' '}
        <Link href={PRIVACY_PATH} target="_blank" style={{ color: 'var(--s-primary, var(--s-blue))', fontWeight: 600 }}>
          Подробнее
        </Link>
      </p>
    </div>
  );
}
