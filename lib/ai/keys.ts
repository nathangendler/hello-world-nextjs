// Keys pasted into a dashboard often arrive wrapped in quotes or with stray
// whitespace; anything outside printable ASCII would also crash fetch's header encoding.
export function readApiKey(envName: string): string | null {
  const raw = process.env[envName];
  if (!raw) {
    return null;
  }
  const key = raw.trim().replace(/^["'“”]+|["'“”]+$/g, "");
  return /^[\x21-\x7e]{20,200}$/.test(key) ? key : null;
}

export function describeMissingKey(envName: string): string {
  return process.env[envName]
    ? `${envName} is malformed. It must be just the key, with no quotes, spaces, or extra text.`
    : `Caption generation is not configured yet (missing ${envName}).`;
}
