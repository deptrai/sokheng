
import mongoose from 'mongoose';
import path from 'path';

// Use env var or default
const DATABASE_URI = process.env.DATABASE_URI || 'mongodb://127.0.0.1:27018/food-delivery-app';

const mediaData = [
    {
        _id: new mongoose.Types.ObjectId(),
        alt: 'Vietnamese Pho',
        filename: 'pho.png',
        mimeType: 'image/png',
        filesize: 1000000,
        width: 1024,
        height: 1024,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Payload usually stores relative path or filename. 
        // If staticURL is not set, it might just use filename.
        // We will set typical fields.
        url: '/api/media/file/pho.png'
    },
    {
        _id: new mongoose.Types.ObjectId(),
        alt: 'Vietnamese Banh Mi',
        filename: 'banh_mi.png',
        mimeType: 'image/png',
        filesize: 1000000,
        width: 1024,
        height: 1024,
        createdAt: new Date(),
        updatedAt: new Date(),
        url: '/api/media/file/banh_mi.png'
    },
    {
        _id: new mongoose.Types.ObjectId(),
        alt: 'Vietnamese Bun Cha',
        filename: 'bun_cha.png',
        mimeType: 'image/png',
        filesize: 1000000,
        width: 1024,
        height: 1024,
        createdAt: new Date(),
        updatedAt: new Date(),
        url: '/api/media/file/bun_cha.png'
    }
];

const dishesData = (mediaIds: mongoose.Types.ObjectId[], restaurantId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId) => [
    {
        title: 'Phở Bò Đặc Biệt',
        description: 'Traditional Vietnamese noodle soup with beef and herbs',
        price: 12,
        gram: 500,
        availableAmount: 50,
        cookTime: 15,
        restaurant: restaurantId,
        image: mediaIds[0],
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
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
    }
];

async function seed() {
    console.log('Connecting to MongoDB...', DATABASE_URI);
    await mongoose.connect(DATABASE_URI);
    console.log('Connected.');

    try {
        const db = mongoose.connection.db;
        if (!db) throw new Error('Database connection failed');

        // 1. Get a Restaurant and User to link
        const restaurant = await db.collection('restaurants').findOne({});
        const customer = await db.collection('customers').findOne({});
        const user = await db.collection('users').findOne({});

        if (!restaurant) {
            console.error('No restaurants found. Please seed restaurants first.');
            process.exit(1);
        }

        // Prioritize customer, then user, then new ID
        const creatorId = customer ? customer._id : (user ? user._id : new mongoose.Types.ObjectId());

        console.log('Using Restaurant:', restaurant.title);

        // 2. Insert Media
        console.log('Inserting Media...');
        const mediaCollection = db.collection('media');

        // Optional: clear existing media with same filenames to avoid confusion
        // await mediaCollection.deleteMany({ filename: { $in: ['pho.png', 'banh_mi.png', 'bun_cha.png'] } });

        await mediaCollection.insertMany(mediaData);
        console.log('Media inserted.');

        // 3. Clear existing Dishes
        console.log('Clearing existing Dishes...');
        const dishesCollection = db.collection('dishes');
        await dishesCollection.deleteMany({});
        console.log('Existing Dishes cleared.');

        // 4. Insert New Dishes
        console.log('Inserting Vietnamese Dishes...');
        const newDishes = dishesData(mediaData.map(m => m._id), restaurant._id as any, creatorId as any);
        await dishesCollection.insertMany(newDishes);
        console.log('Vietnamese Dishes inserted.');

        console.log('Seeding completed successfully.');

    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
    }
}

seed();
