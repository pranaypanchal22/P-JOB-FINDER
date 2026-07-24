const fs = require('fs');
const path = require('path');

const srcDir = 'src';

function getRelativePath(fromFile) {
  const depth = fromFile.split(path.sep).length - 2; // -2 for 'src' and filename
  const prefix = depth > 0 ? '../'.repeat(depth) : './';
  return prefix;
}

function convertImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;

  // Calculate depth for this file
  const relativePath = path.relative(srcDir, filePath);
  const depth = relativePath.split(path.sep).length - 1;
  const prefix = depth > 0 ? '../'.repeat(depth) : './';

  // Replace @/ imports
  content = content.replace(/from\s+['"]@\/(.+?)['"]/g, (match, importPath) => {
    return `from '${prefix}${importPath}'`;
  });

  // Replace @prisma imports (keep as-is, they're npm packages)

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✓ Fixed: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && file !== 'node_modules' && file !== '.next') {
      walkDir(filePath);
    } else if ((file.endsWith('.ts') || file.endsWith('.tsx')) && !file.includes('.d.ts')) {
      convertImports(filePath);
    }
  });
}

console.log('Converting @ imports to relative paths...');
walkDir(srcDir);
console.log('Done!');
