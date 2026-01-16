import { MongoClient, ObjectId } from 'mongodb';
import path from 'path';
import fs from 'fs';

const DATABASE_URI = process.env.DATABASE_URI || 'mongodb://127.0.0.1:27018/food-delivery-app';
const RESTAURANT_ID = '69676310d4264a647f6f3784';

// Menu data extracted from images
const MENU_DATA = {
    'Xào (Stir-fry Noodles)': [
        { title: 'Mì Xào Hải Sản', price: 6, description: 'Stir-fried noodles with seafood' },
        { title: 'Mì Xào Bò', price: 6, description: 'Stir-fried noodles with beef' },
        { title: 'Mì Xào Singapore', price: 8, description: 'Singapore-style stir-fried noodles' },
        { title: 'Mì Xào Thập Cẩm', price: 8, description: 'Mixed stir-fried noodles' },
        { title: 'Mì Áp Chảo Hải Sản', price: 6, description: 'Crispy noodles with seafood' },
        { title: 'Mì Áp Chảo Bò', price: 6, description: 'Crispy noodles with beef' },
        { title: 'Mì Trộn 2 Trứng Ốp La', price: 6, description: 'Mixed noodles with 2 fried eggs' },
        { title: 'Mì Xào Ốc Móng Tay', price: 6, description: 'Stir-fried noodles with clams' },
        { title: 'Mì Xào Giòn', price: 8, description: 'Crispy fried noodles' },
    ],
    'Bò (Beef Dishes)': [
        { title: 'Bò Tái Chanh', price: 10, description: 'Rare beef with lime' },
        { title: 'Bò Nhúng Dấm', price: 12, description: 'Beef hotpot with vinegar' },
        { title: 'Bò Nhúng Mẻ', price: 12, description: 'Beef hotpot with fermented rice' },
        { title: 'Bò Lúc Lắc Khoai Tây Chiên', price: 8, description: 'Shaking beef with french fries' },
        { title: 'Bò Cuốn Cải Xanh', price: 8, description: 'Beef wrapped in vegetables' },
        { title: 'Bò Nướng Sả', price: 8, description: 'Grilled lemongrass beef' },
        { title: 'Bò Nướng Muối Ớt', price: 8, description: 'Grilled beef with salt and chili' },
        { title: 'Bò Cuốn Nấm Kim Châm', price: 8, description: 'Beef wrapped with enoki mushrooms' },
        { title: 'Bò Bít Tết', price: 8, description: 'Vietnamese beefsteak' },
    ],
    'Gà (Chicken Dishes)': [
        { title: 'Sụn Gà Chiên Nước Mắm', price: 6, description: 'Fried chicken cartilage with fish sauce' },
        { title: 'Sụn Gà Rang Muối', price: 6, description: 'Salted fried chicken cartilage' },
        { title: 'Sụn Gà Cháy Tỏi', price: 6, description: 'Chicken cartilage with garlic' },
        { title: 'Chân Gà Chiên Nước Mắm', price: 6, description: 'Fried chicken feet with fish sauce' },
        { title: 'Chân Gà Chiên Bơ', price: 6, description: 'Butter fried chicken feet' },
        { title: 'Chân Gà Sốt Thái', price: 6, description: 'Chicken feet with Thai sauce' },
        { title: 'Chân Gà Hấp Hành', price: 6, description: 'Steamed chicken feet with scallions' },
        { title: 'Gỏi Gà Xé Phay', price: 12, description: 'Shredded chicken salad' },
        { title: 'Gỏi Gà Hoa Chuối', price: 12, description: 'Chicken and banana blossom salad' },
    ],
    'Bún (Vermicelli)': [
        { title: 'Bún Thái', price: 6, description: 'Thai-style vermicelli' },
        { title: 'Bún Bò Xào', price: 6, description: 'Vermicelli with stir-fried beef' },
        { title: 'Bún Chả Giò', price: 6, description: 'Vermicelli with spring rolls' },
        { title: 'Bún Bò Xào Chả Giò', price: 6, description: 'Vermicelli with beef and spring rolls' },
        { title: 'Bún Thịt Nướng Chả Giò', price: 6, description: 'Vermicelli with grilled pork and spring rolls' },
        { title: 'Bún Thịt Nướng', price: 6, description: 'Vermicelli with grilled pork' },
        { title: 'Bún Thịt Heo Xào', price: 6, description: 'Vermicelli with stir-fried pork' },
        { title: 'Bún Chả', price: 6, description: 'Hanoi-style grilled pork vermicelli' },
        { title: 'Bún Chả Cá', price: 6, description: 'Vermicelli with fish cake' },
    ],
    'Khai Vị (Appetizers)': [
        { title: 'Đậu Hũ Chiên Giòn', price: 5, description: 'Crispy fried tofu' },
        { title: 'Đậu Hũ Chiên Sả', price: 6, description: 'Lemongrass fried tofu' },
        { title: 'Gỏi Ngó Sen Tôm Thịt', price: 6, description: 'Lotus stem salad with shrimp and pork' },
        { title: 'Gỏi Đu Đủ Sò Huyết', price: 8, description: 'Papaya salad with blood clams' },
        { title: 'Gỏi Xoài Khô Cá Lóc', price: 6, description: 'Mango salad with dried snakehead fish' },
        { title: 'Gỏi Xoài Ốc Giác', price: 8, description: 'Mango salad with sea snails' },
        { title: 'Gỏi Xoài Khô Mực', price: 8, description: 'Mango salad with dried squid' },
        { title: 'Gỏi Nộm Tôm', price: 8, description: 'Shrimp salad' },
        { title: 'Đậu Hũ Non Nướng Giấy Bạc', price: 10, description: 'Grilled soft tofu in foil' },
    ],
};

