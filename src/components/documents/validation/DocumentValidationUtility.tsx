
// Fix the issue with url property
// Replace document.file_url with document.url
// In the openDocument or similar function:

const openDocument = (document: Document) => {
  if (document.url) { // Changed from file_url to url
    window.open(document.url, '_blank');
  } else {
    console.error('Document URL not available');
  }
};
