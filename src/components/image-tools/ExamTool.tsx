import { useState } from 'react';
import ImageTool from './ImageTool';
import { examText as t } from '../../i18n/exams';
import type { Exam } from '../../lib/exam-data';
export default function ExamTool({ exam }: { exam: Exam }) {
  const [kind, setKind] = useState<'photo' | 'signature'>('photo');
  const spec = kind === 'photo' ? exam.photo_spec : exam.signature_spec;
  return (
    <section aria-label={t.editorTitle}>
      <div className="exam-toggle" role="group" aria-label={t.editorTitle}>
        {(['photo', 'signature'] as const).map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={kind === item}
            className={`button ${kind === item ? 'primary' : 'secondary'}`}
            onClick={() => setKind(item)}
          >
            {t[item]}
          </button>
        ))}
      </div>
      <ImageTool key={`${exam.slug}-${kind}`} mode="passport" exam={{ ...spec, kind }} />
    </section>
  );
}
