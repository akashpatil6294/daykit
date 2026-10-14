/// <reference lib="webworker" />
import { editPdf } from '../lib/convert/pdf-edits';
import type { PdfJob } from '../lib/pdf-protocol';
const scope = self as unknown as DedicatedWorkerGlobalScope;
scope.onmessage = async ({ data }: { data: PdfJob & { prepare?: boolean } }) => {
  if (data.prepare) {
    scope.postMessage({ ready: true });
    return;
  }
  try {
    scope.postMessage({ progress: 30 });
    scope.postMessage(await editPdf(data));
  } catch (e) {
    scope.postMessage({ error: e instanceof Error ? e.message : 'failed' });
  }
};
