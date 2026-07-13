# Database Setup and Operations Guide

## Prerequisites

Make sure you have PostgreSQL installed and running on your system.

## Environment Setup

1. Update your `.env.local` file with your PostgreSQL database URL:

```bash
DATABASE_URL="postgresql://username:password@localhost:5432/ahanhormoz?schema=public"
```

Replace:

- `username`: Your PostgreSQL username
- `password`: Your PostgreSQL password
- `localhost:5432`: Your PostgreSQL host and port
- `ahanhormoz`: Your database name

## Database Operations

### 1. Generate Prisma Client

```bash
yarn db:generate
```

### 2. Push Schema to Database (for development)

```bash
yarn db:push
```

### 3. Create and Run Migrations (for production)

```bash
yarn db:migrate
```

### 4. Seed the Database with Sample Data

```bash
yarn db:seed
```

### 5. Open Prisma Studio (Database GUI)

```bash
yarn db:studio
```

### 6. Reset Database (WARNING: This will delete all data)

```bash
yarn db:reset
```

## API Endpoints

### Products

- `GET /api/products` - Get all products with filtering and pagination
- `POST /api/products` - Create a new product
- `GET /api/products/[id]` - Get a specific product
- `PUT /api/products/[id]` - Update a product
- `DELETE /api/products/[id]` - Delete a product

### Categories

- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create a new category
- `GET /api/categories/[id]` - Get a specific category
- `PUT /api/categories/[id]` - Update a category
- `DELETE /api/categories/[id]` - Delete a category

### Manufacturers

- `GET /api/manufacturers` - Get all manufacturers
- `POST /api/manufacturers` - Create a new manufacturer
- `GET /api/manufacturers/[id]` - Get a specific manufacturer
- `PUT /api/manufacturers/[id]` - Update a manufacturer
- `DELETE /api/manufacturers/[id]` - Delete a manufacturer

### Orders

- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create a new order

## API Usage Examples

### Fetch Products with Filters

```javascript
// Using the custom hooks
const { products, pagination, isLoading } = useProducts({
  category: 'milgerd',
  search: 'صاف',
  page: 1,
  limit: 10,
  sortBy: 'price',
  sortOrder: 'asc',
})

// Direct API call
const response = await fetch(
  '/api/products?category=milgerd&search=صاف&page=1&limit=10',
)
const data = await response.json()
```

### Create a New Product

```javascript
// Using the custom hook
const { createProduct } = useCreateProduct()

const newProduct = await createProduct({
  name: 'میلگرد صاف 10 میلیمتر',
  categoryId: 'category-id',
  brand: 'فولاد مبارکه',
  price: 42000,
  subcategory: 'میلگرد صاف',
  description: 'میلگرد صاف 10 میلیمتر مناسب برای ساختمان‌سازی',
  unit: 'kg',
  inStock: true,
})

// Direct API call
const response = await fetch('/api/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(productData),
})
```

### Create a New Order

```javascript
const { createOrder } = useCreateOrder()

const newOrder = await createOrder({
  customerId: 'customer-id',
  items: [
    {
      productId: 'product-id-1',
      quantity: 100,
      unitPrice: 45000,
    },
    {
      productId: 'product-id-2',
      quantity: 50,
      unitPrice: 52000,
    },
  ],
  notes: 'تحویل در محل کارگاه',
})
```

## React Component Example

```jsx
import { useProducts, useCategories } from '@/hooks/useApi'

function ProductList() {
  const { products, isLoading, error } = useProducts({ limit: 10 })
  const { categories } = useCategories()

  if (isLoading) return <div>در حال بارگذاری...</div>
  if (error) return <div>خطا: {error}</div>

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>{product.price} تومان</p>
        </div>
      ))}
    </div>
  )
}
```

## Database Schema Overview

### Main Entities

- **ProductCategory**: Categories like میلگرد, تیرآهن, etc.
- **Product**: Individual products with specifications
- **Manufacturer**: Steel manufacturers like فولاد مبارکه
- **Customer**: Customer information
- **Order**: Order management
- **OrderItem**: Individual items in an order

### Key Relationships

- Product belongs to one Category
- Product has specifications stored as JSON
- Order belongs to one Customer
- Order has many OrderItems
- OrderItem references one Product

## Troubleshooting

### Database Connection Issues

1. Make sure PostgreSQL is running
2. Check your DATABASE_URL in `.env.local`
3. Ensure the database exists
4. Verify credentials are correct

### Migration Issues

```bash
# Reset and recreate database
yarn db:reset

# Generate client after schema changes
yarn db:generate

# Push schema changes
yarn db:push
```

### API Errors

- Check database connection
- Verify Prisma client is generated
- Check server logs for detailed errors
- Ensure required fields are provided in requests

## Security Notes

1. **Never commit** your `.env.local` file
2. Use environment variables for all sensitive data
3. Validate all API inputs
4. Implement proper authentication for production
5. Use database migrations for production deployments
