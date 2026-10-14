import { useEffect, useRef, useState } from 'react';
import { translations } from '../i18n';
import { localPath } from '../i18n/runtime';
const key = 'daykit:consent:v1';
const maxAge = 180 * 24 * 60 * 60 * 1000;
export default function CookieConsent() {
  const t = translations();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const [reopened, setReopened] = useState(false);
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(key) || 'null');
      const age = Date.now() - stored?.timestamp;
      setOpen(
        !(
          stored?.version === 1 &&
          typeof stored.optional === 'boolean' &&
          age >= 0 &&
          age < maxAge
        ),
      );
    } catch {
      setOpen(true);
    }
    const reopen = () => {
      trigger.current = document.activeElement as HTMLElement;
      setReopened(true);
      setOpen(true);
      setMessage('');
    };
    window.addEventListener('daykit:privacy', reopen);
    return () => window.removeEventListener('daykit:privacy', reopen);
  }, []);
  useEffect(() => {
    if (open && reopened) heading.current?.focus();
  }, [open, reopened]);
  function save(optional: boolean) {
    try {
      localStorage.setItem(key, JSON.stringify({ version: 1, optional, timestamp: Date.now() }));
      setMessage(t.consent.saved);
    } catch {
      setMessage(t.consent.failed);
    }
    setOpen(false);
    trigger.current?.focus();
  }
  return (
    <>
      <span className="sr-only" role="status">
        {message}
      </span>
      {open && (
        <section className="consent" aria-labelledby="consent-title">
          <div>
            <h2 ref={heading} tabIndex={-1} id="consent-title">
              {t.consent.title}
            </h2>
            <p>
              {t.consent.body} <a href={localPath('/privacy/')}>{t.consent.policy}</a>
            </p>
          </div>
          <div className="consent-actions">
            <button className="button secondary" onClick={() => save(false)}>
              {t.consent.necessary}
            </button>
            <button className="button primary" onClick={() => save(true)}>
              {t.consent.allow}
            </button>
          </div>
        </section>
      )}
    </>
  );
}
