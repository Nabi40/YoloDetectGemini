// Small helper to parse fetch responses safely and provide clearer errors
export async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';

  // Read the full body as text first so we can produce helpful error messages
  const text = await response.text();

  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(text);
    } catch (err) {
      throw new Error(`Invalid JSON response (status ${response.status} ${response.statusText}): ${err.message} — body: ${text.slice(0, 400)}`);
    }
  }

  // Not JSON — likely an HTML error page (e.g. DOCTYPE...). Return a clear error that includes status.
  const snippet = text ? text.slice(0, 600) : '<empty response body>';
  throw new Error(`Expected JSON response but received ${contentType || 'unknown'} (status ${response.status} ${response.statusText}): ${snippet}`);
}

const api = { parseResponse };
export default api;
