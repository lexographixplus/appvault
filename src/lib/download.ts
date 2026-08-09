/**
 * Triggers a browser download for an in-memory blob.
 *
 * The anchor is attached to the document (Firefox ignores clicks on detached
 * nodes) and the object URL is revoked on the next tick — revoking it in the
 * same task can cancel the download that was just started.
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 0);
}
