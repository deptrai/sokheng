# MongoDB Local Setup - Hoàn Thành ✅

## Thông Tin Kết Nối

- **Database**: `food-delivery-app`
- **Host**: `127.0.0.1` (localhost)
- **Port**: `27018`
- **Connection String**: `mongodb://127.0.0.1:27018/food-delivery-app`

## Docker Container Status

```bash
# Kiểm tra container đang chạy
docker-compose ps

# Kết quả:
NAME                    IMAGE          STATUS          PORTS
sokheng-order-mongo-1   mongo:latest   Up              0.0.0.0:27018->27017/tcp
```

## Database Schema (Collections)

Database đã được seed với các collections sau:

| Collection    | Documents | Mô Tả                                    |
|---------------|-----------|------------------------------------------|
| `cities`      | 5         | Danh sách thành phố                      |
| `categories`  | 8         | Categories cho dishes và restaurants     |
| `customers`   | 3         | User accounts (customers + restaurant owner) |
| `restaurants` | 3         | Danh sách nhà hàng                       |
| `dishes`      | 6         | Món ăn từ các nhà hàng                   |
| `orders`      | 2         | Sample orders                            |

## Sample Data

### Cities (5)
- Turkmenabat
- Ashgabat
- Turkmenbashi
- Mary
- Dashoguz

### Categories (8)
**Dish Categories:**
- Pizza
- Burger
- Sushi
- Salad
- Dessert

**Restaurant Categories:**
- Fast Food
- Fine Dining
- Cafe

### Restaurants (3)
1. **Pizza Palace** - Best pizza in town with authentic Italian recipes
2. **Burger House** - Gourmet burgers and American classics
3. **Sushi Master** - Fresh Japanese sushi and sashimi

### Dishes (6)
- Margherita Pizza ($12.99)
- Pepperoni Pizza ($14.99)
- Classic Burger ($8.99)
- Cheeseburger ($9.99)
- California Roll ($10.99)
- Salmon Nigiri ($8.99)

## Login Credentials

⚠️ **Lưu ý**: Theo `SEEDING_STATUS.md`, users được tạo qua direct MongoDB insertion có thể không authenticate được qua Payload CMS. Để tạo users có thể login, cần:

1. Truy cập `http://localhost:3000/admin/create-first-user`
2. Tạo admin user thủ công qua UI
3. Sau đó có thể sử dụng Payload API để tạo thêm users

### Seeded Credentials (for reference)
- **Admin**: admin@example.com / Admin123456!
- **Customer 1**: customer1@example.com / Customer123456!
- **Customer 2**: customer2@example.com / Customer123456!
- **Restaurant Owner**: restaurant1@example.com / Restaurant123456!

## Commands Hữu Ích

### Quản lý Docker Container

```bash
# Start MongoDB
docker-compose up -d mongo

# Stop MongoDB
docker-compose stop mongo

# Restart MongoDB
docker-compose restart mongo

# View logs
docker-compose logs -f mongo

# Stop và xóa container + volumes (⚠️ sẽ mất data)
docker-compose down -v
```

### Truy cập MongoDB Shell

```bash
# Vào MongoDB shell
docker exec -it sokheng-order-mongo-1 mongosh food-delivery-app

# Hoặc chạy command trực tiếp
docker exec sokheng-order-mongo-1 mongosh food-delivery-app --eval "db.restaurants.find().pretty()"
```

### Re-seed Database

```bash
# Chạy lại seeder (sẽ xóa data cũ và tạo mới)
node scripts/seed-comprehensive.js
```

### Verify Data

```bash
# Kiểm tra số lượng documents
docker exec sokheng-order-mongo-1 mongosh food-delivery-app --eval "
print('Cities:', db.cities.countDocuments());
print('Categories:', db.categories.countDocuments());
print('Customers:', db.customers.countDocuments());
print('Restaurants:', db.restaurants.countDocuments());
print('Dishes:', db.dishes.countDocuments());
print('Orders:', db.orders.countDocuments());
"
```

## Next Steps

1. **Start Development Server**:
   ```bash
   pnpm dev
   # hoặc
   docker-compose up payload
   ```

2. **Truy cập ứng dụng**:
   - Frontend: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin

3. **Tạo Admin User** (nếu cần authentication):
   - Truy cập: http://localhost:3000/admin/create-first-user
   - Tạo admin user qua UI

4. **Test GraphQL API**:
   - GraphQL Playground: http://localhost:3000/api/graphql

## Troubleshooting

### Không kết nối được MongoDB
```bash
# Kiểm tra container status
docker-compose ps

# Xem logs
docker-compose logs mongo

# Restart container
docker-compose restart mongo
```

### Muốn reset database hoàn toàn
```bash
# Stop và xóa volumes
docker-compose down -v

# Start lại và re-seed
docker-compose up -d mongo
node scripts/seed-comprehensive.js
```

### Port 27018 đã được sử dụng
Sửa file `docker-compose.yml`, đổi port mapping:
```yaml
ports:
  - "27019:27017"  # Đổi từ 27018 sang 27019
```

Và update `.env`:
```
DATABASE_URI=mongodb://127.0.0.1:27019/food-delivery-app
```

---

**Ngày tạo**: 2026-01-14  
**Script sử dụng**: `scripts/seed-comprehensive.js`  
**Status**: ✅ Hoàn thành
