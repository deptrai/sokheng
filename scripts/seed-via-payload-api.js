const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const API_URL = 'http://localhost:3000/api';

// [ASSUMPTION: Using the existing admin user created through admin panel to authenticate]
const ADMIN_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'Admin123456!'
};

// Users to create
const usersToCreate = [
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

// Cities to create
const citiesToCreate = [
  { title: 'Turkmenabat' },
  { title: 'Ashgabat' },
  { title: 'Turkmenbashi' },
  { title: 'Mary' },
  { title: 'Dashoguz' }
];

// Categories to create
const categoriesToCreate = [
  { category: 'Phở', value: 'pho', type: 'dish', order: 1 },
  { category: 'Bún', value: 'bun', type: 'dish', order: 2 },
  { category: 'Cơm', value: 'com', type: 'dish', order: 3 },
  { category: 'Bánh mì', value: 'banh-mi', type: 'dish', order: 4 },
  { category: 'Món nướng', value: 'mon-nuong', type: 'dish', order: 5 },
  { category: 'Món chiên', value: 'mon-chien', type: 'dish', order: 6 },
  { category: 'Vietnamese', value: 'vietnamese', type: 'restaurant', order: 1 },
  { category: 'Street Food', value: 'street-food', type: 'restaurant', order: 2 },
  { category: 'Traditional', value: 'traditional', type: 'restaurant', order: 3 }
];

async function createFirstAdmin() {
  try {
    console.log('Creating first admin user...');
    const response = await axios.post(
      `${API_URL}/customers`,
      {
        email: ADMIN_CREDENTIALS.email,
        password: ADMIN_CREDENTIALS.password,
        name: 'Admin User',
        phone: '+1234567890',
        roles: ['admin']
      }
    );
    console.log('✓ First admin user created');
    return response.data;
  } catch (error) {
    console.log('Note: Admin user might already exist');
    return null;
  }
}

async function loginAsAdmin() {
  try {
    console.log('Logging in as admin...');
    const response = await axios.post(`${API_URL}/customers/login`, ADMIN_CREDENTIALS);
    console.log('✓ Admin login successful');
    return response.data.token;
  } catch (error) {
    console.error('✗ Admin login failed:', error.response?.data || error.message);
    throw error;
  }
}

async function createUsers(token) {
  console.log('\nCreating users...');
  const createdUsers = [];
  
  for (const user of usersToCreate) {
    try {
      const response = await axios.post(
        `${API_URL}/customers`,
        user,
        {
          headers: {
            'Authorization': `JWT ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      createdUsers.push(response.data.doc);
      console.log(`✓ Created user: ${user.email}`);
    } catch (error) {
      console.log(`Note: User ${user.email} might already exist`);
      // Try to find existing user
      try {
        const existingUser = await axios.get(
          `${API_URL}/customers?where[email][equals]=${user.email}`,
          {
            headers: {
              'Authorization': `JWT ${token}`
            }
          }
        );
        if (existingUser.data.docs && existingUser.data.docs.length > 0) {
          createdUsers.push(existingUser.data.docs[0]);
          console.log(`✓ Using existing user: ${user.email}`);
        }
      } catch (findError) {
        console.error(`✗ Could not find user ${user.email}`);
      }
    }
  }
  
  return createdUsers;
}

async function createCities(token) {
  console.log('\nCreating cities...');
  const createdCities = [];
  
  for (const city of citiesToCreate) {
    try {
      const response = await axios.post(
        `${API_URL}/cities`,
        city,
        {
          headers: {
            'Authorization': `JWT ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      createdCities.push(response.data.doc);
      console.log(`✓ Created city: ${city.title}`);
    } catch (error) {
      console.error(`✗ Failed to create city ${city.title}:`, error.response?.data || error.message);
    }
  }
  
  return createdCities;
}

async function createCategories(token) {
  console.log('\nCreating categories...');
  
  // First, try to get existing categories
  try {
    const existingResponse = await axios.get(`${API_URL}/categories?limit=100`, {
      headers: { 'Authorization': `JWT ${token}` }
    });
    
    if (existingResponse.data.docs && existingResponse.data.docs.length > 0) {
      console.log(`Found ${existingResponse.data.docs.length} existing categories, using them`);
      return existingResponse.data.docs;
    }
  } catch (error) {
    console.log('No existing categories found, creating new ones...');
  }
  
  const createdCategories = [];
  
  for (const category of categoriesToCreate) {
    try {
      const response = await axios.post(
        `${API_URL}/categories`,
        category,
        {
          headers: {
            'Authorization': `JWT ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      createdCategories.push(response.data.doc);
      console.log(`✓ Created category: ${category.category}`);
    } catch (error) {
      console.log(`Note: Category ${category.category} might already exist`);
    }
  }
  
  // Get all categories after creation
  const finalResponse = await axios.get(`${API_URL}/categories?limit=100`, {
    headers: { 'Authorization': `JWT ${token}` }
  });
  
  return finalResponse.data.docs;
}

async function createRestaurants(token, cities, categories, restaurantOwner) {
  console.log('\nCreating restaurants...');
  
  const restaurants = [
    {
      title: 'Phở Hà Nội',
      description: 'Authentic Hanoi-style pho with traditional recipes',
      address: '123 Lê Lợi Street',
      deliveryTime: '30',
      deliveryPrice: 3,
      freeAfterAmount: 50,
      workingHours: {
        openTime: '0700',
        closeTime: '2200'
      },
      isClosed: false,
      isDelivery: true,
      budgetCategory: '1',
      isBlocked: false,
      relatedToUser: restaurantOwner.id,
      cities: [cities[0].id],
      categories: [categories[6].id, categories[8].id],
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400'
    },
    {
      title: 'Bún Chả Sài Gòn',
      description: 'Delicious grilled pork with vermicelli noodles',
      address: '456 Nguyễn Huệ Boulevard',
      deliveryTime: '30',
      deliveryPrice: 2,
      freeAfterAmount: 40,
      workingHours: {
        openTime: '0800',
        closeTime: '2100'
      },
      isClosed: false,
      isDelivery: true,
      budgetCategory: '1',
      isBlocked: false,
      relatedToUser: restaurantOwner.id,
      cities: [cities[0].id],
      categories: [categories[7].id],
      imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400'
    },
    {
      title: 'Cơm Tấm Sườn Nướng',
      description: 'Broken rice with grilled pork chop and traditional sides',
      address: '789 Trần Hưng Đạo Street',
      deliveryTime: '45',
      deliveryPrice: 3,
      freeAfterAmount: 60,
      workingHours: {
        openTime: '0900',
        closeTime: '2200'
      },
      isClosed: false,
      isDelivery: true,
      budgetCategory: '2',
      isBlocked: false,
      relatedToUser: restaurantOwner.id,
      cities: [cities[0].id],
      categories: [categories[6].id, categories[8].id],
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'
    },
    {
      title: 'Quán Miền Tây',
      description: 'Traditional Western Vietnamese cuisine with authentic flavors',
      address: '321 Cái Bè Street',
      deliveryTime: '60',
      deliveryPrice: 4,
      freeAfterAmount: 80,
      workingHours: {
        openTime: '1000',
        closeTime: '2100'
      },
      isClosed: false,
      isDelivery: true,
      budgetCategory: '2',
      isBlocked: false,
      relatedToUser: restaurantOwner.id,
      cities: [cities[0].id],
      categories: [categories[6].id, categories[7].id],
      imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400'
    },
    {
      title: 'Nhà Hàng Sài Gòn',
      description: 'Southern Vietnamese cuisine with authentic recipes',
      address: '654 Đồng Khởi Street',
      deliveryTime: '45',
      deliveryPrice: 3,
      freeAfterAmount: 70,
      workingHours: {
        openTime: '0900',
        closeTime: '2200'
      },
      isClosed: false,
      isDelivery: true,
      budgetCategory: '2',
      isBlocked: false,
      relatedToUser: restaurantOwner.id,
      cities: [cities[0].id],
      categories: [categories[6].id, categories[7].id],
      imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400'
    },
    {
      title: 'Bếp Nhà Miền Nam',
      description: 'Homestyle Southern Vietnamese cooking',
      address: '987 Võ Văn Kiệt Street',
      deliveryTime: '30',
      deliveryPrice: 2,
      freeAfterAmount: 50,
      workingHours: {
        openTime: '0800',
        closeTime: '2100'
      },
      isClosed: false,
      isDelivery: true,
      budgetCategory: '1',
      isBlocked: false,
      relatedToUser: restaurantOwner.id,
      cities: [cities[0].id],
      categories: [categories[6].id, categories[7].id],
      imageUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400'
    }
  ];
  
  // Upload banner images and prepare restaurants
  const restaurantsWithBanner = [];
  for (const restaurantData of restaurants) {
    let bannerImageId = null;
    if (restaurantData.imageUrl) {
      bannerImageId = await uploadMedia(token, restaurantData.imageUrl, restaurantData.title + ' banner');
    }
    
    const restaurant = {
      title: restaurantData.title,
      description: restaurantData.description,
      address: restaurantData.address,
      deliveryTime: restaurantData.deliveryTime,
      deliveryPrice: restaurantData.deliveryPrice,
      freeAfterAmount: restaurantData.freeAfterAmount,
      workingHours: restaurantData.workingHours,
      isClosed: restaurantData.isClosed,
      isDelivery: restaurantData.isDelivery,
      budgetCategory: restaurantData.budgetCategory,
      isBlocked: restaurantData.isBlocked,
      relatedToUser: restaurantData.relatedToUser,
      cities: restaurantData.cities,
      categories: restaurantData.categories
    };
    
    if (bannerImageId) {
      restaurant.bannerImage = bannerImageId;
    }
    
    restaurantsWithBanner.push(restaurant);
  }
  
  const createdRestaurants = [];
  
  for (const restaurant of restaurantsWithBanner) {
    try {
      const response = await axios.post(
        `${API_URL}/restaurants`,
        restaurant,
        {
          headers: {
            'Authorization': `JWT ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      createdRestaurants.push(response.data.doc);
      console.log(`✓ Created restaurant: ${restaurant.title}`);
    } catch (error) {
      console.error(`✗ Failed to create restaurant ${restaurant.title}:`, error.response?.data || error.message);
    }
  }
  
  return createdRestaurants;
}

async function uploadMedia(token, imageUrl, alt) {
  try {
    // Download image from URL
    const response = await axios.get(imageUrl, { responseType: 'stream' });
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    
    // Generate unique filename
    const urlParts = imageUrl.split('/');
    const filename = urlParts[urlParts.length - 1].split('?')[0] || 'image.jpg';
    const uniqueFilename = Date.now() + '-' + filename;
    const tempPath = path.join(tempDir, uniqueFilename);
    
    const writer = fs.createWriteStream(tempPath);
    
    response.data.pipe(writer);
    
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
    
    // Check if file exists and has content
    if (!fs.existsSync(tempPath) || fs.statSync(tempPath).size === 0) {
      throw new Error('Downloaded file is empty or does not exist');
    }
    
    // Upload to Payload using form-data
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('file', fs.createReadStream(tempPath), {
      filename: uniqueFilename,
      contentType: 'image/jpeg'
    });
    formData.append('alt', alt);
    
    const uploadResponse = await axios.post(
      `${API_URL}/media/`,
      formData,
      {
        headers: {
          'Authorization': `JWT ${token}`,
          ...formData.getHeaders()
        }
      }
    );
    
    // Clean up temp file
    fs.unlinkSync(tempPath);
    
    return uploadResponse.data.doc.id;
  } catch (error) {
    console.error(`Failed to upload media from ${imageUrl}:`, error.message);
    // Clean up temp file if exists
    const tempDir = path.join(__dirname, 'temp');
    const urlParts = imageUrl.split('/');
    const filename = urlParts[urlParts.length - 1].split('?')[0] || 'image.jpg';
    const uniqueFilename = Date.now() + '-' + filename;
    const tempPath = path.join(tempDir, uniqueFilename);
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    return null;
  }
}

async function createDishes(token, restaurants, categories) {
  console.log('\nCreating dishes...');
  
  // Define dishes with image URLs
  const dishesWithImages = [
    // Phở dishes (Miền Bắc) - Restaurant 0: Phở Hà Nội
    {
      title: 'Phở Bò',
      description: 'Beef noodle soup with rice noodles, herbs, and spices',
      price: 5.99,
      gram: 500,
      availableAmount: 30,
      cookTime: 20,
      isBlocked: false,
      restaurant: restaurants[0].id,
      categories: [categories[0].id],
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400'
    },
    {
      title: 'Phở Gà',
      description: 'Chicken noodle soup with rice noodles and fresh herbs',
      price: 5.49,
      gram: 480,
      availableAmount: 25,
      cookTime: 18,
      isBlocked: false,
      restaurant: restaurants[0].id,
      categories: [categories[0].id],
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400'
    },
    {
      title: 'Phở Tái',
      description: 'Beef flank noodle soup with tripe and herbs',
      price: 6.99,
      gram: 520,
      availableAmount: 20,
      cookTime: 25,
      isBlocked: false,
      restaurant: restaurants[0].id,
      categories: [categories[0].id],
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400'
    },
    {
      title: 'Phở Cuốn',
      description: 'Mixed beef and pork noodle soup',
      price: 7.99,
      gram: 550,
      availableAmount: 25,
      cookTime: 30,
      isBlocked: false,
      restaurant: restaurants[0].id,
      categories: [categories[0].id],
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400'
    },
    {
      title: 'Phở Sốt',
      description: 'Beef tripe and flank noodle soup',
      price: 8.99,
      gram: 480,
      availableAmount: 15,
      cookTime: 28,
      isBlocked: false,
      restaurant: restaurants[0].id,
      categories: [categories[0].id],
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400'
    },
    
    // Bún dishes (Miền Trung) - Restaurant 1: Bún Chả Sài Gòn
    {
      title: 'Bún Chả Hà Nội',
      description: 'Grilled pork with vermicelli noodles and dipping sauce',
      price: 6.99,
      gram: 400,
      availableAmount: 20,
      cookTime: 25,
      isBlocked: false,
      restaurant: restaurants[1].id,
      categories: [categories[1].id, categories[4].id],
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400'
    },
    {
      title: 'Bún Bò Huế',
      description: 'Spicy beef noodle soup from Hue',
      price: 6.49,
      gram: 520,
      availableAmount: 18,
      cookTime: 22,
      isBlocked: false,
      restaurant: restaurants[1].id,
      categories: [categories[1].id],
      imageUrl: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400'
    },
    {
      title: 'Bún Thịt Nướng',
      description: 'Grilled pork skewers with vermicelli noodles',
      price: 7.99,
      gram: 420,
      availableAmount: 15,
      cookTime: 30,
      isBlocked: false,
      restaurant: restaurants[1].id,
      categories: [categories[1].id, categories[4].id],
      imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400'
    },
    {
      title: 'Bún Rau Mắm',
      description: 'Fresh herbs and vegetables with vermicelli noodles',
      price: 5.99,
      gram: 350,
      availableAmount: 25,
      cookTime: 15,
      isBlocked: false,
      restaurant: restaurants[1].id,
      categories: [categories[1].id],
      imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400'
    },
    {
      title: 'Bún Đậu Mắm',
      description: 'Fermented shrimp and pork with vermicelli noodles',
      price: 8.99,
      gram: 450,
      availableAmount: 12,
      cookTime: 35,
      isBlocked: false,
      restaurant: restaurants[1].id,
      categories: [categories[1].id],
      imageUrl: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400'
    },
    
    // Cơm dishes (Miền Nam) - Restaurant 2: Cơm Tấm Sườn Nướng
    {
      title: 'Cơm Tấm Sườn Bì Chả',
      description: 'Broken rice with grilled pork chop, egg, and pickled vegetables',
      price: 7.99,
      gram: 450,
      availableAmount: 25,
      cookTime: 20,
      isBlocked: false,
      restaurant: restaurants[2].id,
      categories: [categories[2].id, categories[4].id],
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400'
    },
    {
      title: 'Cơm Gà Xối Mỡ',
      description: 'Chicken rice with crispy skin and fragrant rice',
      price: 7.49,
      gram: 420,
      availableAmount: 22,
      cookTime: 18,
      isBlocked: false,
      restaurant: restaurants[2].id,
      categories: [categories[2].id],
      imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400'
    },
    {
      title: 'Cơm Chiên Trộn',
      description: 'Mixed broken rice with various toppings',
      price: 8.99,
      gram: 480,
      availableAmount: 20,
      cookTime: 15,
      isBlocked: false,
      restaurant: restaurants[2].id,
      categories: [categories[2].id],
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'
    },
    {
      title: 'Cơm Sườn Nướng',
      description: 'Grilled pork chop with broken rice and vegetables',
      price: 9.99,
      gram: 500,
      availableAmount: 18,
      cookTime: 25,
      isBlocked: false,
      restaurant: restaurants[2].id,
      categories: [categories[2].id, categories[4].id],
      imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400'
    },
    {
      title: 'Cơm Tấm Chả Lá',
      description: 'Broken rice with fried pork belly and egg',
      price: 8.49,
      gram: 470,
      availableAmount: 20,
      cookTime: 22,
      isBlocked: false,
      restaurant: restaurants[2].id,
      categories: [categories[2].id],
      imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400'
    },
    
    // Bánh mì (Miền Nam) - Restaurant 3: Quán Miền Tây
    {
      title: 'Bánh Mì Kẹp',
      description: 'Traditional Vietnamese baguette with various fillings',
      price: 2.99,
      gram: 120,
      availableAmount: 30,
      cookTime: 10,
      isBlocked: false,
      restaurant: restaurants[3].id,
      categories: [categories[3].id],
      imageUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400'
    },
    {
      title: 'Bánh Mì Thịt',
      description: 'Vietnamese sandwich with grilled pork and herbs',
      price: 3.99,
      gram: 150,
      availableAmount: 25,
      cookTime: 8,
      isBlocked: false,
      restaurant: restaurants[3].id,
      categories: [categories[3].id],
      imageUrl: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400'
    },
    
    // Món nướng (Miền Nam) - Restaurant 4: Nhà Hàng Sài Gòn
    {
      title: 'Thịt Nướng Bò',
      description: 'Grilled beef skewers with peanut dipping sauce',
      price: 12.99,
      gram: 300,
      availableAmount: 15,
      cookTime: 30,
      isBlocked: false,
      restaurant: restaurants[4].id,
      categories: [categories[4].id],
      imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400'
    },
    {
      title: 'Nem Nướng Sườn',
      description: 'Grilled pork belly with fish sauce and herbs',
      price: 10.99,
      gram: 250,
      availableAmount: 12,
      cookTime: 25,
      isBlocked: false,
      restaurant: restaurants[4].id,
      categories: [categories[4].id],
      imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400'
    },
    {
      title: 'Gà Nướng Sả',
      description: 'Grilled chicken with lemongrass and chili sauce',
      price: 9.99,
      gram: 280,
      availableAmount: 18,
      cookTime: 25,
      isBlocked: false,
      restaurant: restaurants[4].id,
      categories: [categories[4].id],
      imageUrl: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400'
    },
    {
      title: 'Lẩu Nướng Mắm',
      description: 'Grilled pork with lemongrass and fish sauce',
      price: 11.99,
      gram: 320,
      availableAmount: 10,
      cookTime: 35,
      isBlocked: false,
      restaurant: restaurants[4].id,
      categories: [categories[4].id],
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400'
    },
    
    // Món chiên (Miền Nam) - Restaurant 5: Bếp Nhà Miền Nam
    {
      title: 'Gà Chiên',
      description: 'Roasted chicken with lemongrass and chili',
      price: 8.99,
      gram: 300,
      availableAmount: 20,
      cookTime: 45,
      isBlocked: false,
      restaurant: restaurants[5].id,
      categories: [categories[5].id],
      imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400'
    },
    {
      title: 'Vịt Chiên',
      description: 'Grilled duck with bamboo shoots and fish sauce',
      price: 15.99,
      gram: 350,
      availableAmount: 8,
      cookTime: 40,
      isBlocked: false,
      restaurant: restaurants[5].id,
      categories: [categories[5].id],
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'
    },
    {
      title: 'Lẩu Chiên',
      description: 'Grilled pork with lemongrass and herbs',
      price: 13.99,
      gram: 300,
      availableAmount: 12,
      cookTime: 35,
      isBlocked: false,
      restaurant: restaurants[5].id,
      categories: [categories[5].id],
      imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400'
    },
    {
      title: 'Heo Chiên',
      description: 'Grilled beef with bamboo shoots and herbs',
      price: 14.99,
      gram: 280,
      availableAmount: 10,
      cookTime: 30,
      isBlocked: false,
      restaurant: restaurants[5].id,
      categories: [categories[5].id],
      imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400'
    },
    
    // Món canh (Miền Nam) - Restaurant 3: Quán Miền Tây
    {
      title: 'Canh Chua',
      description: 'Vietnamese braised pork with herbs and vegetables',
      price: 9.99,
      gram: 350,
      availableAmount: 15,
      cookTime: 45,
      isBlocked: false,
      restaurant: restaurants[3].id,
      categories: [categories[5].id],
      imageUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400'
    },
    {
      title: 'Canh Ngang',
      description: 'Grilled pork belly with fish sauce and vegetables',
      price: 8.99,
      gram: 300,
      availableAmount: 18,
      cookTime: 40,
      isBlocked: false,
      restaurant: restaurants[3].id,
      categories: [categories[5].id],
      imageUrl: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400'
    },
    {
      title: 'Canh Thịt',
      description: 'Vietnamese braised pork with pickled vegetables',
      price: 8.49,
      gram: 280,
      availableAmount: 20,
      cookTime: 50,
      isBlocked: false,
      restaurant: restaurants[3].id,
      categories: [categories[5].id],
      imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400'
    },
    {
      title: 'Canh Rang',
      description: 'Grilled pork belly with sweet and sour sauce',
      price: 9.49,
      gram: 320,
      availableAmount: 12,
      cookTime: 35,
      isBlocked: false,
      restaurant: restaurants[3].id,
      categories: [categories[5].id],
      imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400'
    },
    
    // Món xào (Miền Nam) - Restaurant 4: Nhà Hàng Sài Gòn
    {
      title: 'Xào Gà',
      description: 'Stir-fried chicken with lemongrass and chili',
      price: 6.99,
      gram: 250,
      availableAmount: 22,
      cookTime: 15,
      isBlocked: false,
      restaurant: restaurants[4].id,
      categories: [categories[5].id],
      imageUrl: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400'
    },
    {
      title: 'Xào Lá',
      description: 'Stir-fried vegetables with herbs',
      price: 4.99,
      gram: 200,
      availableAmount: 30,
      cookTime: 10,
      isBlocked: false,
      restaurant: restaurants[4].id,
      categories: [categories[5].id],
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400'
    },
    {
      title: 'Xào Tôm',
      description: 'Stir-fried rice with vegetables and egg',
      price: 5.99,
      gram: 300,
      availableAmount: 25,
      cookTime: 12,
      isBlocked: false,
      restaurant: restaurants[4].id,
      categories: [categories[5].id],
      imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400'
    },
    {
      title: 'Xào Mắm',
      description: 'Stir-fried vegetables with herbs and garlic',
      price: 5.49,
      gram: 220,
      availableAmount: 28,
      cookTime: 8,
      isBlocked: false,
      restaurant: restaurants[4].id,
      categories: [categories[5].id],
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'
    },
    
    // Món ăn vặt (Miền Nam) - Restaurant 3: Quán Miền Tây
    {
      title: 'Xôi Gà',
      description: 'Sticky rice with shredded chicken and herbs',
      price: 4.99,
      gram: 300,
      availableAmount: 20,
      cookTime: 15,
      isBlocked: false,
      restaurant: restaurants[3].id,
      categories: [categories[3].id],
      imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400'
    },
    {
      title: 'Xôi Mặn',
      description: 'Savory sticky rice with mung beans and Chinese sausage',
      price: 3.99,
      gram: 250,
      availableAmount: 25,
      cookTime: 10,
      isBlocked: false,
      restaurant: restaurants[3].id,
      categories: [categories[3].id],
      imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400'
    },
    {
      title: 'Xôi Ngọt',
      description: 'Sweet sticky rice with coconut and mung beans',
      price: 2.99,
      gram: 200,
      availableAmount: 30,
      cookTime: 8,
      isBlocked: false,
      restaurant: restaurants[3].id,
      categories: [categories[3].id],
      imageUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400'
    },
    {
      title: 'Nước Rau Má',
      description: 'Traditional Vietnamese pennywort drink',
      price: 1.99,
      gram: 300,
      availableAmount: 40,
      cookTime: 5,
      isBlocked: false,
      restaurant: restaurants[3].id,
      categories: [categories[3].id],
      imageUrl: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400'
    },
    {
      title: 'Nước Ép Cam',
      description: 'Fresh orange juice',
      price: 2.49,
      gram: 250,
      availableAmount: 35,
      cookTime: 5,
      isBlocked: false,
      restaurant: restaurants[3].id,
      categories: [categories[3].id],
      imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400'
    },
    {
      title: 'Nước Ép Thơm',
      description: 'Fresh pineapple juice',
      price: 2.49,
      gram: 250,
      availableAmount: 35,
      cookTime: 5,
      isBlocked: false,
      restaurant: restaurants[3].id,
      categories: [categories[3].id],
      imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400'
    },
    {
      title: 'Nước Ép Dứa',
      description: 'Fresh pineapple juice',
      price: 2.49,
      gram: 250,
      availableAmount: 35,
      cookTime: 5,
      isBlocked: false,
      restaurant: restaurants[3].id,
      categories: [categories[3].id],
      imageUrl: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400'
    },
    {
      title: 'Chè Ba Màu',
      description: 'Three-color sweet soup with mung beans, jelly, and coconut milk',
      price: 2.99,
      gram: 350,
      availableAmount: 25,
      cookTime: 10,
      isBlocked: false,
      restaurant: restaurants[3].id,
      categories: [categories[3].id],
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400'
    },
    {
      title: 'Chè Khúc Bạch',
      description: 'Almond jelly with lychee and coconut milk',
      price: 3.49,
      gram: 300,
      availableAmount: 20,
      cookTime: 15,
      isBlocked: false,
      restaurant: restaurants[3].id,
      categories: [categories[3].id],
      imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400'
    },
    {
      title: 'Kem Dừa',
      description: 'Coconut ice cream',
      price: 1.99,
      gram: 100,
      availableAmount: 30,
      cookTime: 5,
      isBlocked: false,
      restaurant: restaurants[3].id,
      categories: [categories[3].id],
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'
    },
    {
      title: 'Bắp Xào Bơ',
      description: 'Stir-fried corn with butter',
      price: 3.99,
      gram: 200,
      availableAmount: 25,
      cookTime: 8,
      isBlocked: false,
      restaurant: restaurants[3].id,
      categories: [categories[3].id],
      imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400'
    },
    {
      title: 'Khoai Tây Chiên',
      description: 'French fries with salt',
      price: 2.99,
      gram: 150,
      availableAmount: 30,
      cookTime: 10,
      isBlocked: false,
      restaurant: restaurants[3].id,
      categories: [categories[3].id],
      imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400'
    }
  ];
  
  // Upload media and prepare dishes
  const dishes = [];
  for (const dishWithImage of dishesWithImages) {
    let imageId = null;
    if (dishWithImage.imageUrl) {
      imageId = await uploadMedia(token, dishWithImage.imageUrl, dishWithImage.title);
    }
    
    const dish = {
      title: dishWithImage.title,
      description: dishWithImage.description,
      price: dishWithImage.price,
      gram: dishWithImage.gram,
      availableAmount: dishWithImage.availableAmount,
      cookTime: dishWithImage.cookTime,
      isBlocked: dishWithImage.isBlocked,
      restaurant: dishWithImage.restaurant,
      categories: dishWithImage.categories
    };
    
    if (imageId) {
      dish.image = imageId;
    }
    
    dishes.push(dish);
  }
  
  const createdDishes = [];
  
  for (const dish of dishes) {
    try {
      const response = await axios.post(
        `${API_URL}/dishes/`,
        dish,
        {
          headers: {
            'Authorization': `JWT ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      createdDishes.push(response.data.doc);
      console.log(`✓ Created dish: ${dish.title}`);
    } catch (error) {
      console.error(`✗ Failed to create dish ${dish.title}:`, error.response?.data || error.message);
    }
  }
  
  return createdDishes;
}

async function updateRestaurantsWithDishes(token, restaurants) {
  console.log('\nUpdating restaurants with dishes...');
  
  // Fetch all dishes from API
  const dishesResponse = await axios.get(`${API_URL}/dishes?limit=100`, {
    headers: { 'Authorization': `JWT ${token}` }
  });
  const allDishes = dishesResponse.data.docs;
  
  for (const restaurant of restaurants) {
    // Filter dishes by restaurant ID (handle both string and object)
    const restaurantDishes = allDishes.filter(d => {
      const restaurantId = typeof d.restaurant === 'string' ? d.restaurant : d.restaurant?.id;
      return restaurantId === restaurant.id;
    });
    const dishIds = restaurantDishes.map(d => d.id);
    
    if (dishIds.length > 0) {
      try {
        await axios.patch(
          `${API_URL}/restaurants/${restaurant.id}`,
          { dishes: dishIds },
          {
            headers: {
              'Authorization': `JWT ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log(`✓ Updated ${restaurant.title} with ${dishIds.length} dishes`);
      } catch (error) {
        console.error(`✗ Failed to update ${restaurant.title}:`, error.response?.data || error.message);
      }
    }
  }
}

async function seedDatabase() {
  try {
    console.log('=== Starting Payload API Seeder ===\n');
    
    // Step 0: Create first admin if doesn't exist
    await createFirstAdmin();
    
    // Step 1: Login as admin
    const token = await loginAsAdmin();
    
    // Step 2: Create users
    const users = await createUsers(token);
    
    // Step 3: Create cities
    const cities = await createCities(token);
    
    // Step 4: Create categories
    const categories = await createCategories(token);
    
    // Step 5: Create restaurants (using restaurant owner)
    const restaurantOwner = users.find(u => u.email === 'restaurant1@example.com');
    const restaurants = await createRestaurants(token, cities, categories, restaurantOwner);
    
    // Step 6: Create dishes
    const dishes = await createDishes(token, restaurants, categories);
    
    // Step 7: Update restaurants with dishes
    await updateRestaurantsWithDishes(token, restaurants);
    
    console.log('\n=== Seeding Complete ===');
    console.log(`✓ Users: ${users.length}`);
    console.log(`✓ Cities: ${cities.length}`);
    console.log(`✓ Categories: ${categories.length}`);
    console.log(`✓ Restaurants: ${restaurants.length}`);
    console.log(`✓ Dishes: ${dishes.length}`);
    
    console.log('\n=== Login Credentials ===');
    console.log('Admin: admin@example.com / Admin123456!');
    usersToCreate.forEach(user => {
      console.log(`${user.name}: ${user.email} / ${user.password}`);
    });
    
  } catch (error) {
    console.error('\n✗ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedDatabase();
