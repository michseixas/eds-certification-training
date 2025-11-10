#!/usr/bin/env node

/**
 * Validates all JSON files in the project
 */

const fs = require('fs');
const path = require('path');

const ignorePatterns = [
  'node_modules',
  'package-lock.json',
  '.git',
];

function findJsonFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip ignored directories
      if (!ignorePatterns.some((pattern) => filePath.includes(pattern))) {
        findJsonFiles(filePath, fileList);
      }
    } else if (file.endsWith('.json')) {
      // Skip ignored files
      if (!ignorePatterns.some((pattern) => filePath.includes(pattern))) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

function validateJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    JSON.parse(content);
    return { valid: true, error: null };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

// Main execution
const projectRoot = path.resolve(__dirname, '..');
const jsonFiles = findJsonFiles(projectRoot);

console.log(`Validating ${jsonFiles.length} JSON files...\n`);

let hasErrors = false;
jsonFiles.forEach((file) => {
  const result = validateJsonFile(file);
  const relativePath = path.relative(projectRoot, file);
  
  if (result.valid) {
    console.log(`✓ ${relativePath}`);
  } else {
    console.error(`✗ ${relativePath}: ${result.error}`);
    hasErrors = true;
  }
});

if (hasErrors) {
  console.error('\n❌ Some JSON files are invalid!');
  process.exit(1);
} else {
  console.log('\n✅ All JSON files are valid!');
  process.exit(0);
}

