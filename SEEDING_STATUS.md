# Database Seeding Status

## Current State

### ✅ Completed
1. **Fixed typo** in `seed-admin-users.js` (resultappl → result)
2. **Created comprehensive seeders**:
   - `scripts/seed-comprehensive.js` - Direct MongoDB seeder (all collections)
   - `scripts/seed-via-payload-api.js` - Payload REST API seeder
   - `scripts/seed-admin-users.js` - Admin user seeder

### 📊 Database Status
Current users in database (from direct MongoDB seeding):
- `customer1@example.com` (guest role)
- `customer2@example.com` (guest role)  
- `restaurant1@example.com` (author role)
- `admin2@example.com` (admin role)
- `manager@example.com` (author role)

Other seeded data:
- **Cities**: 5 (Turkmenabat, Ashgabat, Turkmenbashi, Mary, Dashoguz)
- **Categories**: 8 (Pizza, Burger, Sushi, Salad, Dessert, Fast Food, Fine Dining, Cafe)
- **Restaurants**: 3 (Pizza Palace, Burger House, Sushi Master)
- **Dishes**: 6 (various dishes linked to restaurants)
- **Orders**: 2 sample orders

### ⚠️ Known Issue
**Problem**: Users created via direct MongoDB insertion (even with proper bcrypt hashing) cannot authenticate through Payload CMS.

**Root Cause**: Payload CMS uses its own password hashing mechanism and user creation hooks that differ from standard bcrypt. Users must be created through Payload's API or admin panel to work with authentication.

**Impact**: 
- Seeded users cannot login via GraphQL `loginCustomer` mutation
- REST API `/api/customers/login` endpoint returns empty responses
- Admin panel login fails for seeded users

### 🔧 Solutions Attempted
1. ✗ Direct MongoDB insertion with bcrypt hashing
2. ✗ Payload REST API user creation (endpoint not responding correctly)
3. ✗ Browser-based admin panel user creation (form submission issues)
4. ✗ Payload local API initialization (module import errors)

### 📝 Recommended Next Steps

**Option 1: Manual Admin Creation**
1. Navigate to `http://localhost:3000/admin/create-first-user`
2. Fill in the form manually:
   - Email: admin@example.com
   - Password: Admin123456!
   - Name: Admin User
   - Role: Admin
3. Use this admin to run `scripts/seed-via-payload-api.js`

**Option 2: Use Existing Data**
The database already contains:
- 5 users (though authentication doesn't work)
- 5 cities
- 8 categories  
- 3 restaurants
- 6 dishes
- 2 orders

All data is visible through GraphQL queries and can be used for testing non-authentication features.

**Option 3: Fix Payload API Endpoints**
Investigate why Payload's REST API endpoints are not returning JSON responses and fix the configuration.

## Files Created

1. `/scripts/seed-comprehensive.js` - Complete MongoDB seeder
2. `/scripts/seed-via-payload-api.js` - Payload API-based seeder
3. `/scripts/seed-admin-users.js` - Admin user creation script
4. `/scripts/create-admin-user.js` - Payload local API user creation (incomplete)

## Login Credentials (for when authentication is fixed)

- Admin: admin2@example.com / Admin123456!
- Customer 1: customer1@example.com / Customer123456!
- Customer 2: customer2@example.com / Customer123456!
- Restaurant Owner: restaurant1@example.com / Restaurant123456!
- Manager: manager@example.com / Manager123456!
