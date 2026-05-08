export async function calculateHash(data: Uint8Array): Promise<string> {
  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(data);
  return hasher.digest("hex");
}

export async function validateIntegrity(data: Uint8Array, expectedHash: string): Promise<boolean> {
  const actualHash = await calculateHash(data);
  return actualHash === expectedHash;
}
