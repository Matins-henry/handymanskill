import * as pdfParseModule from 'pdf-parse';

// Create our own wrapper around pdf-parse to avoid the ENOENT error
// (pdf-parse tries to load test files on import)
export async function parsePdf(dataBuffer: Buffer): Promise<{ text: string }> {
  try {
    // @ts-ignore - ignore type issues since we've defined our own interface
    return await pdfParseModule.default(dataBuffer);
  } catch (error) {
    console.error("Error in PDF parsing:", error);
    throw new Error("Failed to parse PDF file");
  }
}