# Seeding Scripts

This directory contains utility scripts for seeding and managing the database for the Food Delivery App.

## Prerequisites

- **Node.js** (v18+)
- **MongoDB** running (e.g., at `mongodb://127.0.0.1:27018/food-delivery-app`)
- **Environment Variables**:
  - `DATABASE_URI`: Connection string to MongoDB.
  - `PAYLOAD_SECRET`: Secret key for Payload CMS (required for Local API scripts).

## Available Scripts

### 1. User Management (`seed-users.ts`)
Creates standard customer and admin users using Payload's Local API. exact passwords are treated securely by Payload's built-in hashing.

**Usage:**
```bash
# Create specific user types
npm run seed:customer   # Create customer1@example.com
npm run seed:admin      # Create admin@example.com

# Create all standard users
npm run seed:users      # Create both customer and admin
```

**Standard Credentials:**
- **Customer**: `customer1@example.com` / `Customer123456!`
- **Admin**: `admin@example.com` / `Admin123456!`

### 2. General Database Inspection (`check-db.ts`)
Inspects the database state, including restaurant data and user details.

**Usage:**
```bash
# Check standard restaurant data
npm run db:check

# List all users in the database
tsx scripts/check-db.ts users

# Inspect a specific user (shows password hash status)
tsx scripts/check-db.ts user customer1@example.com
```

### 3. Master Seed (`seed-via-payload-api.js`)
Seeds the entire application with complete dummy data (users, cities, categories, restaurants, dishes) using the REST API.
**Note**: The application server must be running (`npm run dev`) for this script to work.

**Usage:**
```bash
npm run seed:all
```

### 4. Specific Content Seeding
- **Sokheng Menu**: `npm run seed:sokheng` (Updates Sokheng restaurant with specific menu items)
- **Vietnamese Data**: `npm run seed:vietnamese` (Seeds localized Vietnamese data)

## Troubleshooting
If you experience login issues:
1. Run `npm run seed:users` to reset user accounts with known passwords.
2. Run `tsx scripts/check-db.ts user [email]` to verify the user exists and has a password hash.
