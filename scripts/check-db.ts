
import { MongoClient, ObjectId } from 'mongodb';

const DATABASE_URI = process.env.DATABASE_URI || 'mongodb://127.0.0.1:27018/food-delivery-app';

// Parse CLI arguments
const args = process.argv.slice(2);
const checkType = args[0] || 'restaurant'; // Default to restaurant check
const RESTAURANT_ID = args[1] || '69676310d4264a647f6f3784';

async function checkRestaurant(db: any, restaurantId: string) {
    const restaurants = db.collection('restaurants');
    const media = db.collection('media');

    const restaurant = await restaurants.findOne({ _id: new ObjectId(restaurantId) });
    console.log('\n━━━ Restaurant Data ━━━');
    console.log('Title:', restaurant?.title);
    console.log('BannerImage ID:', restaurant?.bannerImage);

    if (restaurant?.bannerImage) {
        const bannerMedia = await media.findOne({ _id: restaurant.bannerImage });
        console.log('\n━━━ Banner Media Data ━━━');
        console.log('Filename:', bannerMedia?.filename);
        console.log('URL:', bannerMedia?.url);
    } else {
        console.log('No bannerImage set on restaurant.');
    }

    console.log('\n━━━ Dishes Check ━━━');
    const dishes = await db.collection('dishes').find({ restaurant: new ObjectId(restaurantId) }).limit(3).toArray();
    for (const dish of dishes) {
        const imageMedia = await media.findOne({ _id: dish.image });
        console.log(`Dish: ${dish.title} -> Image: ${imageMedia?.filename} (${imageMedia?.url})`);
    }
}

async function checkUsers(db: any) {
    const customersCollection = db.collection('customers');
    const users = await customersCollection.find({}).toArray();

    console.log('\n━━━ All Users in Database ━━━');
    console.log(`Total users: ${users.length}\n`);

    for (const user of users) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Email:', user.email);
        console.log('Name:', user.name);
        console.log('Roles:', user.roles?.join(', ') || 'none');
        console.log('Has salt:', !!user.salt);
        console.log('Has hash:', !!user.hash);
        console.log('Has password field:', !!user.password);
        console.log('Created:', user.createdAt);
        console.log('');
    }
}

async function inspectUser(db: any, email: string) {
    const customersCollection = db.collection('customers');
    const user = await customersCollection.findOne({ email });

    if (!user) {
        console.log(`\n❌ User not found: ${email}`);
        return;
    }

    console.log('\n━━━ User Document Structure ━━━');
    console.log('Email:', user.email);
    console.log('Name:', user.name);
    console.log('Roles:', user.roles);
    console.log('\nPassword Fields:');
    console.log('  salt:', user.salt ? `${user.salt.substring(0, 20)}...` : 'NOT SET');
    console.log('  hash:', user.hash ? `${user.hash.substring(0, 20)}...` : 'NOT SET');
    console.log('  password:', user.password ? `${user.password.substring(0, 20)}...` : 'NOT SET');
    console.log('\nFull document:');
    console.log(JSON.stringify(user, null, 2));
}

async function check() {
    const client = new MongoClient(DATABASE_URI);
    try {
        await client.connect();
        const db = client.db();

        if (checkType === 'users') {
            await checkUsers(db);
        } else if (checkType === 'user' && args[1]) {
            await inspectUser(db, args[1]);
        } else if (checkType === 'restaurant') {
            await checkRestaurant(db, RESTAURANT_ID);
        } else {
            console.log('\n❌ Invalid check type or missing arguments');
            console.log('\nUsage:');
            console.log('  tsx scripts/check-db.ts restaurant [restaurant_id]  # Check restaurant data');
            console.log('  tsx scripts/check-db.ts users                       # List all users');
            console.log('  tsx scripts/check-db.ts user [email]                # Inspect specific user');
            console.log('\nExamples:');
            console.log('  tsx scripts/check-db.ts restaurant 69676310d4264a647f6f3784');
            console.log('  tsx scripts/check-db.ts users');
            console.log('  tsx scripts/check-db.ts user customer1@example.com');
        }

    } finally {
        await client.close();
    }
}

check().catch(console.error);
