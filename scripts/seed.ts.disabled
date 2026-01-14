import { getPayloadClient } from '@payloadcms/next/utilities';
import config from '@/payload.config';

const seed = async () => {
  const payload = await getPayloadClient({ config });

  try {
    // Create test customer
    const customer = await payload.create({
      collection: 'customers',
      data: {
        email: 'test@example.com',
        password: 'Test123456!',
        name: 'Test User',
        phone: '+1234567890',
        roles: ['user'],
      },
    });

    console.log('✓ Created test customer:', customer.email);

    // Create test admin
    const admin = await payload.create({
      collection: 'customers',
      data: {
        email: 'admin@example.com',
        password: 'Admin123456!',
        name: 'Admin User',
        phone: '+0987654321',
        roles: ['admin'],
      },
    });

    console.log('✓ Created admin user:', admin.email);

    console.log('\n✅ Seeding completed successfully!');
    console.log('\nTest credentials:');
    console.log('Regular user: test@example.com / Test123456!');
    console.log('Admin user: admin@example.com / Admin123456!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seed();
