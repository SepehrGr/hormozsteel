# Admin Panel - آهن هرمز

A comprehensive admin panel for managing steel products, categories, manufacturers, orders, and customers.

## 🚀 Features

### Authentication & Security

- **Role-based Access Control**: Admin and Super Admin roles
- **Secure Authentication**: NextAuth.js with bcrypt password hashing
- **Session Management**: JWT-based sessions with configurable expiry
- **Activity Logging**: Comprehensive admin action logging with IP tracking

### Product Management

- **Bulk Operations**: Update multiple products at once (price, stock, category)
- **Advanced Filtering**: Search by name, filter by category and stock status
- **Export/Import**: CSV export functionality
- **Real-time Updates**: SWR for optimistic UI updates

### User Management (Super Admin Only)

- **Admin User Creation**: Create new admin users
- **Role Assignment**: Assign ADMIN or SUPER_ADMIN roles
- **User Status Control**: Activate/deactivate users
- **Last Login Tracking**: Monitor user activity

### Dashboard Analytics

- **Real-time Statistics**: Products, orders, customers, revenue
- **Recent Orders**: Latest order activity
- **Growth Metrics**: Performance indicators

## 📋 Default Admin Accounts

After running the seed script, you can login with:

### Super Admin

- **Email**: `superadmin@ahanhormoz.com`
- **Password**: `superadmin123`
- **Permissions**: Full access to all features including user management

### Admin

- **Email**: `admin@ahanhormoz.com`
- **Password**: `admin123`
- **Permissions**: Access to all features except user management

## 🛡️ Security Features

### Password Security

- Bcrypt hashing with salt rounds
- Minimum password requirements (implement as needed)
- Secure password reset flow (can be extended)

### Session Security

- JWT tokens with 24-hour expiry
- HttpOnly cookies (when using database sessions)
- CSRF protection via NextAuth

### Activity Monitoring

- All admin actions are logged with:
  - User ID and action type
  - Resource type and ID
  - IP address and User Agent
  - Detailed action metadata
  - Timestamp

### API Protection

- Authentication required for all admin endpoints
- Role-based authorization
- Input validation and sanitization

## 🔧 Technical Stack

- **Framework**: Next.js 15 with App Router
- **Authentication**: NextAuth.js v4
- **Database**: PostgreSQL with Prisma ORM
- **UI Components**: HeroUI (NextUI v2)
- **Icons**: Lucide React
- **Styling**: Tailwind CSS
- **Data Fetching**: SWR for client-side caching

## 🚦 Getting Started

1. **Start the application**:

   ```bash
   yarn dev
   ```

2. **Access the admin panel**:

   ```
   http://localhost:3000/admin/login
   ```

3. **Login with default credentials** (see above)

## 📱 Admin Panel Pages

### Dashboard (`/admin/dashboard`)

- Overview statistics
- Recent orders
- Performance metrics

### Products (`/admin/products`)

- Product listing with advanced filters
- Bulk edit functionality (price, stock, category)
- Bulk delete with confirmation
- CSV export
- Individual product actions

### Categories (`/admin/categories`)

- Category management
- Hierarchical structure support

### Manufacturers (`/admin/manufacturers`)

- Manufacturer profiles
- Contact information management

### Orders (`/admin/orders`)

- Order processing
- Status management
- Customer information

### Users (`/admin/users`) - Super Admin Only

- Admin user management
- Role assignment
- User status control

## 🔄 Bulk Operations

### Bulk Product Updates

Select multiple products and update:

- **Price**: Set new price for all selected products
- **Stock Status**: Mark as in stock or out of stock
- **Category**: Move products to different category

### Security Considerations

- All bulk operations require authentication
- Actions are logged with full details
- Confirmation dialogs prevent accidental changes
- Failed operations are handled gracefully

## 📊 Activity Logging

All admin actions are tracked in the `admin_logs` table:

```sql
-- Example log entry
{
  "id": "log_id",
  "userId": "admin_user_id",
  "action": "BULK_UPDATE",
  "resourceType": "PRODUCT",
  "details": {
    "productIds": ["prod1", "prod2"],
    "updateData": { "price": 1500 },
    "affectedCount": 2
  },
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "createdAt": "2024-10-09T10:30:00Z"
}
```

## 🎨 UI Features

- **Responsive Design**: Works on desktop and mobile
- **Dark Mode Support**: Automatic theme switching
- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: User-friendly error messages
- **Confirmation Dialogs**: Prevent accidental destructive actions

## 🔮 Future Enhancements

- **Advanced Analytics**: Charts and graphs
- **Bulk Import**: Excel/CSV product import
- **Image Management**: Product image upload
- **Notification System**: Real-time notifications
- **Audit Trail**: Detailed change history
- **API Rate Limiting**: Prevent abuse
- **Two-Factor Authentication**: Enhanced security

## 🐛 Troubleshooting

### Common Issues

1. **Login fails**: Check database connection and user credentials
2. **Session expires**: Verify NEXTAUTH_SECRET environment variable
3. **Bulk operations fail**: Check network connectivity and permissions
4. **UI components not loading**: Verify HeroUI dependencies

### Development

- Use `yarn db:studio` to inspect database
- Check browser console for client-side errors
- Review server logs for API errors
- Verify environment variables in `.env.local`
