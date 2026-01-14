
import { MongoClient, ObjectId } from 'mongodb';

// Use env var or default
const DATABASE_URI = process.env.DATABASE_URI || 'mongodb://127.0.0.1:27018/food-delivery-app';

// Ensure consistent IDs
const phoId = new ObjectId();
const banhMiId = new ObjectId();
const bunChaId = new ObjectId();

const mediaData = [
    {
        _id: phoId,
        alt: 'Vietnamese Pho',
        filename: 'pho.png',
        mimeType: 'image/png',
        filesize: 1000000,
        width: 1024,
        height: 1024,
        createdAt: new Date(),
        updatedAt: new Date(),
        url: '/media/pho.png'
    },
    {
        _id: banhMiId,
        alt: 'Vietnamese Banh Mi',
        filename: 'banh_mi.png',
        mimeType: 'image/png',
        filesize: 1000000,
        width: 1024,
        height: 1024,
        createdAt: new Date(),
        updatedAt: new Date(),
        url: '/media/banh_mi.png'
    },
    {
        _id: bunChaId,
        alt: 'Vietnamese Bun Cha',
        filename: 'bun_cha.png',
        mimeType: 'image/png',
        filesize: 1000000,
        width: 1024,
        height: 1024,
        createdAt: new Date(),
        updatedAt: new Date(),
        url: '/media/bun_cha.png'
    }
];

const dishesData = (mediaIds: ObjectId[], restaurantId: ObjectId, userId: ObjectId, categoryId: ObjectId) => [
    {
        title: 'Phở Bò Đặc Biệt',
        description: 'Traditional Vietnamese noodle soup with beef and herbs',
        price: 12,
        gram: 500,
        availableAmount: 50,
        cookTime: 15,
        restaurant: restaurantId,
        image: mediaIds[0],
        categories: categoryId, // Assign category
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        title: 'Bánh Mì Thịt Nướng',
        description: 'Crispy baguette with grilled pork, pate, and vegetables',
        price: 8,
        gram: 300,
        availableAmount: 100,
        cookTime: 5,
        restaurant: restaurantId,
        image: mediaIds[1],
        categories: categoryId,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        title: 'Bún Chả Hà Nội',
        description: 'Vermicelli noodles with grilled pork and dipping sauce',
        price: 15,
        gram: 450,
        availableAmount: 40,
        cookTime: 20,
        restaurant: restaurantId,
        image: mediaIds[2],
        categories: categoryId,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
    }
];

async function seed() {
    console.log('Connecting to MongoDB...', DATABASE_URI);
    const client = new MongoClient(DATABASE_URI);

    try {
        await client.connect();
        console.log('Connected to MongoDB.');
        const db = client.db();

        // 1. Get a Restaurant and User to link
        // restaurants collection might be lowercase plural
        const restaurant = await db.collection('restaurants').findOne({});
        const customer = await db.collection('customers').findOne({});
        const user = await db.collection('users').findOne({});

        if (!restaurant) {
            console.error('No restaurants found. Please seed restaurants first.');
            process.exit(1);
        }

        // Ensure restaurant has openTime and closeTime (fix for frontend crash if patching failed)
        // Update restaurant openTime/closeTime just in case
        await db.collection('restaurants').updateOne(
            { _id: restaurant._id },
            { $set: { openTime: ' 0800', closeTime: ' 2200' } } // Space prefix as per frontend logic slice(1)
        );

        const creatorId = customer ? customer._id : (user ? user._id : new ObjectId());

        console.log('Using Restaurant:', restaurant.title);

        // 1.5 Setup Category
        const categoryCollection = db.collection('categories');
        let vietnameseCategory = await categoryCollection.findOne({ value: 'vietnamese-food' });
        let categoryId;

        if (!vietnameseCategory) {
            console.log('Creating Vietnamese Food category...');
            categoryId = new ObjectId();
            await categoryCollection.insertOne({
                _id: categoryId,
                category: 'Vietnamese Food',
                value: 'vietnamese-food',
                type: 'dish',
                // No timestamps in schema
            });
        } else {
            console.log('Using existing Vietnamese Food category.');
            categoryId = vietnameseCategory._id;
        }

        // 2. Insert Media
        console.log('Inserting Media...');
        const mediaCollection = db.collection('media');

        // Delete old media with same filenames OR IDs to avoid dupes
        await mediaCollection.deleteMany({
            $or: [
                { _id: { $in: [phoId, banhMiId, bunChaId] } },
                { filename: { $in: ['pho.png', 'banh_mi.png', 'bun_cha.png'] } }
            ]
        });

        await mediaCollection.insertMany(mediaData);
        console.log('Media inserted.');

        // 3. Clear existing Dishes
        console.log('Clearing existing Dishes...');
        const dishesCollection = db.collection('dishes');
        await dishesCollection.deleteMany({});
        console.log('Existing Dishes cleared.');

        // 4. Insert New Dishes
        console.log('Inserting Vietnamese Dishes...');
        const newDishes = dishesData([phoId, banhMiId, bunChaId], restaurant._id, creatorId, categoryId);
        await dishesCollection.insertMany(newDishes);
        console.log('Vietnamese Dishes inserted.');

        console.log('Seeding completed successfully.');

    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        await client.close();
        console.log('Disconnected.');
    }
}

seed();
