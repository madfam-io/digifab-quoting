# 🚀 Quick Start Guide - Cotiza Studio Quoting MVP

## Your setup is ready! Here's how to test the app:

### 1. Start the Application

Run this command in your terminal:

```bash
npm run dev
```

Wait for the services to start (about 30 seconds). You'll see output from multiple services.

### 2. Access the Applications

Open these URLs in your browser:

- **Web App**: http://localhost:3000
- **API Docs**: http://localhost:4000/api/docs

### 3. Login Credentials

Use these accounts to test:

**Admin Account** (full access):

- Email: `admin@cotiza.studio`
- Password: `admin123`

**Customer Account** (limited access):

- Email: `test@example.com`
- Password: `test123`

### 4. Test the Quote Flow

1. **Login** with the admin account
2. **Upload a file** - You can use any STL, STEP, or DXF file
3. **Select service** - Choose 3D Printing (FFF), SLA, CNC, or Laser Cutting
4. **Choose material** - Options will appear based on selected service
5. **Set quantity** and options
6. **Create quote** - System will calculate pricing
7. **View quote** - See the detailed quote with pricing breakdown

### 5. Troubleshooting

If something doesn't work:

**Port already in use error:**

```bash
# Kill processes on ports
lsof -ti:3000 | xargs kill -9
lsof -ti:4000 | xargs kill -9
```

**Database connection error:**

```bash
# Check if Docker is running
docker-compose ps

# Restart services if needed
docker-compose restart
```

**Can't login:**

```bash
# Re-run the seed script
cd apps/api
npx tsx prisma/seed.ts
cd ../..
```

### 6. Stop the Application

Press `Ctrl+C` in the terminal to stop all services.

To stop Docker services:

```bash
docker-compose down
```

## What's Working

✅ Multi-tenant architecture with data isolation
✅ Authentication with JWT tokens
✅ Role-based access control (Admin, Customer)
✅ File upload with S3 presigned URLs (mocked locally)
✅ Quote creation with pricing calculation
✅ Material and machine management
✅ Audit logging for all operations
✅ Redis caching for performance
✅ Comprehensive API documentation

## Next Steps

- Try uploading different file types
- Test different materials and quantities
- Check the API documentation at http://localhost:4000/api/docs
- View audit logs (admin only)
- Test the quote acceptance flow

---

Need help? Check the full documentation in `/docs/LOCAL_SETUP_GUIDE.md`
