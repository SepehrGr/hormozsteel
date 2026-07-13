# 🚀 بهبودهای Prisma Schema - اولویت‌بندی شده

## ✅ Priority 1: بحرانی (انجام فوری)

### 1. اضافه کردن Relation به PriceHistory

```prisma
model PriceHistory {
  id           String   @id @default(cuid())
  productId    String
  product      Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  oldPrice     Float
  newPrice     Float
  changeType   String
  changeAmount Float
  changedAt    DateTime @default(now())
  notes        String?
  createdAt    DateTime @default(now())

  @@index([productId])
  @@index([changedAt])
  @@index([productId, changedAt(sort: Desc)]) // برای آخرین قیمت
  @@map("price_history")
}

model Product {
  // ... existing fields
  priceHistory PriceHistory[]
}
```

### 2. اضافه کردن Connection Pool Configuration

**فایل: `lib/prisma.ts`**

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
```

### 3. استفاده از Transaction در Price Update

**فایل: `lib/price-updater.ts`**

```typescript
export async function updateProductPrice(
  productId: string,
  newPrice: number
): Promise<{ success: boolean; product?: any; error?: string }> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get current product
      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new Error('محصول یافت نشد');
      }

      const oldPrice = product.price;
      const changeAmount = newPrice - oldPrice;
      const changeType =
        changeAmount > 0
          ? 'increase'
          : changeAmount < 0
            ? 'decrease'
            : 'stable';

      // 2. Update product
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          price: newPrice,
          previousPrice: oldPrice,
          changeType,
          changeAmount: Math.abs(changeAmount),
          lastPriceChange: new Date(),
        },
      });

      // 3. Create price history record
      await tx.priceHistory.create({
        data: {
          productId,
          oldPrice,
          newPrice,
          changeType,
          changeAmount: Math.abs(changeAmount),
          changedAt: new Date(),
        },
      });

      return updatedProduct;
    });

    return { success: true, product: result };
  } catch (error) {
    console.error('Error updating product price:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'خطای ناشناخته',
    };
  }
}
```

---

## ⚠️ Priority 2: مهم (هفته آینده)

### 4. تبدیل Manufacturer products به Relation

```prisma
model Manufacturer {
  id          String    @id @default(cuid())
  name        String    @unique
  slug        String    @unique
  description String?
  logo        String?
  website     String?
  email       String?
  phone       String?
  address     String?

  // ✅ تبدیل String[] به relation
  products    Product[] @relation("ManufacturerProducts")

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("manufacturers")
}

model Product {
  // ... existing fields

  // اضافه کردن manufacturer relation
  manufacturerId String?
  manufacturer   Manufacturer? @relation("ManufacturerProducts", fields: [manufacturerId], references: [id], onDelete: SetNull)

  // ...
}
```

### 5. اضافه کردن Full-Text Search Index

```prisma
model Product {
  // ... existing fields

  @@index([name(ops: raw("gin_trgm_ops"))], type: Gin)  // PostgreSQL trigram index
}
```

**Enable extension در migration:**

```sql
-- CreateExtension
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

---

## 💡 Priority 3: خوب است (ماه آینده)

### 6. جدا کردن Subcategories به Table مجزا

```prisma
model ProductCategory {
  id            String              @id @default(cuid())
  name          String              @unique
  slug          String              @unique
  icon          String?
  description   String?

  subcategories Subcategory[]
  products      Product[]

  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt

  @@map("product_categories")
}

model Subcategory {
  id         String          @id @default(cuid())
  name       String
  slug       String

  categoryId String
  category   ProductCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  products   Product[]       @relation("SubcategoryProducts")

  createdAt  DateTime        @default(now())
  updatedAt  DateTime        @updatedAt

  @@unique([categoryId, slug])
  @@map("subcategories")
}

model Product {
  // جایگزینی subcategory: String با relation
  subcategoryId String?
  subcategory   Subcategory? @relation("SubcategoryProducts", fields: [subcategoryId], references: [id])
}
```

### 7. اضافه کردن Soft Delete

```prisma
model Product {
  // ... existing fields

  deletedAt DateTime?
  isDeleted Boolean   @default(false)

  @@index([isDeleted])
}
```

### 8. اضافه کردن Audit Trail

