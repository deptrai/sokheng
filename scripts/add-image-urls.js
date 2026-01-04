const fs = require('fs');
const path = require('path');

// Valid image URLs from Unsplash
const imageUrls = [
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', // Pizza/food
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400', // Pancakes
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', // Salad
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400', // Burger
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400', // Salad bowl
  'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400', // Fried rice
  'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400', // Noodles
  'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400', // Soup
  'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400', // Sushi
  'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400', // Burger close
];

const seederPath = path.join(__dirname, 'seed-via-payload-api.js');
let content = fs.readFileSync(seederPath, 'utf8');

// Find lines with categories and add imageUrl on next line if missing
const lines = content.split('\n');
let addedCount = 0;
let imageUrlIndex = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Check if this line has categories field
  if (line.includes('categories: [') && !line.includes('imageUrl')) {
    // Check if next line already has imageUrl
    if (i + 1 < lines.length && !lines[i + 1].includes('imageUrl')) {
      // Add comma to current line if it doesn't have one
      if (!lines[i].trim().endsWith(',')) {
        lines[i] = lines[i] + ',';
      }
      
      // Add imageUrl after categories line
      const indent = line.match(/^\s*/)[0];
      const imageUrl = imageUrls[imageUrlIndex % imageUrls.length];
      imageUrlIndex++;
      
      lines.splice(i + 1, 0, `${indent}imageUrl: '${imageUrl}'`);
      addedCount++;
      i++; // Skip the newly added line
    }
  }
}

content = lines.join('\n');
fs.writeFileSync(seederPath, content, 'utf8');

console.log(`✓ Added imageUrl to ${addedCount} dishes`);
console.log(`✓ File updated: ${seederPath}`);
