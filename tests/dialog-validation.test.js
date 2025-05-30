const { describe, it } = require('mocha');
const { expect } = require('chai');
const { readFileSync, readdirSync, statSync } = require('fs');
const { join } = require('path');

/**
 * Test to ensure no nested dialogs exist in the codebase
 * This prevents poor UX and accessibility issues
 */
describe('Dialog Validation', () => {
  const componentsDir = join(process.cwd(), 'src/components');
  const pagesDir = join(process.cwd(), 'src/pages');

  // Helper function to recursively get all .tsx files
  function getTsxFiles(dir) {
    const files = [];

    try {
      const items = readdirSync(dir);

      for (const item of items) {
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          // Skip node_modules and other non-source directories
          if (!item.startsWith('.') && item !== 'node_modules') {
            files.push(...getTsxFiles(fullPath));
          }
        } else if (item.endsWith('.tsx')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`Could not read directory: ${dir}`);
    }

    return files;
  }

  // Helper to check if a file contains nested Dialog components
  function checkForNestedDialogs(filePath) {
    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const problematicLines = [];

    let dialogDepth = 0;
    let inJSX = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Simple heuristic: track Dialog opening tags
      if (line.includes('<Dialog') && !line.includes('</Dialog')) {
        if (inJSX) {
          dialogDepth++;
          if (dialogDepth > 1) {
            problematicLines.push(i + 1); // Line numbers are 1-indexed
          }
        }
        inJSX = true;
      }

      // Track Dialog closing tags
      if (line.includes('</Dialog>')) {
        dialogDepth = Math.max(0, dialogDepth - 1);
        if (dialogDepth === 0) {
          inJSX = false;
        }
      }

      // Also check for self-closing Dialog tags after another Dialog
      if (dialogDepth > 0 && line.includes('<Dialog') && line.includes('/>')) {
        problematicLines.push(i + 1);
      }
    }

    return { hasNested: problematicLines.length > 0, lines: problematicLines };
  }

  // Helper to check if DialogContent has DialogDescription
  function checkForMissingDescription(filePath) {
    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const problematicLines = [];

    // Find DialogContent components and check if they have associated DialogDescription
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.includes('<DialogContent')) {
        // Look ahead for DialogDescription within reasonable distance (20 lines)
        let hasDescription = false;
        let closingFound = false;

        for (let j = i; j < Math.min(i + 20, lines.length); j++) {
          if (lines[j].includes('</DialogContent>')) {
            closingFound = true;
            break;
          }
          if (lines[j].includes('<DialogDescription')) {
            hasDescription = true;
            break;
          }
        }

        if (closingFound && !hasDescription) {
          problematicLines.push(i + 1);
        }
      }
    }

    return { hasMissing: problematicLines.length > 0, lines: problematicLines };
  }

  it('should not have nested Dialog components', () => {
    const allFiles = [...getTsxFiles(componentsDir), ...getTsxFiles(pagesDir)];
    const filesWithNestedDialogs = [];

    for (const file of allFiles) {
      const { hasNested, lines } = checkForNestedDialogs(file);
      if (hasNested) {
        const relativePath = file.replace(process.cwd(), '');
        filesWithNestedDialogs.push(`${relativePath} (lines: ${lines.join(', ')})`);
      }
    }

    if (filesWithNestedDialogs.length > 0) {
      throw new Error(
        `Found nested dialogs in the following files:\n${filesWithNestedDialogs.join('\n')}\n\n` +
          `Nested dialogs create poor UX and accessibility issues. ` +
          `Use DocumentViewerContent inside existing dialogs or DocumentViewerDialog as standalone.`
      );
    }
  });

  it('should have DialogDescription in all DialogContent components', () => {
    const allFiles = [...getTsxFiles(componentsDir), ...getTsxFiles(pagesDir)];
    const filesWithMissingDescription = [];

    for (const file of allFiles) {
      // Skip test files and story files
      if (file.includes('.test.') || file.includes('.stories.')) continue;

      const { hasMissing, lines } = checkForMissingDescription(file);
      if (hasMissing) {
        const relativePath = file.replace(process.cwd(), '');
        filesWithMissingDescription.push(`${relativePath} (lines: ${lines.join(', ')})`);
      }
    }

    if (filesWithMissingDescription.length > 0) {
      throw new Error(
        `Found DialogContent without DialogDescription in:\n${filesWithMissingDescription.join('\n')}\n\n` +
          `Every DialogContent must have a DialogDescription for accessibility. ` +
          `Use className="sr-only" if the description should be hidden visually.`
      );
    }
  });
});
