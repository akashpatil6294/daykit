import { useId, useRef, useState } from 'react';
import { imageTools as t } from '../../i18n/image-tools';
import type { InputKind } from '../../data/tools';
export function Uploader({
  accept,
  kind,
  disabled,
  onFile,
  onError,
  multiple = false,
  onFiles,
  label,
  help,
  acceptedLabel,
}: {
  accept: string;
  kind: InputKind;
  disabled: boolean;
  onFile: (file: File) => void;
  onError: (message: string) => void;
  multiple?: boolean;
  onFiles?: (files: File[]) => void;
  label?: string;
  help?: string;
  acceptedLabel?: string;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const choose = (files: FileList | null) => {
    if (!files?.length) return;
    if (onFiles) return onFiles(Array.from(files));
    if (files.length !== 1) return onError(t.errors.multiple);
    onFile(files[0]);
  };
  return (
    <div
      className={`image-upload ${over ? 'is-over' : ''}`}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setOver(false);
        if (!disabled) choose(event.dataTransfer.files);
      }}
    >
      <span className="upload-symbol" aria-hidden="true">
        ↥
      </span>
      <label htmlFor={id}>{label || t.drop}</label>
      <p id={`${id}-help`}>
        {help || t.uploadHelp}
        <br />
        {t.accepted}: {acceptedLabel || t.inputTypes[kind]}
      </p>
      <input
        ref={input}
        id={id}
        type="file"
        multiple={multiple}
        accept={accept}
        disabled={disabled}
        aria-describedby={`${id}-help`}
        onChange={(event) => {
          choose(event.target.files);
          event.target.value = '';
        }}
      />
    </div>
  );
}
export function Preview({
  url,
  label,
  alt,
  children,
}: {
  url?: string;
  label: string;
  alt: string;
  children?: React.ReactNode;
}) {
  return (
    <figure className="image-preview">
      <figcaption>{label}</figcaption>
      <div className="preview-box">{url ? <img src={url} alt={alt} /> : <p>{t.empty}</p>}</div>
      {children}
    </figure>
  );
}
export function DownloadButton({ url, filename, label = t.download }: { url: string; filename: string; label?: string }) {
  return (
    <a className="button primary" href={url} download={filename}>
      {label}
      <span aria-hidden="true">↓</span>
    </a>
  );
}
export function ErrorState({ message }: { message: string }) {
  return message ? (
    <p role="alert" className="image-error">
      {message}
    </p>
  ) : null;
}
