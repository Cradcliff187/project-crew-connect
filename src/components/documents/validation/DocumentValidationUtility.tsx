
import { Document } from './DocumentTypes';

// Fix the issue with url property
// Replace document.file_url with document.url
// In the openDocument or similar function:

const openDocument = (document: Document) => {
  if (document.url || document.file_url) { // Check for both url and file_url
    window.open(document.url || document.file_url, '_blank');
  } else {
    console.error('Document URL not available');
  }
};
