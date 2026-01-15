// Set env vars BEFORE importing config
process.env.DATABASE_URI = 'mongodb://127.0.0.1:27018/food-delivery-app'
process.env.PAYLOAD_SECRET = 'a4bde3717458defc62989fc89f874362c57ab8e41f464f26311a00a65b38340b'

import { getPayload } from 'payload'
import config from '../src/payload.config'

async function createTestCustomer() {
    const payload = await getPayload({ config })

    try {
        // Delete existing test customer if exists
        const existing = await payload.find({
            collection: 'customers',
            where: {
                email: {
                    equals: 'customer1@example.com',
                },
            },
        })

        if (existing.docs.length > 0) {
            console.log('Deleting existing customer...')
            await payload.delete({
                collection: 'customers',
                id: existing.docs[0].id,
            })
        }

        // Create new customer using Payload's API (this will hash password correctly)
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

        console.log('✅ Test customer created successfully:')
        console.log({
            id: customer.id,
            email: customer.email,
            name: customer.name,
        })

        process.exit(0)
    } catch (error) {
        console.error('❌ Error creating customer:', error)
        process.exit(1)
    }
}

createTestCustomer()
