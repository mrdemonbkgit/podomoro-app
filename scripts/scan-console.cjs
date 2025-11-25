const { readFileSync, readdirSync } = require('fs');
const { join } = require('path');

const consolePatterns = [
  { regex: /console\.log\(/, type: 'console.log' },
  { regex: /console\.warn\(/, type: 'console.warn' },
];

// Manual recursive directory walker (Node.js doesn't support recursive option)
function walkDirectory(dir, fileList = []) {
  const entries = readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Recurse into subdirectory
      walkDirectory(fullPath, fileList);
    } else if (entry.name.match(/\.(ts|tsx)$/)) {
      fileList.push(fullPath);
    }
  }
  
  return fileList;
}

let found = false;
const violations = {};

const files = walkDirectory('src/features/kamehameha');

for (const filePath of files) {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    // Skip comments (JSDoc, inline comments)
    if (trimmed.startsWith('*') || trimmed.startsWith('//')) {
      return;
    }
    
    for (const { regex, type } of consolePatterns) {
      if (line.match(regex)) {
        if (!violations[filePath]) {
          violations[filePath] = [];
        }
        violations[filePath].push({
          line: index + 1,
          type,
          code: line.trim()
        });
        found = true;
      }
    }
  });
}

if (found) {
  console.error('\n⚠️  Found console statements that should be replaced with logger:\n');
  for (const [filePath, issues] of Object.entries(violations)) {
    console.error(`\n${filePath}:`);
    for (const issue of issues) {
      console.error(`  Line ${issue.line}: ${issue.type}`);
      console.error(`    ${issue.code}`);
    }
  }
  console.error('\n❌ Replace console.log/warn with logger.debug/warn from logger utility.');
  console.error('   Note: console.error is OK (used by logger.error in production).\n');
  process.exit(1);
} else {
  console.log('✅ No console.log/warn statements found. All using logger utility!');
}

