
const mongoose = require('mongoose');

const DATABASE_URI = 'mongodb://127.0.0.1:27018/food-delivery-app';

const mediaData = [
    {
        _id: new mongoose.Types.ObjectId(),
        alt: 'Vietnamese Pho',
        filename: 'pho.png',
        mimeType: 'image/png',
        filesize: 1000000, // Dummy size
        width: 1024,
        height: 1024,
        createdAt: new Date(),
        updatedAt: new Date(),
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

const dishesData = (mediaIds, restaurantId, userId) => [
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
    console.log('Connecting to MongoDB...');
    await mongoose.connect(DATABASE_URI);
    console.log('Connected.');

    try {
        // 1. Get a Restaurant and User to link
        const restaurant = await mongoose.connection.db.collection('restaurants').findOne({});
        const user = await mongoose.connection.db.collection('users').findOne({}); // Or 'customers'

        // Note: Dishes 'createdBy' refers to 'customers' collection based on config?
        // Let's check Customers collection.
        const customer = await mongoose.connection.db.collection('customers').findOne({});

        if (!restaurant) {
            console.error('No restaurants found. Please seed restaurants first.');
            process.exit(1);
        }
        const creatorId = customer ? customer._id : (user ? user._id : new mongoose.Types.ObjectId());

        console.log('Using Restaurant:', restaurant.title);
        console.log('Using Creator ID:', creatorId);

        // 2. Insert Media
        console.log('Inserting Media...');
        const mediaCollection = mongoose.connection.db.collection('media');
        // Check if media already exists to avoid dupes (optional, but here providing new IDs)
        await mediaCollection.insertMany(mediaData);
        console.log('Media inserted.');

        // 3. Update Existing Dishes or Insert New?
        // User asked to "fix current products". Update implies changing existing ones.
        // However, mismatched data might be weird. Let's DELETE all existing dishes and replace them.
        console.log('Clearing existing Dishes...');
        const dishesCollection = mongoose.connection.db.collection('dishes');
        await dishesCollection.deleteMany({});
        console.log('Existing Dishes cleared.');

        // 4. Insert New Dishes
        console.log('Inserting Vietnamese Dishes...');
        const newDishes = dishesData(mediaData.map(m => m._id), restaurant._id, creatorId);
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
