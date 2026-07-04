# HRMS Installation Guide

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Step 1: Clone or Download the Project
```bash
cd Human-Resource-Management-System-ODOO-main
```

## Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

## Step 3: Configure Environment Variables
Create a `.env` file in the backend directory (already provided):
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/hrms
JWT_SECRET=your_jwt_secret_key_change_this_in_production
NODE_ENV=development
```

## Step 4: Start MongoDB
Ensure MongoDB is running locally on port 27017.

## Step 5: Seed the Database (Optional)
```bash
node seed.js
```
This will create test users:
- Admin: `admin@example.com` / `password123`
- HR: `hr@example.com` / `password123`
- Employee: `employee@example.com` / `password123`

## Step 6: Start the Backend Server
```bash
npm run dev
```
Backend will run on `http://localhost:5001`

## Step 7: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

## Step 8: Start the Frontend Server
```bash
npm run dev
```
Frontend will run on `http://localhost:3000` (or next available port)

## Access the Application
Open your browser and navigate to the frontend URL. Log in with the admin credentials to access all features.
