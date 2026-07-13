# Dynamic Product Pages

این پروژه از Dynamic Routing برای صفحات محصولات استفاده می‌کند.

## ساختار

```
app/products/
├── layout.tsx          ← Layout اصلی محصولات
├── page.tsx           ← صفحه لیست محصولات
└── [productId]/       ← Dynamic routes
    ├── page.tsx       ← صفحه محصول (dynamic)
    ├── loading.tsx    ← Loading state
    └── not-found.tsx  ← صفحه 404
```

## اضافه کردن محصول جدید

### 1. اضافه کردن به `types/products.ts`:

```typescript
// در PRODUCT_CATEGORIES
{
  id: 'category-id',
  name: 'نام دسته',
  icon: '🔧',
  subcategories: ['زیردسته 1', 'زیردسته 2'],
}

// در PRODUCT_ROUTES
'product-slug': {
  category: 'category-id',
  subcategory: 'زیردسته',
  name: 'نام محصول',
}
```

### 2. اضافه کردن configuration در `[productId]/page.tsx`:

```typescript
'product-slug': {
  features: [
    'ویژگی 1',
    'ویژگی 2',
  ],
  applications: [
    'کاربرد 1',
    'کاربرد 2',
  ],
  specifications: {
    'مشخصه 1': 'مقدار 1',
    'مشخصه 2': 'مقدار 2',
  },
},
```

### 3. اضافه کردن به navbar (اختیاری):

در `components/navbar/navmenu.tsx` لینک جدید اضافه کنید:

```jsx
<NextLink href="/products/product-slug">نام محصول</NextLink>
```

## URL Structure

همه محصولات از این pattern استفاده می‌کنند:

- `/products/milgerd-sade`
- `/products/shamsh-folad`
- `/products/qooti-sanate`
- و...

## مزایا

✅ یک فایل برای همه محصولات
✅ SEO بهینه با generateMetadata
✅ Static Generation برای performance بهتر
✅ اضافه کردن محصول جدید بدون فایل جدید
✅ Loading و Error states یکپارچه
✅ کد تمیزتر و قابل نگهداری بهتر
