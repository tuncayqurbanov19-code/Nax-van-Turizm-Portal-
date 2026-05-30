import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'naxcivan_jwt_secret_gateway_key_2025';

export interface TokenPayload {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

/**
 * Signs a standard JWT with HMAC-SHA256
 */
export function signToken(payload: TokenPayload): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');

  const hmac = crypto.createHmac('sha256', JWT_SECRET);
  hmac.update(`${encodedHeader}.${encodedPayload}`);
  const signature = hmac.digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verifies and decodes a signed JWT
 */
export function verifyToken(token: string): TokenPayload | null {
  if (!token) return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;

    // Verify signature
    const hmac = crypto.createHmac('sha256', JWT_SECRET);
    hmac.update(`${header}.${payload}`);
    const expectedSignature = hmac.digest('base64url');

    if (signature !== expectedSignature) {
      return null;
    }

    // Decode payload
    const decodedPayloadStr = Buffer.from(payload, 'base64url').toString('utf8');
    return JSON.parse(decodedPayloadStr) as TokenPayload;
  } catch (err) {
    return null;
  }
}
