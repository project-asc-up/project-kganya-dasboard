export const AUTH_SESSION_COOKIE = "asc_admin_session";
export const AUTH_SESSION_TTL_MS = 1000 * 60 * 60 * 8;

type AuthSessionPayload = {
  username: string;
  expiresAt: number;
};

type TokenOptions = {
  secret: string;
  now?: number;
};

const encoder = new TextEncoder();

function base64UrlEncode(value: string | Uint8Array) {
  const bytes = typeof value === "string" ? encoder.encode(value) : value;
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new TextDecoder().decode(bytes);
}

async function getSigningKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function sign(value: string, secret: string) {
  const key = await getSigningKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return base64UrlEncode(new Uint8Array(signature));
}

export function getAuthSessionSecret() {
  return process.env.BETTER_AUTH_SECRET || process.env.ADMIN_PASSWORD || process.env.USER_LOGIN_PASSWORD || "";
}

export async function createAuthSessionToken({
  username,
  secret,
  now = Date.now(),
}: {
  username: string;
} & TokenOptions) {
  const payload = base64UrlEncode(
    JSON.stringify({
      username,
      expiresAt: now + AUTH_SESSION_TTL_MS,
    } satisfies AuthSessionPayload),
  );
  const signature = await sign(payload, secret);

  return `${payload}.${signature}`;
}

export async function verifyAuthSessionToken(token: string | undefined, {
  secret,
  now = Date.now(),
}: TokenOptions) {
  if (!token || !secret) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expectedSignature = await sign(payload, secret);
  if (signature !== expectedSignature) return null;

  try {
    const session = JSON.parse(base64UrlDecode(payload)) as AuthSessionPayload;

    if (!session.username || session.expiresAt <= now) return null;

    return session;
  } catch {
    return null;
  }
}
