const { buildConfig } = require('payload');
const { mongooseAdapter } = require('@payloadcms/db-mongodb');
const { payloadCloudPlugin } = require('@payloadcms/payload-cloud');
const { lexicalEditor } = require('@payloadcms/richtext-lexical');
const path = require('path');
const sharp = require('sharp');

// Import collections
const Categories = require('./src/app/(payload)/collections/Categories/index.js');
const Cities = require('./src/app/(payload)/collections/Cities/index.js');
const Customers = require('./src/app/(payload)/collections/Customers/index.js');
const Dishes = require('./src/app/(payload)/collections/Dishes/index.js');
const FeedbackAndCooperations = require('./src/app/(payload)/collections/FeedbackAndCooperations/index.js');
const Media = require('./src/app/(payload)/collections/Media/index.js');
const Orders = require('./src/app/(payload)/collections/Orders/index.js');
const Restaurants = require('./src/app/(payload)/collections/Restaurants/index.js');
const Users = require('./src/app/(payload)/collections/Users/index.js');

module.exports = buildConfig({
  admin: {
    user: Customers.slug,
    importMap: {
      baseDir: path.resolve(__dirname),
    },
  },
  cookiePrefix: 'ashpez',
  collections: [Restaurants, Orders, Dishes, Cities, Users, Customers, Media, Categories, FeedbackAndCooperations],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
  ],
});
