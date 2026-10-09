export async function api(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch('/api' + path, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined
    });
  } catch {
    const err = new Error('We could not reach the server. Check your internet connection and try again.');
    err.status = 0;
    throw err;
  }
  let data = {};
  try { data = await res.json(); } catch { /* empty body */ }
  if (!res.ok) {
    const err = new Error(data.error || 'Something went wrong');
    err.status = res.status;
    throw err;
  }
  return data;
}

export const money = n => 'KSh ' + Number(n || 0).toLocaleString('en-KE');
export const CATEGORIES = ['Products', 'Services', 'Custom Work', 'Business'];
export const TOKEN_KEY = 'reverse_last_token';
