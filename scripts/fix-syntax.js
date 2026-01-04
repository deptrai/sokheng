const fs = require('fs');
const path = require('path');

const seederPath = path.join(__dirname, 'seed-via-payload-api.js');
let content = fs.readFileSync(seederPath, 'utf8');

// Fix missing commas before imageUrl
content = content.replace(/(\])\s*\n(\s+)imageUrl:/g, '],\n$2imageUrl:');

// Fix missing commas in restaurants array
content = content.replace(/(categories: \[[^\]]+\])\s*\n(\s+)imageUrl:/g, '$1,\n$2imageUrl:');

fs.writeFileSync(seederPath, content, 'utf8');

console.log('✓ Fixed syntax errors');
console.log('✓ File updated:', seederPath);
