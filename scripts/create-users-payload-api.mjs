// Set env vars FIRST
process.env.DATABASE_URI = 'mongodb://127.0.0.1:27018/food-delivery-app'
process.env.PAYLOAD_SECRET = 'a4bde3717458defc62989fc89f874362c57ab8e41f464f26311a00a65b38340b'

async function createUsersViaPayloadAPI() {
    console.log('🚀 Starting Payload CMS...')

    // Dynamic import AFTER setting env vars
    const { getPayload } = await import('payload')
    const { default: configPromise } = await import('../src/payload.config.js')

    const config = await configPromise
    const payload = await getPayload({ config })

    console.log('✅ Payload initialized')

    try {
        // Delete existing test users
        const existing = await payload.find({
            collection: 'customers',
            where: {
                email: {
                    in: ['customer1@example.com', 'admin@ashpez.com'],
                },
            },
        })

        if (existing.docs.length > 0) {
            console.log(`🗑️  Deleting ${existing.docs.length} existing test users...`)
            for (const doc of existing.docs) {
                await payload.delete({
                    collection: 'customers',
                    id: doc.id,
                })
            }
        }

        // Create customer user
        console.log('👤 Creating customer user...')
        const customer = await payload.create({
            collection: 'customers',
            data: {
                email: 'customer1@example.com',
                password: 'Customer123456!',
                name: 'John Doe',
                phone: '+1234567890',
                roles: ['guest'],
            },
        })
        console.log('✅ Customer created:', customer.id)

        // Create admin user
        console.log('👤 Creating admin user...')
        const admin = await payload.create({
            collection: 'customers',
            data: {
                email: 'admin@ashpez.com',
                password: 'Admin123456!',
                name: 'Admin User',
                phone: '+1234567890',
                roles: ['admin'],
            },
        })
        console.log('✅ Admin created:', admin.id)

        console.log('\n📋 Test Credentials:')
        console.log('Customer:')
        console.log('  Email: customer1@example.com')
        console.log('  Password: Customer123456!')
        console.log('\nAdmin:')
        console.log('  Email: admin@ashpez.com')
        console.log('  Password: Admin123456!')

        console.log('\n✅ All users created successfully via Payload API!')
        console.log('🔐 Passwords are hashed using Payload\'s built-in mechanism')

        process.exit(0)
    } catch (error) {
        console.error('❌ Error:', error)
        process.exit(1)
    }
}

createUsersViaPayloadAPI()
