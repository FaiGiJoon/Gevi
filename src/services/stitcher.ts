import { CardFragment } from '../types/card';
import { validateIntegrity } from '../utils/crypto';

export class Stitcher {
  /**
   * Validates and concatenates raw card files into a single binary payload.
   */
  async stitch(fragments: CardFragment[]): Promise<Uint8Array> {
    // Sort fragments by index to ensure deterministic sequencing
    const sortedFragments = [...fragments].sort((a, b) => a.index - b.index);

    const buffers: Uint8Array[] = [];
    let totalLength = 0;

    for (const fragment of sortedFragments) {
      const file = Bun.file(fragment.filePath);
      const arrayBuffer = await file.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);

      // Cryptographic Validation
      const isValid = await validateIntegrity(data, fragment.hash);
      if (!isValid) {
        throw new Error(`Integrity check failed for card ${fragment.cardId}`);
      }

      buffers.push(data);
      totalLength += data.length;
    }

    // Concatenate all buffers
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const buffer of buffers) {
      result.set(buffer, offset);
      offset += buffer.length;
    }

    return result;
  }
}
