const fetch = require('node-fetch');

const API_URL = 'http://localhost:3000/api/graphql';

async function seed() {
  try {
    console.log('🌱 Starting seeding...\n');

    // Create test customer
    const customerQuery = `
      mutation {
        createCustomer(data: {
          email: "test@example.com"
          password: "Test123456!"
          name: "Test User"
          phone: "+1234567890"
          roles: ["user"]
        }) {
          id
          email
          name
        }
      }
    `;

    const customerRes = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: customerQuery }),
    });

    const customerData = await customerRes.json();
    
    if (customerData.errors) {
      throw new Error(`Failed to create customer: ${customerData.errors[0].message}`);
    }

    console.log('✓ Created test customer:', customerData.data.createCustomer.email);

    // Create admin customer
    const adminQuery = `
      mutation {
        createCustomer(data: {
          email: "admin@example.com"
          password: "Admin123456!"
          name: "Admin User"
          phone: "+0987654321"
          roles: ["admin"]
        }) {
          id
          email
          name
        }
      }
    `;

    const adminRes = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: adminQuery }),
    });

    const adminData = await adminRes.json();
    
    if (adminData.errors) {
      throw new Error(`Failed to create admin: ${adminData.errors[0].message}`);
    }

    console.log('✓ Created admin user:', adminData.data.createCustomer.email);

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
