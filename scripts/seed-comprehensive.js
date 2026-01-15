const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// MongoDB connection
const uri = 'mongodb://127.0.0.1:27018/food-delivery-app';
const client = new MongoClient(uri);

// Sample data
const cities = [
  { title: 'Phnom Penh' },
  { title: 'Sihanoukville' }
];

const categories = [
  { category: 'Pizza', value: 'pizza', type: 'dish', order: 1 },
  { category: 'Burger', value: 'burger', type: 'dish', order: 2 },
  { category: 'Sushi', value: 'sushi', type: 'dish', order: 3 },
  { category: 'Salad', value: 'salad', type: 'dish', order: 4 },
  { category: 'Dessert', value: 'dessert', type: 'dish', order: 5 },
  { category: 'Fast Food', value: 'fast-food', type: 'restaurant', order: 1 },
  { category: 'Fine Dining', value: 'fine-dining', type: 'restaurant', order: 2 },
  { category: 'Cafe', value: 'cafe', type: 'restaurant', order: 3 }
];

const mediaItems = [
  {
    alt: 'Delicious Pizza',
    filename: 'sokheng_beef_dish.png',
    mimeType: 'image/png',
    filesize: 843858,
    width: 1024,
    height: 1024,
    url: '/media/sokheng_beef_dish.png'
  },
  {
    alt: 'Juicy Burger',
    filename: 'sokheng_chicken_dish.png',
    mimeType: 'image/png',
    filesize: 877006,
    width: 1024,
    height: 1024,
    url: '/media/sokheng_chicken_dish.png'
  },
  {
    alt: 'Fresh Sushi',
    filename: 'sokheng_salad_appetizer.png',
    mimeType: 'image/png',
    filesize: 883460,
    width: 1024,
    height: 1024,
    url: '/media/sokheng_salad_appetizer.png'
  }
];

const restaurants = [
  {
    title: 'Pizza Palace',
    description: 'Best pizza in town with authentic Italian recipes',
    address: '123 Main Street',
    deliveryTime: '45',
    deliveryPrice: 5,
    freeAfterAmount: 100,
    workingHours: {
      openTime: '10:00',
      closeTime: '23:00'
    },
    isClosed: false,
    isDelivery: true,
    budgetCategory: '2',
    isBlocked: false
  },
  {
    title: 'Burger House',
    description: 'Gourmet burgers and American classics',
    address: '456 Oak Avenue',
    deliveryTime: '30',
    deliveryPrice: 4,
    freeAfterAmount: 80,
    workingHours: {
      openTime: '11:00',
      closeTime: '22:00'
    },
    isClosed: false,
    isDelivery: true,
    budgetCategory: '1',
    isBlocked: false
  },
  {
    title: 'Sushi Master',
    description: 'Fresh Japanese sushi and sashimi',
    address: '789 Pine Road',
    deliveryTime: '60',
    deliveryPrice: 8,
    freeAfterAmount: 150,
    workingHours: {
      openTime: '12:00',
      closeTime: '22:30'
    },
    isClosed: false,
    isDelivery: true,
    budgetCategory: '3',
    isBlocked: false
  }
];

const dishes = [
  {
    title: 'Margherita Pizza',
    description: 'Classic pizza with tomato sauce, mozzarella, and basil',
    price: 12.99,
    gram: 350,
    availableAmount: 20,
    cookTime: 25,
    isBlocked: false
  },
  {
    title: 'Pepperoni Pizza',
    description: 'Pizza topped with pepperoni and extra cheese',
    price: 14.99,
    gram: 400,
    availableAmount: 15,
    cookTime: 25,
    isBlocked: false
  },
  {
    title: 'Classic Burger',
    description: 'Beef patty with lettuce, tomato, and special sauce',
    price: 8.99,
    gram: 250,
    availableAmount: 25,
    cookTime: 15,
    isBlocked: false
  },
  {
    title: 'Cheeseburger',
    description: 'Classic burger with extra cheese',
    price: 9.99,
    gram: 280,
    availableAmount: 20,
    cookTime: 15,
    isBlocked: false
  },
  {
    title: 'California Roll',
    description: 'Crab, avocado, and cucumber roll',
    price: 10.99,
    gram: 200,
    availableAmount: 30,
    cookTime: 20,
    isBlocked: false
  },
  {
    title: 'Salmon Nigiri',
    description: 'Fresh salmon over seasoned rice',
    price: 8.99,
    gram: 100,
    availableAmount: 25,
    cookTime: 15,
    isBlocked: false
  }
];

const customers = [
  {
    email: 'customer1@example.com',
    password: 'Customer123456!',
    name: 'John Doe',
    phone: '+1234567890',
    roles: ['guest']
  },
  {
    email: 'customer2@example.com',
    password: 'Customer123456!',
    name: 'Jane Smith',
    phone: '+0987654321',
    roles: ['guest']
  },
  {
    email: 'restaurant1@example.com',
    password: 'Restaurant123456!',
    name: 'Restaurant Owner 1',
    phone: '+1122334455',
    roles: ['author']
  }
];

