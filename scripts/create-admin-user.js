const { getPayload } = require('payload');
const config = require('../src/app/(payload)/payload.config').default;

async function createAdminUser() {
  try {
    console.log('Initializing Payload...');
    const payload = await getPayload({ config });
    
    console.log('Creating admin user...');
    const adminUser = await payload.create({
      collection: 'customers',
      data: {
        email: 'admin@example.com',
        password: 'Admin123456!',
        name: 'Admin User',
        phone: '+1234567890',
        roles: ['admin']
      }
    });
    
    console.log('✓ Admin user created successfully!');
    console.log('Email:', adminUser.email);
    console.log('ID:', adminUser.id);
    console.log('\nLogin credentials:');
    console.log('Email: admin@example.com');
    console.log('Password: Admin123456!');
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Error creating admin user:', error.message);
    process.exit(1);
  }
}

createAdminUser();
