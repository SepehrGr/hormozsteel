# Database Connection Test

## Quick Test Commands

```bash
# 1. Test Prisma connection
yarn db:generate

# 2. Push schema to database
yarn db:push

# 3. Seed with sample data
yarn db:seed

# 4. Open Prisma Studio to view data
yarn db:studio

# 5. Start development server
yarn dev
```

## Test API Endpoints

Once your server is running (`yarn dev`), test these URLs in your browser:

- http://localhost:3000/api/products
- http://localhost:3000/api/categories
- http://localhost:3000/api/manufacturers

You should see JSON responses with data.

## Common Issues

### Connection Error:

```
Error: P1001: Can't reach database server
```

**Solution:** Make sure PostgreSQL is running (Docker or local installation)

### Database Doesn't Exist:

```
Error: P1003: Database does not exist
```

**Solution:** Create the database manually or use `yarn db:push`

### Permission Denied:

```
Error: P1001: Authentication failed
```

**Solution:** Check your username/password in DATABASE_URL

## Docker Commands (if using Docker)

```bash
# Start PostgreSQL container
docker-compose up -d

# Stop PostgreSQL container
docker-compose down

# View container logs
docker-compose logs postgres

# Connect to PostgreSQL directly
docker exec -it ahanhormoz-postgres-1 psql -U postgres -d ahanhormoz
```
