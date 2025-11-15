const fs = require('fs/promises');
const path = require('path');

const requiredFiles = [
  'server.js',
  'universities.json',
  'fees.lpu.json',
  'fees.amity.json'
];

async function validateJsonFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    JSON.parse(content);
    console.log(`[OK] ${path.basename(filePath)} is valid`);
    return true;
  } catch (error) {
    console.error(`[ERROR] ${path.basename(filePath)} is invalid: ${error.message}`);
    return false;
  }
}

async function build() {
  console.log('Starting build process...\n');
  
  let hasErrors = false;
  
  console.log('Checking required files:');
  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, '..', file);
    try {
      await fs.access(filePath);
      console.log(`[OK] ${file} exists`);
      
      if (file.endsWith('.json')) {
        const isValid = await validateJsonFile(filePath);
        if (!isValid) hasErrors = true;
      }
    } catch (error) {
      console.error(`[ERROR] ${file} is missing`);
      hasErrors = true;
    }
  }
  
  if (hasErrors) {
    console.error('\nBuild failed with errors');
    process.exit(1);
  } else {
    console.log('\nBuild completed successfully');
  }
}

build().catch(error => {
  console.error('Build error:', error);
  process.exit(1);
});
