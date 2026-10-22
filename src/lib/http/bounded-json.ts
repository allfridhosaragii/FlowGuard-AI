/**
 * Read JSON from a public API request without buffering an unbounded body.
 *
 * Content-Length is a hint, not a security boundary: every stream chunk is counted.
 * Rejecting oversized requests before JSON parsing keeps ignored/unknown properties
 * from consuming arbitrary memory even when the Zod schema is otherwise bounded.
 */
export class JsonBodyInputError extends Error {
  constructor(
    public readonly code: 'INPUT_TOO_LARGE' | 'INVALID_JSON',
    public readonly status: 400 | 413,
    message: string
  ) {
    super(message);
    this.name = 'JsonBodyInputError';
  }
}

export async function readBoundedJson(request: Request, maxBytes: number): Promise<unknown> {
  const hintedLength = request.headers.get('content-length');
  if (hintedLength !== null && /^\d+$/.test(hintedLength) && Number(hintedLength) > maxBytes) {
    throw new JsonBodyInputError('INPUT_TOO_LARGE', 413, 'JSON request body exceeds the allowed size');
  }

  if (!request.body) {
    throw new JsonBodyInputError('INVALID_JSON', 400, 'A valid JSON request body is required');
  }

  const reader = request.body.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let bytesRead = 0;
  let json = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      bytesRead += value.byteLength;
      if (bytesRead > maxBytes) {
        await reader.cancel().catch(() => {});
        throw new JsonBodyInputError('INPUT_TOO_LARGE', 413, 'JSON request body exceeds the allowed size');
      }

      json += decoder.decode(value, { stream: true });
    }

    json += decoder.decode();
  } catch (error) {
    if (error instanceof JsonBodyInputError) throw error;
    throw new JsonBodyInputError('INVALID_JSON', 400, 'A valid JSON request body is required');
  } finally {
    reader.releaseLock();
  }

  try {
    return JSON.parse(json) as unknown;
  } catch {
    throw new JsonBodyInputError('INVALID_JSON', 400, 'A valid JSON request body is required');
  }
}
