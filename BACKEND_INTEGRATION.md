# FuelABC Frontend - Backend Integration Guide

## Overview
This frontend is configured to fetch data from your Django backend deployed at:
**https://api-fuelabc.onrender.com/**

## 🚀 Solved: CORS "Failed to Fetch" Issues
To solve the "Failed to fetch" errors caused by CORS (Cross-Origin Resource Sharing) restrictions, we have implemented a **Development Proxy**.

### How it works now:
1. Frontend makes requests to `/api/...` (Localhost)
2. Vite Development Server intercepts these requests
3. Vite proxies them securely to `https://api-fuelabc.onrender.com/api/...`
4. Browser sees it as a "Same-Origin" request, so no CORS errors occur

## Setup Instructions

### 1. Environment Configuration
The `.env` file is now set to use the relative proxy path:
```
VITE_API_URL=/api
```

### 2. Vite Proxy Configuration
`vite.config.ts` has been updated to proxy these paths:
- `/api` -> `https://api-fuelabc.onrender.com`
- `/auth` -> `https://api-fuelabc.onrender.com`
- `/notification` -> `https://api-fuelabc.onrender.com`

### 3. Run Development Server
```bash
npm install
npm run dev
```

The app will start on `http://localhost:5173`.
**Important**: You must restart the server (`Ctrl+C` then `npm run dev`) for the new proxy settings to take effect.

## Troubleshooting

### Connection still failing?
1. **Restart Server**: Changes to `vite.config.ts` require a restart.
2. **Check Backend Status**: Visit `https://api-fuelabc.onrender.com/api/dashboard/stats/` in your browser. If it spins forever, your backend service on Render might be sleeping (Render free tier sleeps after inactivity). It takes about 1-2 minutes to wake up.
3. **Verify Proxy**: Look at the terminal where `npm run dev` is running. It should not show errors.

## Backend Endpoints (Reference)
- **Admin Panel**: `https://api-fuelabc.onrender.com/admin/accounts/`
- **API Root**: `https://api-fuelabc.onrender.com/api/`

## Production Build
When you deploy this frontend to production (e.g. Vercel, Netlify), the proxy won't work. You will need to:
1. Update `.env.production` with the full URL: `VITE_API_URL=https://api-fuelabc.onrender.com/api`
2. Ensure your Django backend's `CORS_ALLOWED_ORIGINS` includes your production frontend domain.
