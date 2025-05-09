// Workspace File Audit Script (CommonJS)
const fs = require('fs');
const path = require('path');

// Configuration
const ROOT_DIR = path.resolve(__dirname, '../../');
const OUTPUT_FILE = path.resolve(ROOT_DIR, 'docs', 'file_audit_summary.md');

// Categories definitions
const categories = [
  {
    name: 'README / .md files',
    match: filePath => filePath.endsWith('.md'),
  },
  {
    name: 'Test files (unit/integration)',
    match: filePath => /\.test\.|\.spec\.|__tests__|e2e/.test(filePath),
  },
  {
    name: 'MCP config files',
    match: filePath => /mcp/i.test(filePath) && /\.ya?ml$|\.json$|\.ts$|\.js$/.test(filePath),
  },
  {
    name: 'Supabase config/SQL files',
    match: filePath => /supabase|\.sql$/i.test(filePath),
  },
  {
    name: 'Google API & Calendar integration files',
    match: filePath => /google-api|calendar/i.test(filePath),
  },
  {
    name: 'Environment & credentials files (.env, secrets)',
    match: filePath => /\.env|credentials|secrets/i.test(path.basename(filePath)),
  },
  {
    name: 'Helper scripts & utilities',
    match: filePath =>
      /scripts|utils|helpers/i.test(filePath) && /\.js$|\.ts$|\.ps1$|\.sh$/.test(filePath),
  },
  {
    name: 'Redundant/placeholder/duplicate/obsolete files',
    match: filePath => /temp|placeholder|example|backup/i.test(filePath),
  },
];

function collectFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const absPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['.git', 'node_modules'].includes(entry.name)) continue;
      files = files.concat(collectFiles(absPath));
    } else {
      files.push(absPath);
    }
  }
  return files;
}

function categorizeFile(filePath) {
  for (const cat of categories) {
    if (cat.match(filePath)) return cat.name;
  }
  return 'Uncategorized';
}

function main() {
  console.log('Scanning workspace. This may take a few minutes...');
  const allFiles = collectFiles(ROOT_DIR);
  console.log(`Total files scanned: ${allFiles.length}`);

  const byCategory = {};
  for (const file of allFiles) {
    const rel = path.relative(ROOT_DIR, file);
    const category = categorizeFile(rel);
    if (!byCategory[category]) byCategory[category] = [];
    const { mtime } = fs.statSync(file);
    byCategory[category].push({ path: rel.replace(/\\/g, '/'), mtime });
  }

  let md = '# File Audit Summary\n\n';
  md += `Generated: ${new Date().toISOString()}\n\n`;
  for (const [category, items] of Object.entries(byCategory)) {
    md += `## ${category} (${items.length})\n\n`;
    md += '| Path | Last Modified |\n|------|---------------|\n';
    items.sort((a, b) => a.path.localeCompare(b.path));
    for (const item of items) {
      md += `| ${item.path} | ${item.mtime.toISOString()} |\n`;
    }
    md += '\n';
  }

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, md, 'utf8');
  console.log(`Audit summary written to ${path.relative(ROOT_DIR, OUTPUT_FILE)}`);
}

if (require.main === module) {
  main();
}
