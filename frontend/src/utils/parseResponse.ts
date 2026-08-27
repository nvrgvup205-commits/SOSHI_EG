export function explainNonJson(status: number, body: string): string {
  const snippet = body.replace(/\s+/g, ' ').trim().slice(0, 180);
  if (/^404 Not Found/i.test(snippet) || status === 404) {
    return `API route not found (${status}). The backend worker needs a fresh deploy.`;
  }
  if (!snippet) return `Empty response (${status})`;
  return `Server returned non-JSON (${status}): ${snippet}`;
}

export async function parseApiResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  const trimmed = text.trim();
  let data: unknown = null;
  if (trimmed) {
    try {
      data = JSON.parse(trimmed) as unknown;
    } catch (err) {
      if (err instanceof SyntaxError) {
        throw new Error(explainNonJson(res.status, trimmed));
      }
      throw err;
    }
  }
  if (!res.ok) {
    const message =
      data && typeof data === 'object' && 'error' in data && typeof (data as { error: unknown }).error === 'string'
        ? (data as { error: string }).error
        : explainNonJson(res.status, trimmed);
    throw new Error(message);
  }
  return data as T;
}
