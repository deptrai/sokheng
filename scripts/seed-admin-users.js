const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// MongoDB connection
const uri = 'mongodb://127.0.0.1:27018/food-delivery-app';
const client = new MongoClient(uri);

// Admin users to create
const adminUsers = [
  {
    email: 'admin@example.com',
    password: 'Admin123456!',
    name: 'Admin User',
    phone: '+1234567890',
    roles: ['admin']
  },
  {
    email: 'admin2@example.com',
    password: 'Admin123456!',
    name: 'Second Admin',
    phone: '+0987654321',
    roles: ['admin']
  },
  {
    email: 'manager@example.com',
    password: 'Manager123456!',
    name: 'Restaurant Manager',
    phone: '+1122334455',
    roles: ['author']
  }
];

async function seedAdminUsers() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('food-delivery-app');

    // Clear existing admin users (keep only first admin if exists)
    console.log('Clearing existing admin users...');
    await db.collection('customers').deleteMany({
      email: { $in: adminUsers.map(u => u.email) }
    });

    // Insert admin users with proper Payload CMS password hashing
    console.log('Seeding admin users...');
    const hashedUsers = await Promise.all(
      adminUsers.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(user.password, salt);
        return {
          ...user,
          salt,
          hash,
          loginAttempts: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      })
    );

    const result = await db.collection('customers').insertMany(hashedUsers);
    
    console.log('Admin users seeded successfully!');
    console.log(`Created ${result.insertedCount} admin users`);
    
    console.log('\nAdmin Login Credentials:');
    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} / ${user.password}`);
    });

    // Verify the users were created
    const verification = await db.collection('customers').find({
      email: { $in: adminUsers.map(u => u.email) }
    }).toArray();
    
    console.log('\nVerification - Created users:');
    verification.forEach(user => {
      console.log(`- ${user.email} (${user.roles.join(', ')})`);
    });

  } catch (error) {
    console.error('Error seeding admin users:', error);
  } finally {
    await client.close();
  }
}

seedAdminUsers();