async function main() {
    const client = new MongoClient(DATABASE_URI);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');

        const db = client.db();
        const mediaCollection = db.collection('media');
        const dishesCollection = db.collection('dishes');
        const categoriesCollection = db.collection('categories');
        const restaurantsCollection = db.collection('restaurants');

        // Step 1: Create/Update media files
        console.log('\n📸 Setting up media files...');
        const imageMap = {
            'Banner': 'sokheng_banner.png',
            'Seafood Noodles': 'sokheng_seafood_noodles.png',
            'Stir-fry Noodles': 'sokheng_stir_fry_noodles.png',
            'Shaking Beef': 'sokheng_shaking_beef.png',
            'Beef Dish': 'sokheng_beef_dish.png',
            'Chicken Feet': 'sokheng_chicken_feet.png',
            'Chicken Dish': 'sokheng_chicken_dish.png',
            'Grilled Pork Vermicelli': 'sokheng_grilled_pork_vermicelli.png',
            'Vermicelli Bowl': 'sokheng_vermicelli_bowl.png',
            'Mango Salad': 'sokheng_mango_salad.png',
            'Tofu': 'sokheng_tofu.png',
            'Appetizer': 'sokheng_salad_appetizer.png',
            'Hotpot': 'sokheng_hotpot.png',
        };

        const mediaIds: Record<string, ObjectId> = {};

        for (const [key, filename] of Object.entries(imageMap)) {
            const mediaId = new ObjectId();
            const filePath = path.join(process.cwd(), 'public', 'media', filename);

            if (!fs.existsSync(filePath)) {
                console.warn(`⚠️  Image not found: ${filePath}`);
                continue;
            }

            const stats = fs.statSync(filePath);

            // Delete existing media with same filename
            await mediaCollection.deleteMany({ filename });

            // Insert new media
            await mediaCollection.insertOne({
                _id: mediaId,
                filename,
                mimeType: 'image/png',
                filesize: stats.size,
                width: 800,
                height: 600,
                url: `/media/${filename}`,
                alt: `${key} image`,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            mediaIds[key] = mediaId;
            console.log(`  ✓ Created media for ${key}`);
        }

        // ... Steps 2 and 3 omitted (keep as is) ...

        // Step 4: Insert new dishes
        console.log('\n🍜 Adding new dishes...');
        const dishIds: ObjectId[] = [];

        // Helper to select image based on title
        function getDishImageId(title: string, category: string): ObjectId {
            const lowerTitle = title.toLowerCase();

            // Priority matches based on specific keywords
            if (lowerTitle.includes('hải sản') || lowerTitle.includes('seafood')) return mediaIds['Seafood Noodles'];
            if (lowerTitle.includes('lúc lắc')) return mediaIds['Shaking Beef'];
            if (lowerTitle.includes('chân gà')) return mediaIds['Chicken Feet'];
            if (lowerTitle.includes('thịt nướng') && category.includes('Bún')) return mediaIds['Grilled Pork Vermicelli'];
            if (lowerTitle.includes('xoài') && (lowerTitle.includes('gỏi') || lowerTitle.includes('nộm'))) return mediaIds['Mango Salad'];
            if (lowerTitle.includes('đậu hũ')) return mediaIds['Tofu'];
            if (lowerTitle.includes('nhúng')) return mediaIds['Hotpot'];

            // Fallback to category defaults
            if (category.includes('Xào')) return mediaIds['Stir-fry Noodles'];
            if (category.includes('Bò')) return mediaIds['Beef Dish'];
            if (category.includes('Gà')) return mediaIds['Chicken Dish'];
            if (category.includes('Bún')) return mediaIds['Vermicelli Bowl'];
            if (category.includes('Khai Vị')) return mediaIds['Appetizer'];

            return mediaIds['Stir-fry Noodles']; // Ultimate fallback
        }

        // Step 2: Create/Update categories
        console.log('\n📂 Setting up categories...');
        const categoryIds: Record<string, ObjectId> = {};

        for (const categoryName of Object.keys(MENU_DATA)) {
            let category = await categoriesCollection.findOne({ category: categoryName });

            if (!category) {
                const categoryId = new ObjectId();
                await categoriesCollection.insertOne({
                    _id: categoryId,
                    category: categoryName,
                    value: categoryName.toLowerCase().replace(/\s+/g, '-'),
                    type: 'dish',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
                categoryIds[categoryName] = categoryId;
                console.log(`  ✓ Created category: ${categoryName}`);
            } else {
                categoryIds[categoryName] = category._id;
                console.log(`  ✓ Found existing category: ${categoryName}`);
            }
        }

        // Step 3: Delete old dishes for this restaurant
        console.log('\n🗑️  Removing old dishes...');
        const deleteResult = await dishesCollection.deleteMany({
            restaurant: new ObjectId(RESTAURANT_ID),
        });
        console.log(`  ✓ Deleted ${deleteResult.deletedCount} old dishes`);


        for (const [categoryName, dishes] of Object.entries(MENU_DATA)) {
            const categoryId = categoryIds[categoryName];

            for (const dish of dishes) {
                const dishId = new ObjectId();
                const imageId = getDishImageId(dish.title, categoryName);

                await dishesCollection.insertOne({
                    _id: dishId,
                    title: dish.title,
                    description: dish.description,
                    price: dish.price,
                    gram: 300,
                    availableAmount: 100,
                    cookTime: 15,
                    restaurant: new ObjectId(RESTAURANT_ID),
                    image: imageId,
                    categories: {
                        category: categoryName,
                    },
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
                dishIds.push(dishId);
                console.log(`  ✓ Added: ${dish.title} ($${dish.price})`);
            }
        }

        // Step 5: Upsert restaurant (create if not exists, update if exists)
        console.log('\n🏪 Upserting restaurant...');
        const restaurantResult = await restaurantsCollection.updateOne(
            { _id: new ObjectId(RESTAURANT_ID) },
            {
                $set: {
                    title: 'Sokheng (Hương Việt Quán)',
                    description: 'Authentic Vietnamese Cuisine - Món Ngon Hương Việt',
                    address: 'Phnom Penh & Sihanoukville',
                    deliveryTime: '45',
                    deliveryPrice: 3,
                    freeAfterAmount: 20,
                    workingHours: {
                        openTime: '08:00',
                        closeTime: '22:00',
                    },
                    isClosed: false,
                    isDelivery: true,
                    budgetCategory: '2',
                    isBlocked: false,
                    dishes: dishIds,
                    cities: [
                        new ObjectId('696840766b35e5361bfaa4a8'), // Phnom Penh
                        new ObjectId('696840766b35e5361bfaa4a9'), // Sihanoukville
                    ],
                    bannerImage: mediaIds['Banner'], // ✅ Added banner image
                    updatedAt: new Date(),
                },
                $setOnInsert: {
                    createdAt: new Date(),
                },
            },
            { upsert: true }
        );

        if (restaurantResult.upsertedCount > 0) {
            console.log('  ✓ Restaurant created: "Sokheng (Hương Việt Quán)"');
        } else {
            console.log('  ✓ Restaurant updated: "Sokheng (Hương Việt Quán)"');
        }
        console.log('  ✓ Cities: Phnom Penh, Sihanoukville');

        console.log('\n✅ Seeding completed successfully!');
        console.log(`📊 Total dishes added: ${dishIds.length}`);
        console.log(`📂 Categories: ${Object.keys(MENU_DATA).length}`);
        console.log('\n🌐 Visit: http://localhost:3000/en/restaurant/69676310d4264a647f6f3784');

    } catch (error) {
        console.error('❌ Error during seeding:', error);
        throw error;
    } finally {
        await client.close();
        console.log('\n👋 Database connection closed');
    }
}

main().catch(console.error);
