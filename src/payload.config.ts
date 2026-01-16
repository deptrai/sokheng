// storage-adapter-import-placeholder
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { payloadCloudPlugin } from "@payloadcms/payload-cloud";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";

import Categories from "./app/(payload)/collections/Categories/index.js";
import Cities from "./app/(payload)/collections/Cities/index.js";
import Customers from "./app/(payload)/collections/Customers/index.js";
import Dishes from "./app/(payload)/collections/Dishes/index.js";
import FeedbackAndCooperations from "./app/(payload)/collections/FeedbackAndCooperations/index.js";
import Media from "./app/(payload)/collections/Media/index.js";
import Orders from "./app/(payload)/collections/Orders/index.js";
import Restaurants from "./app/(payload)/collections/Restaurants/index.js";
import Users from "./app/(payload)/collections/Users/index.js";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Customers.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  cookiePrefix: "ashpez",
  collections: [Restaurants, Orders, Dishes, Cities, Users, Customers, Media, Categories, FeedbackAndCooperations],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || "",
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    // storage-adapter-placeholder
  ],
});
