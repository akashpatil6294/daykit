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
  | { type: 'cancel'; jobId?: number }
  | { type: 'load'; jobId: number; file: File; kind: InputKind }
  | { type: 'process'; jobId: number; settings: ImageSettings };
export type WorkerReply =
  | { type: 'ready' }
  | { type: 'init-error'; code: string }
  | { type: 'loaded'; jobId: number; width: number; height: number; preview: Blob }
  | { type: 'result'; jobId: number; blob: Blob; width: number; height: number; padding: number }
  | { type: 'progress'; jobId: number; value: number }
  | { type: 'error'; jobId: number; code: string };
