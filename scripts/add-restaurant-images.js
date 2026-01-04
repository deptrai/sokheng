const fs = require('fs');
const path = require('path');

// Valid restaurant image URLs from Unsplash
const restaurantImageUrls = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', // Restaurant interior
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800', // Restaurant dining
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', // Restaurant table
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800', // Restaurant ambiance
  'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800', // Restaurant kitchen
  'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800', // Restaurant exterior
];

const seederPath = path.join(__dirname, 'seed-via-payload-api.js');
let content = fs.readFileSync(seederPath, 'utf8');

// Find lines with restaurant categories and add bannerImage
const lines = content.split('\n');
let addedCount = 0;
let imageUrlIndex = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Check if this is a restaurant categories line (not dish categories)
  if (line.includes('categories: [categories[6]') || 
      line.includes('categories: [categories[7]') ||
      line.includes('categories: [categories[8]')) {
    
    // Check if next line already has bannerImage or imageUrl
    if (i + 1 < lines.length && !lines[i + 1].includes('bannerImage') && !lines[i + 1].includes('imageUrl')) {
      // Add comma to current line if it doesn't have one
      if (!lines[i].trim().endsWith(',')) {
        lines[i] = lines[i] + ',';
      }
      
      // Add bannerImage after categories line
      const indent = line.match(/^\s*/)[0];
      const imageUrl = restaurantImageUrls[imageUrlIndex % restaurantImageUrls.length];
      imageUrlIndex++;
      
      lines.splice(i + 1, 0, `${indent}bannerImageUrl: '${imageUrl}'`);
      addedCount++;
      i++; // Skip the newly added line
    }
  }
}

content = lines.join('\n');
fs.writeFileSync(seederPath, content, 'utf8');

console.log(`✓ Added bannerImageUrl to ${addedCount} restaurants`);
console.log(`✓ File updated: ${seederPath}`);
