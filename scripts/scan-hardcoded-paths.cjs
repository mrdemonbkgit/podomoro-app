const { readFileSync, readdirSync } = require('fs');
const { join } = require('path');

const pathPatterns = [
  /users\/\${.*?}\/kamehameha/,
  /'users\/.*?\/kamehameha/,
  /"users\/.*?\/kamehameha/,
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
const files = walkDirectory('src/features/kamehameha');

for (const filePath of files) {
  // Skip the source file itself
  if (filePath.includes('services/paths.ts') || filePath.includes('services\\paths.ts')) continue;
  
  // Skip test files - they use hardcoded paths for mocking
  if (filePath.includes('.test.') || filePath.includes('__tests__')) continue;
  
  const content = readFileSync(filePath, 'utf-8');
  for (const pattern of pathPatterns) {
    if (content.match(pattern)) {
      console.error(`⚠️  Hardcoded path in: ${filePath}`);
      found = true;
    }
  }
}

if (found) {
  console.error('\n❌ Found hardcoded paths. Use COLLECTION_PATHS from services/paths.ts instead.');
  process.exit(1);
} else {
  console.log('✅ No hardcoded paths found. All using centralized paths!');
}

