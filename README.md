# ABC Store - Product Management Dashboard

A modern e-commerce admin dashboard built with Next.js, React, MongoDB Atlas, and JWT authentication for managing products with image uploads, titles, and descriptions.

---

## 1. Prerequisites

- **Node.js 20.x** (Recommended)
- **npm**

---

## 2. Installation

#### Using Npm
```sh
npm i
npm run dev
```

---

## 3. Environment

- **Next.js v14**
- **React v18**
- **MongoDB Atlas**
- **JWT Authentication**

---

## 4. Features

- **Product Management**: Upload products with images, titles, and descriptions
- **Image Upload**: Support for multiple image formats with preview
- **Product Listing**: Paginated product list with search and filtering
- **Responsive Design**: Mobile-first responsive layouts
- **Authentication**: JWT-based secure authentication
- **Modular Architecture**: Clean separation of concerns
- **Internationalization**: Multi-language support with react-i18next
- **Reusable Components**: Material-UI based component library
- **Form Validation**: Zod and React Hook Form integration
- **Custom Theming**: Flexible color schemes and styling

---

## 5. ABC Store System Overview

ABC Store is a focused e-commerce admin platform designed for managing products with image uploads, titles, and descriptions. The system includes user management and authentication.

### Core Features

#### **Products**
- **Product Management**: Create, edit, and delete products
- **Image Upload**: Upload product images with preview
- **Product Listing**: View all products in a paginated list
- **Search & Filter**: Find products by title, description, or category

#### **Users**
- **User Management**: Manage admin users
- **Authentication**: Secure JWT-based login
- **Role-based Access**: Admin and user roles

#### **Authentication**
- **Login/Logout**: Secure authentication system
- **Protected Routes**: Access control for admin pages
- **Session Management**: JWT token-based sessions

### Key Features

#### **Product Management**
- **Product Creation**: Add new products with title, description, and images
- **Product Listing**: View all products in a clean, organized list
- **Image Upload**: Upload and manage product images
- **Product Editing**: Update product information and images

#### **User Interface**
- **Responsive Design**: Mobile-first approach with Material-UI components
- **Clean Navigation**: Simple sidebar with Products, Users, and Auth pages
- **Search & Filter**: Find products quickly
- **Image Preview**: See product images before saving

### Data Architecture

The system uses MongoDB with Mongoose for data modeling, featuring:
- **Product Schema**: Product data with title, description, images, and metadata
- **User Schema**: User authentication and profile information
- **Image Storage**: File upload handling for product images
- **Validation**: Data validation for product and user information

### API Structure

RESTful API endpoints:
- `/api/products/*` - Product CRUD operations and image upload
- `/api/users/*` - User management
- `/api/auth/*` - Authentication (login/logout)

---

## 6. Project Structure

```
src/
  app/                # Next.js app entry and layout
  ├── (main)/         # Protected dashboard routes
  │   ├── products/   # Product management pages
  │   └── users/      # User management pages
  ├── api/            # API routes
  │   ├── auth/       # Authentication endpoints
  │   ├── products/   # Product CRUD operations
  │   └── users/      # User management endpoints
  └── auth/           # Authentication pages
  assets/             # Static assets and images
  auth/               # Authentication logic and context
  components/         # Reusable UI components
  hooks/              # Custom React hooks
  layouts/            # Layouts (dashboard, auth)
  lib/                # Utilities (db, helpers)
  locales/            # i18n resources
  middleware/         # Custom middleware
  models/             # Mongoose models (Product, User)
  routes/             # Route definitions
  sections/           # Feature modules (products, users, auth)
  theme/              # Theme and style config
  utils/              # Utility functions
  global.css          # Global styles
config-global.js      # Global configuration
```

---

## 7. Scripts

Common scripts from [package.json](package.json):

- `dev`: Start development server on port 3000
- `build`: Build for production
- `start`: Start production server
- `lint`: Run ESLint
- `lint:fix`: Fix lint errors
- `fm:check`: Check formatting
- `fm:fix`: Fix formatting
- `rm:all`: Remove build artifacts and node_modules
- `re:start`: Clean, install, and start dev
- `fakedb`: Seed fake database (see scripts/fakedb.js)

---

## 8. Architecture

Follows Clean Architecture with Next.js App Router:

```
Page → View → Component → Hooks → Actions → API
```

- **Page Layer**: Next.js page components with metadata
- **View Layer**: Feature-specific view components
- **Component Layer**: Reusable UI components
- **Hooks Layer**: Business logic, state management, API coordination
- **Actions Layer**: API calls and data transformation
- **API Layer**: Next.js API routes with MongoDB integration

### Key Patterns

- **Server Components**: Leverage Next.js 14 server components for better performance
- **Client Components**: Use 'use client' directive for interactive components
- **API Routes**: RESTful endpoints in `src/app/api/`
- **Middleware**: Authentication and route protection
- **Context Providers**: Global state management with React Context

---

## 9. Development Setup

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/abc-store
JWT_SECRET=your-jwt-secret-key

# Next.js
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
NEXT_PUBLIC_BASE_PATH=
```

### Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Set up MongoDB**:
   - Install MongoDB locally or use MongoDB Atlas
   - Update `MONGODB_URI` in `.env.local`

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Access the Application**:
   - Open [http://localhost:3000](http://localhost:3000)
   - Use demo credentials: `demo@minimals.cc` / `@demo1`

---

## 10. ABC Store Features

### Core Features (To Implement)

- **Product Management**: 
  - Create products with title, description, and images
  - View product list with pagination
  - Edit and delete products
  - Image upload with preview

- **User Management**:
  - Admin user management
  - User authentication and authorization

- **Authentication**:
  - Login/logout functionality
  - Protected routes

### Current Status

- ✅ **Authentication System**: JWT-based login/logout
- ✅ **Database Connection**: MongoDB with Mongoose
- ✅ **UI Framework**: Material-UI components
- ✅ **Routing**: Next.js App Router setup
- ⏳ **Product Models**: To be implemented
- ⏳ **Product Views**: To be implemented
- ⏳ **Image Upload**: To be implemented
- ⏳ **User Management**: To be implemented

---

## 11. License

This project is private and not licensed for public use.

---

**NOTE:** When copying folders, remember to also copy hidden files like `.env`. These files contain environment variables crucial for the application to function properly.


### Production
## run backend as production

First, install PM2 globally:
```bash
npm install -g pm2
```

Then create a PM2 ecosystem file `ecosystem.config.cjs` in root:

```cjs
module.exports = {
  apps: [
    {
      name: "abc-store",
      script: "npm",
      args: "start",            // runs your "start" script (Next.js -> starts on 3000 by default)
      cwd: "/home/administrator/abc-store",// set to your app path (Windows e.g. "C:/apps/abc-store")
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      instances: 4,             // or "max" for all CPU cores
      exec_mode: "fork",        // or "cluster" for stateless apps
      watch: false,             // keep false in prod
      max_memory_restart: "1G"
    }
  ]
}

```
Start as daemon:
```bash
pm2 start ecosystem.config.cjs
pm2 save
```

Other PM2 commands:
```bash
pm2 list                    # Show running processes
pm2 logs abc-store      # View logs
pm2 stop abc-store      # Stop the process
pm2 restart abc-store   # Restart the process
pm2 delete abc-store    # Remove from PM2
pm2 startup               # Setup PM2 to start on system boot
```