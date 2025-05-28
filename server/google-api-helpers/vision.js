const { google } = require('googleapis');

// Google Vision API Helper Module
// Provides reusable functions for OCR and document text detection

/**
 * Initializes the Google Vision API client.
 * @param {google.auth.OAuth2} authClient - An authenticated OAuth2 client.
 * @returns {google.vision_v1.Vision} - Google Vision API client instance.
 */
function getVisionClient(authClient) {
  return google.vision({ version: 'v1', auth: authClient });
}

/**
 * Performs OCR text detection on an image.
 * @param {google.auth.OAuth2} authClient - An authenticated OAuth2 client.
 * @param {string} imageUrl - URL of the image to process (must be publicly accessible).
 * @returns {Promise<object>} - OCR results with extracted text and confidence.
 */
async function detectTextFromUrl(authClient, imageUrl) {
  const vision = getVisionClient(authClient);

  try {
    console.log('Processing OCR for image URL:', imageUrl);

    const request = {
      requests: [
        {
          image: {
            source: {
              imageUri: imageUrl,
            },
          },
          features: [
            {
              type: 'TEXT_DETECTION',
              maxResults: 1,
            },
            {
              type: 'DOCUMENT_TEXT_DETECTION',
              maxResults: 1,
            },
          ],
        },
      ],
    };

    const response = await vision.images.annotate(request);
    const annotations = response.data.responses[0];

    if (annotations.error) {
      throw new Error(`Vision API error: ${annotations.error.message}`);
    }

    // Extract full text
    const fullTextAnnotation = annotations.fullTextAnnotation;
    const textAnnotations = annotations.textAnnotations;

    let extractedText = '';
    let confidence = 0;

    if (fullTextAnnotation) {
      extractedText = fullTextAnnotation.text;
      // Calculate average confidence from all detected text
      const confidenceValues = fullTextAnnotation.pages
        .flatMap(page => page.blocks)
        .flatMap(block => block.paragraphs)
        .flatMap(paragraph => paragraph.words)
        .map(word => word.confidence)
        .filter(conf => conf !== undefined);

      if (confidenceValues.length > 0) {
        confidence =
          confidenceValues.reduce((sum, conf) => sum + conf, 0) / confidenceValues.length;
      }
    } else if (textAnnotations && textAnnotations.length > 0) {
      extractedText = textAnnotations[0].description;
      confidence = 0.8; // Default confidence when detailed confidence not available
    }

    console.log('OCR processing completed. Text length:', extractedText.length);

    return {
      text: extractedText,
      confidence: confidence,
      rawResponse: annotations,
    };
  } catch (error) {
    console.error('Error in Vision API text detection:', error);
    throw error;
  }
}

/**
 * Processes receipt image and extracts structured data.
 * @param {google.auth.OAuth2} authClient - An authenticated OAuth2 client.
 * @param {string} imageUrl - URL of the receipt image.
 * @returns {Promise<object>} - Structured receipt data.
 */
async function processReceiptOCR(authClient, imageUrl) {
  try {
    const ocrResult = await detectTextFromUrl(authClient, imageUrl);

    // Extract structured data from the OCR text
    const extractedData = extractReceiptData(ocrResult.text);

    return {
      text: ocrResult.text,
      confidence: ocrResult.confidence,
      extracted_data: extractedData,
      raw_response: ocrResult.rawResponse,
    };
  } catch (error) {
    console.error('Error processing receipt OCR:', error);
    return {
      text: '',
      confidence: 0,
      extracted_data: null,
      error: error.message,
    };
  }
}

/**
 * Extracts structured data from receipt text using pattern matching.
 * @param {string} text - Raw OCR text from receipt.
 * @returns {object} - Structured receipt data.
 */
function extractReceiptData(text) {
  if (!text) return null;

  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  const extractedData = {
    merchant: null,
    total: null,
    tax: null,
    subtotal: null,
    date: null,
    items: [],
  };

  // Common merchant patterns
  const merchantPatterns = [
    /^(HOME DEPOT|LOWES|MENARDS|ACE HARDWARE|WALMART|TARGET)/i,
    /^([A-Z\s&]+(?:HARDWARE|DEPOT|SUPPLY|LUMBER|BUILDING))/i,
    /^([A-Z\s&]{3,20})\s*$/i, // Generic pattern for business names
  ];

  // Amount patterns
  const totalPatterns = [
    /(?:TOTAL|AMOUNT DUE|BALANCE)\s*:?\s*\$?(\d+\.\d{2})/i,
    /\$(\d+\.\d{2})\s*(?:TOTAL|AMOUNT|DUE)/i,
  ];

  const taxPatterns = [
    /(?:TAX|SALES TAX)\s*:?\s*\$?(\d+\.\d{2})/i,
    /\$(\d+\.\d{2})\s*(?:TAX|SALES TAX)/i,
  ];

  const subtotalPatterns = [
    /(?:SUBTOTAL|SUB TOTAL)\s*:?\s*\$?(\d+\.\d{2})/i,
    /\$(\d+\.\d{2})\s*(?:SUBTOTAL|SUB)/i,
  ];

  // Date patterns
  const datePatterns = [
    /(\d{1,2}\/\d{1,2}\/\d{2,4})/,
    /(\d{1,2}-\d{1,2}-\d{2,4})/,
    /(\d{4}-\d{1,2}-\d{1,2})/,
  ];

  // Extract merchant (usually in first few lines)
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    for (const pattern of merchantPatterns) {
      const match = line.match(pattern);
      if (match && !extractedData.merchant) {
        extractedData.merchant = match[1] || match[0];
        break;
      }
    }
    if (extractedData.merchant) break;
  }

  // Extract amounts and date from all lines
  for (const line of lines) {
    // Total amount
    if (!extractedData.total) {
      for (const pattern of totalPatterns) {
        const match = line.match(pattern);
        if (match) {
          extractedData.total = parseFloat(match[1]);
          break;
        }
      }
    }

    // Tax amount
    if (!extractedData.tax) {
      for (const pattern of taxPatterns) {
        const match = line.match(pattern);
        if (match) {
          extractedData.tax = parseFloat(match[1]);
          break;
        }
      }
    }

    // Subtotal
    if (!extractedData.subtotal) {
      for (const pattern of subtotalPatterns) {
        const match = line.match(pattern);
        if (match) {
          extractedData.subtotal = parseFloat(match[1]);
          break;
        }
      }
    }

    // Date
    if (!extractedData.date) {
      for (const pattern of datePatterns) {
        const match = line.match(pattern);
        if (match) {
          extractedData.date = match[1];
          break;
        }
      }
    }
  }

  // Extract line items (basic pattern matching)
  const itemPattern = /^(.+?)\s+\$?(\d+\.\d{2})$/;
  for (const line of lines) {
    const match = line.match(itemPattern);
    if (match && match[1].length > 2 && match[1].length < 50) {
      // Skip lines that look like totals or taxes
      const description = match[1].toLowerCase();
      if (
        !description.includes('total') &&
        !description.includes('tax') &&
        !description.includes('subtotal') &&
        !description.includes('change')
      ) {
        extractedData.items.push({
          description: match[1].trim(),
          amount: parseFloat(match[2]),
        });
      }
    }
  }

  return extractedData;
}

module.exports = {
  getVisionClient,
  detectTextFromUrl,
  processReceiptOCR,
  extractReceiptData,
};
