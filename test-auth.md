# ABC Store - Authentication Testing Guide

## 🧪 Complete Authentication Flow Test

### Prerequisites
1. MongoDB running on localhost:27017
2. Environment variables set in `.env.local`:
   ```
   MONGODB_URI=mongodb://localhost:27017/abc-store
   JWT_SECRET=your-jwt-secret-key
   NEXT_PUBLIC_SERVER_URL=http://localhost:3000
   ```

### Test Steps

#### 1. Start the Development Server
```bash
npm run dev
```

#### 2. Test Signup Flow
1. Navigate to `http://localhost:3000/auth/jwt/sign-up`
2. Fill out the form:
   - Display Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
   - Confirm Password: `password123`
3. Click "Create account"
4. **Expected Result**: 
   - Success message appears
   - Redirected to dashboard (`/`)
   - User avatar shows in top-right corner

#### 3. Test Signin Flow
1. Click on user avatar → "Logout"
2. Navigate to `http://localhost:3000/auth/jwt/sign-in`
3. Fill out the form:
   - Email: `test@example.com`
   - Password: `password123`
4. Click "Sign in"
5. **Expected Result**:
   - Success message appears
   - Redirected to dashboard
   - User avatar shows in top-right corner

#### 4. Test Protected Routes
1. While logged in, try accessing:
   - `http://localhost:3000/products` ✅ Should work
   - `http://localhost:3000/users` ✅ Should work
2. Click "Logout" from user menu
3. Try accessing protected routes again
4. **Expected Result**: Redirected to sign-in page

#### 5. Test Guest Redirect
1. While logged in, try accessing:
   - `http://localhost:3000/auth/jwt/sign-in`
   - `http://localhost:3000/auth/jwt/sign-up`
2. **Expected Result**: Redirected to dashboard (already logged in)

#### 6. Test API Endpoints
1. Test signup API:
   ```bash
   curl -X POST http://localhost:3000/api/auth/sign-up \
     -H "Content-Type: application/json" \
     -d '{"name":"API Test","email":"api@test.com","password":"password123","confirmPassword":"password123"}'
   ```

2. Test signin API:
   ```bash
   curl -X POST http://localhost:3000/api/auth/sign-in \
     -H "Content-Type: application/json" \
     -d '{"email":"api@test.com","password":"password123"}'
   ```

3. Test protected API (with token):
   ```bash
   curl -X GET http://localhost:3000/api/auth/me \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

### ✅ Success Criteria
- [ ] User can sign up with valid data
- [ ] User can sign in with correct credentials
- [ ] User is redirected to dashboard after successful auth
- [ ] Protected routes require authentication
- [ ] Logout clears session and redirects to sign-in
- [ ] Guest users are redirected from auth pages when already logged in
- [ ] API endpoints work correctly
- [ ] Error handling works for invalid credentials
- [ ] Form validation works for required fields
- [ ] Password confirmation validation works

### 🐛 Common Issues & Solutions

#### Issue: "MongoDB connection failed"
**Solution**: Ensure MongoDB is running and MONGODB_URI is correct

#### Issue: "JWT verification failed"
**Solution**: Check JWT_SECRET is set and consistent

#### Issue: "User not found" on signin
**Solution**: Check if user was created successfully in database

#### Issue: "Passwords don't match" error
**Solution**: Ensure both password fields have identical values

#### Issue: "Email already exists" error
**Solution**: Use a different email or check if user already exists

### 📊 Database Verification
Check MongoDB to verify data:
```javascript
// Connect to MongoDB
use abc-store

// Check users collection
db.users.find().pretty()

// Check products collection
db.products.find().pretty()
```

### 🎉 Authentication System Status
The authentication system should now be fully functional with:
- ✅ User registration and login
- ✅ JWT token management
- ✅ Route protection
- ✅ Session management
- ✅ Logout functionality
- ✅ Error handling
- ✅ Form validation