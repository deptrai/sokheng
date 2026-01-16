#!/usr/bin/env tsx

/**
 * Unified User Seeding Script
 * 
 * Tạo users (customer và admin) sử dụng Payload API để ensure correct password hashing.
 * 
 * Usage:
 *   tsx scripts/seed-users.ts --all          # Tạo cả customer và admin
 *   tsx scripts/seed-users.ts --customer     # Chỉ tạo customer
 *   tsx scripts/seed-users.ts --admin        # Chỉ tạo admin
 * 
 * Environment Variables:
 *   DATABASE_URI      - MongoDB connection string
 *   PAYLOAD_SECRET    - Payload CMS secret key
 */

// Load environment variables from .env file FIRST
import dotenv from 'dotenv'
dotenv.config()

// Ensure env vars are set (use .env values or fallback to defaults)
if (!process.env.DATABASE_URI) {
    process.env.DATABASE_URI = 'mongodb://127.0.0.1:27018/food-delivery-app'
}
if (!process.env.PAYLOAD_SECRET) {
    process.env.PAYLOAD_SECRET = 'a4bde3717458defc62989fc89f874362c57ab8e41f464f26311a00a65b38340b'
}

import { getPayload } from 'payload'

// User definitions
const CUSTOMER_USER = {
    email: 'customer1@example.com',
    password: 'Customer123456!',
    name: 'John Doe',
    phone: '+1234567890',
    roles: ['guest'] as ('guest' | 'admin' | 'author')[],
}

const ADMIN_USER = {
    email: 'admin@example.com',
    password: 'Admin123456!',
    name: 'Admin User',
    phone: '+1234567890',
    roles: ['admin'] as ('guest' | 'admin' | 'author')[],
}

// Parse CLI arguments
const args = process.argv.slice(2)
const shouldCreateCustomer = args.includes('--customer') || args.includes('--all')
const shouldCreateAdmin = args.includes('--admin') || args.includes('--all')

if (!shouldCreateCustomer && !shouldCreateAdmin) {
    console.error('❌ Error: Please specify --customer, --admin, or --all')
    console.log('\nUsage:')
    console.log('  tsx scripts/seed-users.ts --all          # Tạo cả customer và admin')
    console.log('  tsx scripts/seed-users.ts --customer     # Chỉ tạo customer')
    console.log('  tsx scripts/seed-users.ts --admin        # Chỉ tạo admin')
    process.exit(1)
}

async function createUser(userData: typeof CUSTOMER_USER | typeof ADMIN_USER) {
    // Dynamic import config AFTER env vars are set
    const { default: config } = await import('../src/payload.config.js')
    const payload = await getPayload({ config })

    try {
        // Delete existing user if exists
        const existing = await payload.find({
            collection: 'customers',
            where: {
                email: { equals: userData.email },
            },
        })

        if (existing.docs.length > 0) {
            console.log(`🗑️  Deleting existing user: ${userData.email}`)
            await payload.delete({
                collection: 'customers',
                id: existing.docs[0].id,
            })
        }

        // Create new user
        console.log(`👤 Creating user: ${userData.email}`)
        const user = await payload.create({
            collection: 'customers',
            data: userData,
        })

        console.log(`✅ User created successfully:`)
        console.log(`   ID: ${user.id}`)
        console.log(`   Email: ${user.email}`)
        console.log(`   Roles: ${user.roles?.join(', ')}`)
        console.log(`   Password: ${userData.password}`)

        return user
    } catch (error) {
        console.error(`❌ Error creating user ${userData.email}:`, error)
        throw error
    }
}

async function main() {
    console.log('🚀 Starting User Seeding...\n')

    try {
        const results = []

        if (shouldCreateCustomer) {
            console.log('━━━ Creating Customer User ━━━')
            const customer = await createUser(CUSTOMER_USER)
            results.push({ type: 'Customer', ...customer })
            console.log('')
        }

        if (shouldCreateAdmin) {
            console.log('━━━ Creating Admin User ━━━')
            const admin = await createUser(ADMIN_USER)
            results.push({ type: 'Admin', ...admin })
            console.log('')
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('✅ User Seeding Completed Successfully!')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

        console.log('📋 Login Credentials:\n')
        if (shouldCreateCustomer) {
            console.log('👤 Customer:')
            console.log(`   Email:    ${CUSTOMER_USER.email}`)
            console.log(`   Password: ${CUSTOMER_USER.password}\n`)
        }
        if (shouldCreateAdmin) {
            console.log('👑 Admin:')
            console.log(`   Email:    ${ADMIN_USER.email}`)
            console.log(`   Password: ${ADMIN_USER.password}\n`)
        }

        console.log('🔐 Passwords are hashed using Payload\'s built-in mechanism')

        process.exit(0)
    } catch (error) {
        console.error('\n❌ User seeding failed:', error)
        process.exit(1)
    }
}

main()
