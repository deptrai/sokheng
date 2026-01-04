const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGO_URI = 'mongodb://127.0.0.1:27018/food-delivery-app';

async function seed() {
  const client = new MongoClient(MONGO_URI);

  try {
    console.log('🌱 Starting seeding...\n');
    
    await client.connect();
    const db = client.db('food-delivery-app');
    const customersCollection = db.collection('customers');

    // Hash passwords
    const testPassword = await bcrypt.hash('Test123456!', 10);
    const adminPassword = await bcrypt.hash('Admin123456!', 10);

    // Create test customer
    const testCustomer = {
      email: 'test@example.com',
      password: testPassword,
      name: 'Test User',
      phone: '+1234567890',
      roles: ['user'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const testResult = await customersCollection.insertOne(testCustomer);
    console.log('✓ Created test customer:', testCustomer.email);

    // Create admin customer
    const adminCustomer = {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Admin User',
      phone: '+0987654321',
      roles: ['admin'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const adminResult = await customersCollection.insertOne(adminCustomer);
    console.log('✓ Created admin user:', adminCustomer.email);

    console.log('\n✅ Seeding completed successfully!');
    console.log('\nTest credentials:');
    console.log('Regular user: test@example.com / Test123456!');
    console.log('Admin user: admin@example.com / Admin123456!');

    await client.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seed();
