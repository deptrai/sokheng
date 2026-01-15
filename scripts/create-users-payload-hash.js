const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const uri = 'mongodb://127.0.0.1:27018/food-delivery-app';
const dbName = 'food-delivery-app';

async function createUserWithPayloadHash() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');

        const db = client.db(dbName);
        const customersCollection = db.collection('customers');

        // Delete existing test user
        await customersCollection.deleteMany({
            email: { $in: ['customer1@example.com', 'admin@ashpez.com'] }
        });
        console.log('🗑️  Deleted existing test users');

        // Create password hash using Payload CMS method
        // Payload uses bcrypt.hash() which includes salt in the hash
        const customerPassword = 'Customer123456!';
        const customerHash = await bcrypt.hash(customerPassword, 10);

        const adminPassword = 'Admin123456!';
        const adminHash = await bcrypt.hash(adminPassword, 10);

        // Create customer user
        const customer = {
            email: 'customer1@example.com',
            hash: customerHash, // Payload only needs hash, not separate salt
            name: 'John Doe',
            phone: '+1234567890',
            roles: ['guest'],
            loginAttempts: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // Create admin user
        const admin = {
            email: 'admin@ashpez.com',
            hash: adminHash,
            name: 'Admin User',
            phone: '+1234567890',
            roles: ['admin'],
            loginAttempts: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await customersCollection.insertMany([customer, admin]);

        console.log('✅ Created users:', result.insertedIds);
        console.log('\n📋 Test Credentials:');
        console.log('Customer:');
        console.log('  Email: customer1@example.com');
        console.log('  Password: Customer123456!');
        console.log('\nAdmin:');
        console.log('  Email: admin@ashpez.com');
        console.log('  Password: Admin123456!');

        // Verify hash works
        const verifyCustomer = await bcrypt.compare(customerPassword, customerHash);
        const verifyAdmin = await bcrypt.compare(adminPassword, adminHash);

        console.log('\n🔐 Hash Verification:');
        console.log('  Customer hash valid:', verifyCustomer);
        console.log('  Admin hash valid:', verifyAdmin);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        await client.close();
        console.log('\n✅ Connection closed');
        process.exit(0);
    }
}

createUserWithPayloadHash();