async function seedDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('food-delivery-app');

    // Clear existing data
    console.log('Clearing existing data...');
    await db.collection('cities').deleteMany({});
    await db.collection('categories').deleteMany({});
    await db.collection('customers').deleteMany({});
    await db.collection('restaurants').deleteMany({});
    await db.collection('dishes').deleteMany({});
    await db.collection('orders').deleteMany({});
    await db.collection('media').deleteMany({});

    // Insert cities
    console.log('Seeding cities...');
    const cityResult = await db.collection('cities').insertMany(cities);
    const cityIds = cityResult.insertedIds;

    // Insert Media
    console.log('Seeding media...');
    const mediaWithTimestamps = mediaItems.map(item => ({
      ...item,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    const mediaResult = await db.collection('media').insertMany(mediaWithTimestamps);
    const mediaIds = mediaResult.insertedIds;

    // Insert categories
    console.log('Seeding categories...');
    const categoryResult = await db.collection('categories').insertMany(categories);
    const categoryIds = categoryResult.insertedIds;

    // Insert customers with proper password hashing
    console.log('Seeding customers...');
    const hashedCustomers = await Promise.all(
      customers.map(async (customer) => {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(customer.password, salt);
        return {
          ...customer,
          salt,
          hash,
          loginAttempts: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      })
    );
    const customerResult = await db.collection('customers').insertMany(hashedCustomers);
    const customerIds = customerResult.insertedIds;

    // Insert restaurants
    console.log('Seeding restaurants...');
    const restaurantsWithRelations = restaurants.map((restaurant, index) => ({
      ...restaurant,
      relatedToUser: customerIds[2], // Restaurant owner
      cities: [cityIds[0]], // Phnom Penh matches first city
      bannerImage: mediaIds[index % 3], // Assign media image - FIXED FIELD NAME
      categories: [
        categoryIds[5], // Fast Food
        categoryIds[6]  // Fine Dining
      ].slice(0, index + 1),
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    const restaurantResult = await db.collection('restaurants').insertMany(restaurantsWithRelations);
    const restaurantIds = restaurantResult.insertedIds;

    // Insert dishes
    console.log('Seeding dishes...');
    const dishesWithRelations = dishes.map((dish, index) => {
      let restaurantIndex = 0;
      let categoryIndex = 0;

      if (index < 2) {
        restaurantIndex = 0; // Pizza Palace
        categoryIndex = 0; // Pizza
      } else if (index < 4) {
        restaurantIndex = 1; // Burger House
        categoryIndex = 1; // Burger
      } else {
        restaurantIndex = 2; // Sushi Master
        categoryIndex = 2; // Sushi
      }

      return {
        ...dish,
        restaurant: restaurantIds[restaurantIndex],
        categories: [categoryIds[categoryIndex]],
        createdBy: customerIds[2], // Restaurant owner
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });
    const dishResult = await db.collection('dishes').insertMany(dishesWithRelations);
    const dishIds = dishResult.insertedIds;

    // Insert sample orders
    console.log('Seeding orders...');
    const orders = [
      {
        city: 'Phnom Penh',
        district: 'Central',
        apartment: '5A',
        houseNumber: '123',
        entrance: 'A',
        phoneNumber: 1234567890,
        orderStatus: 'delivered',
        totalAmount: 27.98,
        deliveryPrice: 0,
        restaurantName: 'Pizza Palace',
        commentToCourier: 'Please call when arriving',
        commentToRestaurant: 'Extra napkins please',
        isDelivery: true,
        dishes: [
          { dish: dishIds[0], quantity: 2 }, // 2x Margherita Pizza
        ],
        restaurantID: restaurantIds[0],
        orderedByUser: customerIds[0],
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        updatedAt: new Date()
      },
      {
        city: 'Phnom Penh',
        district: 'North',
        apartment: '10B',
        houseNumber: '456',
        entrance: 'B',
        phoneNumber: 9876543210,
        orderStatus: 'pending',
        totalAmount: 19.98,
        deliveryPrice: 4,
        restaurantName: 'Burger House',
        commentToCourier: '',
        commentToRestaurant: 'No onions please',
        isDelivery: true,
        dishes: [
          { dish: dishIds[2], quantity: 1 }, // 1x Classic Burger
          { dish: dishIds[3], quantity: 1 }, // 1x Cheeseburger
        ],
        restaurantID: restaurantIds[1],
        orderedByUser: customerIds[1],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await db.collection('orders').insertMany(orders);

    console.log('Database seeded successfully!');
    console.log('\nSeeded data summary:');
    console.log(`- Cities: ${cities.length}`);
    console.log(`- Categories: ${categories.length}`);
    console.log(`- Customers: ${customers.length}`);
    console.log(`- Restaurants: ${restaurants.length}`);
    console.log(`- Dishes: ${dishes.length}`);
    console.log(`- Orders: ${orders.length}`);

    console.log('\nLogin credentials:');
    console.log('Admin: admin@example.com / Admin123456!');
    console.log('Customer 1: customer1@example.com / Customer123456!');
    console.log('Customer 2: customer2@example.com / Customer123456!');
    console.log('Restaurant Owner: restaurant1@example.com / Restaurant123456!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
  }
}

seedDatabase();
