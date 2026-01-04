const fetch = require('node-fetch');

const API_URL = 'http://localhost:3000';

async function seed() {
  try {
    console.log('🌱 Starting seeding...\n');

    // Create test customer
    const customerRes = await fetch(`${API_URL}/api/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Test123456!',
        name: 'Test User',
        phone: '+1234567890',
        roles: ['user'],
      }),
    });

    if (!customerRes.ok) {
      throw new Error(`Failed to create customer: ${customerRes.statusText}`);
    }

    const customer = await customerRes.json();
    console.log('✓ Created test customer:', customer.doc?.email || customer.email);

    // Create admin customer
    const adminRes = await fetch(`${API_URL}/api/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'Admin123456!',
        name: 'Admin User',
        phone: '+0987654321',
        roles: ['admin'],
      }),
    });

    if (!adminRes.ok) {
      throw new Error(`Failed to create admin: ${adminRes.statusText}`);
    }

    const admin = await adminRes.json();
    console.log('✓ Created admin user:', admin.doc?.email || admin.email);

    console.log('\n✅ Seeding completed successfully!');
    console.log('\nTest credentials:');
    console.log('Regular user: test@example.com / Test123456!');
    console.log('Admin user: admin@example.com / Admin123456!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seed();
