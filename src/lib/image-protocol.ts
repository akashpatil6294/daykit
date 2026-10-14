import type { InputKind, ToolMode } from '../data/tools';
export interface ImageSettings {
  mode: ToolMode | 'exam';
  width: number;
  height: number;
  targetKB: number;
  quality: number;
  zoom: number;
  x: number;
  y: number;
  format?: 'jpeg' | 'png';
  minKB?: number;
  fit?: 'crop' | 'contain';
}
export type WorkerRequest =
  | { type: 'init'; heic: boolean }
  | { type: 'load'; file: File; kind: InputKind }
  | { type: 'process'; settings: ImageSettings };
export type WorkerReply =
  | { type: 'ready' }
  | { type: 'loaded'; width: number; height: number; preview: Blob }
  | { type: 'result'; blob: Blob; width: number; height: number; padding: number }
  | { type: 'progress'; value: number }
  | { type: 'error'; code: string };