```prisma
model AuditLog {
  id         String   @id @default(cuid())
  tableName  String
  recordId   String
  action     String   // CREATE, UPDATE, DELETE
  oldValues  Json?
  newValues  Json?
  userId     String?
  createdAt  DateTime @default(now())

  @@index([tableName, recordId])
  @@index([userId])
  @@index([createdAt])
  @@map("audit_logs")
}
```

---

## 📈 Performance Optimizations

### 9. Query Optimization Examples

#### ❌ قبل (N+1 problem):

```typescript
const products = await prisma.product.findMany();
for (const product of products) {
  const category = await prisma.productCategory.findUnique({
    where: { id: product.categoryId },
  });
}
```

#### ✅ بعد (با include):

```typescript
const products = await prisma.product.findMany({
  include: {
    category: true,
    priceHistory: {
      take: 1,
      orderBy: { changedAt: 'desc' },
    },
  },
});
```

### 10. Caching Strategy

```typescript
import { LRUCache } from 'lru-cache';

const categoryCache = new LRUCache<string, ProductCategory>({
  max: 100,
  ttl: 1000 * 60 * 10, // 10 minutes
});

export async function getCategoryBySlug(slug: string) {
  const cached = categoryCache.get(slug);
  if (cached) return cached;

  const category = await prisma.productCategory.findUnique({
    where: { slug },
  });

  if (category) categoryCache.set(slug, category);
  return category;
}
```

---

## 🔒 Security Best Practices

### 11. Input Validation

```typescript
import { z } from 'zod';

const createProductSchema = z.object({
  name: z.string().min(1).max(255),
  price: z.number().positive(),
  categoryId: z.string().cuid(),
  // ... rest
});

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Validate input
  const validation = createProductSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { success: false, errors: validation.error.errors },
      { status: 400 }
    );
  }

  // ... create product
}
```

### 12. Rate Limiting

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function GET(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  // ... handle request
}
```

---

## 📊 Monitoring & Logging

### 13. Query Performance Monitoring

```typescript
// middleware در prisma client
const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
  ],
});

prisma.$on('query', (e) => {
  if (e.duration > 1000) {
    // queries > 1 second
    console.warn('Slow query detected:', {
      query: e.query,
      duration: e.duration,
      params: e.params,
    });
  }
});
```

---

## 🧪 Testing

### 14. Unit Tests با Prisma Mock

```typescript
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

export const prismaMock =
  mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
});

// در تست:
test('should get product by id', async () => {
  const mockProduct = {
    id: 'test-id',
    name: 'Test Product',
    // ...
  };

  prismaMock.product.findUnique.mockResolvedValue(mockProduct);

  const result = await getProductById('test-id');
  expect(result).toEqual(mockProduct);
});
```

---

## 📝 Migration Best Practices

### 15. Safe Migration Strategy

```bash
# 1. Backup قبل از migration
pg_dump -U postgres -d ahanhormoz > backup_$(date +%Y%m%d).sql

# 2. Test در development
npm run prisma:migrate:dev

# 3. Review migration SQL
cat prisma/migrations/*/migration.sql

# 4. Apply در production با downtime کم
npm run prisma:migrate:deploy

# 5. Rollback در صورت مشکل
psql -U postgres -d ahanhormoz < backup_YYYYMMDD.sql
```

---

## 🎓 خلاصه نمرات

| بخش               | نمره فعلی  | نمره بعد از بهبود |
| ----------------- | ---------- | ----------------- |
| Schema Design     | 8.5/10     | 9.5/10            |
| Query Performance | 7/10       | 9/10              |
| Type Safety       | 9/10       | 9.5/10            |
| Relations         | 7/10       | 9/10              |
| Indexing          | 8/10       | 9/10              |
| Transactions      | 3/10       | 9/10              |
| Error Handling    | 6/10       | 8/10              |
| Security          | 6/10       | 9/10              |
| **میانگین**       | **6.9/10** | **9/10**          |

---

## 🚀 Migration Plan

### Week 1:

- [ ] Fix PriceHistory relation
- [ ] Add connection pooling
- [ ] Add transactions to price updates

### Week 2:

- [ ] Convert Manufacturer products to relation
- [ ] Add full-text search indexes
- [ ] Improve error handling

### Week 3:

- [ ] Separate subcategories table
- [ ] Add soft delete
- [ ] Add audit trail

### Week 4:

- [ ] Implement caching
- [ ] Add monitoring
- [ ] Write tests
