# Connectify — MERN Social Media Platform

A full-stack social media platform built with **MongoDB, Express, React, Node.js (MERN)** and **TailwindCSS**.

## Features

- **Auth**: register, login, JWT sessions, change password, forgot/reset password
- **News Feed**: posts from you + friends, ranked by a recency + engagement score
- **Posts**: create/edit/delete, text + multi-photo/video uploads
- **Comments**: create/edit/delete, likes on comments
- **Likes**: like/unlike posts, see who liked
- **Notifications**: likes, comments, friend requests/accepts — unread badge in navbar
- **Stories**: photo/video/text stories that auto-expire after 24h (MongoDB TTL index), grouped story bar + full-screen viewer
- **Friend requests**: send/accept/decline/unfriend, pending request lists
- **Profiles**: edit bio/location/website, profile picture + cover photo upload, friends list

## Tech stack

- **Frontend**: React 18 (Vite), React Router, TailwindCSS, Axios, react-icons
- **Backend**: Node.js, Express, MongoDB + Mongoose, JWT, bcryptjs, Multer (file uploads)

## Project structure

```
social-media-platform/
├── client/          # React + Tailwind frontend (Vite)
└── server/          # Express + MongoDB backend API
```

## Local setup

### 1. Backend

```bash
cd server
cp .env.example .env    # fill in MONGO_URI and JWT_SECRET
npm install
npm run dev              # starts on http://localhost:5000
```

You need a MongoDB connection string — either a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster or a local `mongod` instance.

### 2. Frontend

```bash
cd client
npm install
npm run dev               # starts on http://localhost:5173
```

The Vite dev server proxies `/api` and `/uploads` to `http://localhost:5000`, so no extra config is needed locally.

Open `http://localhost:5173`, register a couple of test accounts, and try adding each other as friends, posting, commenting, and creating a story.

## Deployment

### Backend → Render

1. Push this repo to GitHub.
2. On [render.com](https://render.com), create a **New Web Service**, connect your repo, and set:
   - **Root directory**: `server`
   - **Build command**: `npm install`
   - **Start command**: `npm start`
3. Add environment variables (from `server/.env.example`): `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRE`, `CLIENT_URL` (your Netlify URL once deployed).
4. Deploy. Note the resulting URL, e.g. `https://your-app.onrender.com`.

   A `render.yaml` blueprint is included at the repo root if you prefer Render's "Blueprint" deploy flow.

   > Note: Render's free-tier filesystem is ephemeral, so uploaded photos/videos won't persist across restarts/deploys. For a production deployment, swap the local-disk storage in `server/middleware/upload.js` for a cloud storage provider such as Cloudinary, AWS S3, or Firebase Storage.

### Frontend → Netlify

1. On [netlify.com](https://www.netlify.com), create a **New site from Git**, pick this repo, and set:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`
2. Add environment variable `VITE_API_URL` = `https://your-app.onrender.com/api` (your Render backend URL from above).
3. Deploy. A `netlify.toml` in `client/` already configures the build and SPA redirect rules.
4. Once you have the Netlify URL, go back to Render and set `CLIENT_URL` to it (for CORS), then redeploy the backend.

## Pushing to GitHub

```bash
cd social-media-platform
git init
git add .
git commit -m "Initial commit: MERN social media platform"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## Notes / production hardening ideas

- Swap Multer's local disk storage for Cloudinary/S3 (uploads won't survive Render restarts otherwise).
- Add rate limiting (`express-rate-limit`) and helmet headers on the API.
- Add pagination/infinite scroll to the feed and comments for large datasets.
- Add real-time updates (Socket.io) for live notifications instead of polling.
- Send actual password-reset emails via nodemailer instead of returning the token in the API response (currently done for dev convenience).
