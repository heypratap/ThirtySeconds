import pdfParse from 'pdf-parse';

/**
 * Extracts plain text from a PDF Buffer
 * @param {Buffer} buffer
 * @returns {Promise<string>} Clean extracted text
 */
export async function extractTextFromPdf(buffer) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error('Valid PDF buffer is required');
  }

  try {
    const data = await pdfParse(buffer);
    // Sanitize and trim extracted text
    return data.text ? data.text.replace(/\r\n/g, '\n').trim() : '';
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF document. Ensure the file is not password-protected or corrupted.');
  }
}
