// Script to investigate form data processing issues
// This will help identify where "Processed form data: undefined" is coming from

const fs = require('fs');
const path = require('path');

console.log('🔍 Investigating Form Data Processing Issues...\n');

// Search patterns for potential form processing issues
const searchPatterns = [
  {
    pattern: /Processed form data:/gi,
    description: 'Direct console.log statements',
  },
  {
    pattern: /console\.log\s*\(\s*['"`].*form\s*data.*['"`],?\s*([^)]*)\)/gi,
    description: 'Console logs mentioning form data',
  },
  {
    pattern: /onSubmit\s*[=:]\s*async?\s*\([^)]*\)\s*=>/g,
    description: 'onSubmit handlers',
  },
  {
    pattern: /handleSubmit\s*\(/g,
    description: 'React Hook Form handleSubmit calls',
  },
  {
    pattern: /form\.getValues\(\)/g,
    description: 'Form value retrievals',
  },
];

// Directories to search
const searchDirs = ['src/components', 'server', 'db/scripts'];

// File extensions to search
const extensions = ['.js', '.jsx', '.ts', '.tsx', '.cjs'];

// Function to search files
function searchFiles(dir, results = []) {
  try {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        searchFiles(filePath, results);
      } else if (stat.isFile() && extensions.includes(path.extname(file))) {
        const content = fs.readFileSync(filePath, 'utf8');

        for (const { pattern, description } of searchPatterns) {
          const matches = content.match(pattern);
          if (matches) {
            results.push({
              file: filePath,
              pattern: description,
              matches: matches.length,
              lines: findMatchingLines(content, pattern),
            });
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error searching ${dir}:`, error.message);
  }

  return results;
}

// Function to find line numbers of matches
function findMatchingLines(content, pattern) {
  const lines = content.split('\n');
  const matchingLines = [];

  lines.forEach((line, index) => {
    if (pattern.test(line)) {
      matchingLines.push({
        lineNumber: index + 1,
        content: line.trim(),
      });
    }
  });

  return matchingLines;
}

// Main search
console.log('Searching for form data processing patterns...\n');

const allResults = [];
for (const dir of searchDirs) {
  if (fs.existsSync(dir)) {
    console.log(`Searching in ${dir}...`);
    searchFiles(dir, allResults);
  }
}

// Group results by pattern
const groupedResults = {};
for (const result of allResults) {
  if (!groupedResults[result.pattern]) {
    groupedResults[result.pattern] = [];
  }
  groupedResults[result.pattern].push(result);
}

// Display results
console.log('\n📊 Search Results:\n');

for (const [pattern, results] of Object.entries(groupedResults)) {
  console.log(`\n${pattern} (${results.length} files):`);
  console.log('='.repeat(60));

  for (const result of results.slice(0, 5)) {
    // Show first 5 files
    console.log(`\nFile: ${result.file}`);
    console.log(`Matches: ${result.matches}`);

    if (result.lines.length > 0) {
      console.log('Sample lines:');
      for (const line of result.lines.slice(0, 3)) {
        // Show first 3 lines
        console.log(`  Line ${line.lineNumber}: ${line.content.substring(0, 80)}...`);
      }
    }
  }

  if (results.length > 5) {
    console.log(`\n... and ${results.length - 5} more files`);
  }
}

// Look for specific "Processed form data: undefined" pattern
console.log('\n\n🎯 Searching for exact "Processed form data: undefined" pattern...\n');

const exactPattern = /console\.log\s*\(\s*['"`]Processed\s+form\s+data:['"`],?\s*([^)]*)\)/gi;
const undefinedPattern = /Processed\s+form\s+data:\s*undefined/gi;

let foundExact = false;
for (const dir of searchDirs) {
  if (fs.existsSync(dir)) {
    const results = [];
    searchFiles(dir, results);

    for (const result of results) {
      const content = fs.readFileSync(result.file, 'utf8');

      if (exactPattern.test(content) || undefinedPattern.test(content)) {
        foundExact = true;
        console.log(`Found in: ${result.file}`);

        // Get context around the match
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.match(exactPattern) || line.match(undefinedPattern)) {
            console.log(`\nLine ${index + 1}: ${line.trim()}`);

            // Show surrounding lines for context
            if (index > 0) console.log(`Line ${index}: ${lines[index - 1].trim()}`);
            if (index < lines.length - 1)
              console.log(`Line ${index + 2}: ${lines[index + 1].trim()}`);
          }
        });
      }
    }
  }
}

if (!foundExact) {
  console.log('❌ Could not find exact "Processed form data: undefined" pattern.');
  console.log('The issue might be coming from:');
  console.log('1. A backend endpoint logging form data');
  console.log('2. A middleware processing requests');
  console.log('3. A third-party library');
  console.log('4. Dynamic string concatenation');
}

console.log('\n\n💡 Recommendations:');
console.log('1. Add more detailed logging to form submission handlers');
console.log('2. Check server-side request body parsing middleware');
console.log('3. Verify form data is being sent correctly from frontend');
console.log('4. Look for any data transformation that might set values to undefined');
