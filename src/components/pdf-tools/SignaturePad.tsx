import { useRef } from 'react';
import { pdfText as t } from '../../i18n/pdf-tools';
export default function SignaturePad({
  onChange,
  disabled,
}: {
  onChange: (blob: Blob | undefined) => void;
  disabled: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  function point(e: React.PointerEvent<HTMLCanvasElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    return [((e.clientX - r.left) * 500) / r.width, ((e.clientY - r.top) * 160) / r.height];
  }
  return (
    <fieldset disabled={disabled}>
      <legend>{t.draw}</legend>
      <p>{t.drawHelp}</p>
      <canvas
        ref={canvas}
        width={500}
        height={160}
        aria-label={t.draw}
        style={{
          width: '100%',
          maxWidth: 500,
          border: '1px solid #66745d',
          background: 'white',
          touchAction: 'none',
        }}
        onPointerDown={(e) => {
          if (disabled) return;
          drawing.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          const ctx = e.currentTarget.getContext('2d')!;
          ctx.beginPath();
          ctx.lineWidth = 2.5;
          ctx.lineCap = 'round';
          const [x, y] = point(e);
          ctx.moveTo(x, y);
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          const [x, y] = point(e);
          const ctx = e.currentTarget.getContext('2d')!;
          ctx.lineTo(x, y);
          ctx.stroke();
        }}
        onPointerUp={(e) => {
          drawing.current = false;
          e.currentTarget.toBlob((blob) => onChange(blob || undefined), 'image/png');
        }}
        onPointerCancel={() => {
          drawing.current = false;
        }}
      />
      <button
        type="button"
        onClick={() => {
          canvas.current?.getContext('2d')?.clearRect(0, 0, 500, 160);
          onChange(undefined);
        }}
      >
        {t.clearDrawing}
      </button>
    </fieldset>
  );
}
