# Deployment Guide

This repo is prepared for:

- Frontend on Vercel
- Backend on Render
- Database on MongoDB Atlas
- Domain on `maturiresults.in`

The login page is already mounted at `/`, so once the domain points to the deployed frontend, `https://maturiresults.in` will open the login page.

## Files added for deployment

- Root Render config: [render.yaml](/C:/Users/Kavya/OneDrive/Desktop/exam/render.yaml)
- Frontend Vercel config: [frontend/vercel.json](/C:/Users/Kavya/OneDrive/Desktop/exam/frontend/vercel.json)
- Frontend env example: [frontend/.env.example](/C:/Users/Kavya/OneDrive/Desktop/exam/frontend/.env.example)
- Backend env example: [backend/.env.example](/C:/Users/Kavya/OneDrive/Desktop/exam/backend/.env.example)

## 1. Put the code on GitHub

Create a GitHub repo and push this project so Vercel and Render can import it.

## 2. Create MongoDB Atlas database

Create a free cluster in MongoDB Atlas and get the connection string.

Example:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/loginDB?retryWrites=true&w=majority
```

Make sure Atlas network access allows your backend host.

## 3. Deploy backend on Render

1. Go to Render
2. Create a new `Web Service`
3. Connect your GitHub repo
4. Render can use [render.yaml](/C:/Users/Kavya/OneDrive/Desktop/exam/render.yaml) automatically

If you enter settings manually, use:

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Health check path: `/api/health`

Set these env vars in Render:

```env
PORT=5000
MONGO_URI=<your atlas uri>
JWT_SECRET=<long random secret>
ADMIN_USERNAME=2451-00-000-000
CORS_ORIGINS=https://maturiresults.in,https://www.maturiresults.in
```

After deploy, copy the backend URL.

Example:

```text
https://maturiresults-api.onrender.com
```

Check this URL:

```text
https://maturiresults-api.onrender.com/api/health
```

## 4. Deploy frontend on Vercel

1. Go to Vercel
2. Import the same GitHub repo
3. Set the project root directory to `frontend`
4. Vercel will use [frontend/vercel.json](/C:/Users/Kavya/OneDrive/Desktop/exam/frontend/vercel.json) for SPA routing

Set this env var in Vercel:

```env
REACT_APP_API_URL=https://maturiresults-api.onrender.com/api/auth
```

Build settings:

- Framework: Create React App
- Build command: `npm run build`
- Output directory: `build`

After deploy, test the Vercel URL first.

## 5. Connect the domain `maturiresults.in`

In Vercel:

1. Open the frontend project
2. Go to `Settings -> Domains`
3. Add:
   - `maturiresults.in`
   - `www.maturiresults.in`

Vercel will show the DNS records to add at your domain registrar.

Usually this means:

- `A` record or `ALIAS` for the root domain
- `CNAME` for `www`

Add exactly the values Vercel gives you.

## 6. Final production values

Frontend:

```env
REACT_APP_API_URL=https://maturiresults-api.onrender.com/api/auth
```

Backend:

```env
MONGO_URI=<atlas uri>
JWT_SECRET=<long random secret>
ADMIN_USERNAME=2451-00-000-000
CORS_ORIGINS=https://maturiresults.in,https://www.maturiresults.in
```

## 7. Local development values

Frontend local `.env`:

```env
PORT=3001
REACT_APP_API_URL=http://127.0.0.1:5000/api/auth
```

Backend local `.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/loginDB
JWT_SECRET=change-this-secret
ADMIN_USERNAME=2451-00-000-000
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```
