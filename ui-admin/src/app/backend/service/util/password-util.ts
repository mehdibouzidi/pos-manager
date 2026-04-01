/**
 * Hashes a password with SHA-256 before transmission to the backend.
 * The backend then applies BCrypt to the received hash, so the stored
 * credential is bcrypt(sha256(password)). This ensures the plaintext
 * password is never sent over the network.
 */
export async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
