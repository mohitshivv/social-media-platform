<div align="center">

# Connectify

**A social media platform to share posts, photos, videos and stories with your friends.**

![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

### [🌐 Live Demo](https://sociall-media-app.netlify.app) &nbsp;·&nbsp; [⚙️ Backend API](https://social-media-platform-9s59.onrender.com/api/health)

</div>

---

> ⏳ **First time opening the app?** The backend runs on a free plan that sleeps when idle, so the very first request can
> take **30–60 seconds**. Open the [Backend API link](https://social-media-platform-9s59.onrender.com/api/health) first,
> wait until it shows `{"status":"ok"}`, then use the app.

## ✨ Features

**Accounts**
- Sign up, log in, change password, and reset a forgotten password
- Secure sessions with JWT; passwords are hashed with bcrypt

**Posts & feed**
- Post text, photos and videos; edit or delete your own posts and remove individual photos/videos
- A news feed with your posts and your friends' posts, ranked so popular and recent posts show first
- Like posts and comments, see who liked a post, and comment (add, edit, delete)

**Stories**
- Share a photo, video or colourful text story that disappears after 24 hours

**Friends & notifications**
- Send, accept, decline and cancel friend requests, and unfriend
- Notifications for likes, comments, friend requests and `@mentions`, with an unread badge
- Search for people and open any profile

**Profiles**
- Profile picture, cover photo, bio, location, website and a friends list

<details>
<summary><b>📋 See the detailed feature list (how each feature works)</b></summary>

<br>

| Area | Feature | How it works |
|---|---|---|
| Accounts | Register & login | Name, unique username, email and password; duplicates are rejected |
| Accounts | Forgot / reset password | Generates a secure reset token that expires in 30 minutes and works only once |
| Accounts | Change password | Settings page (gear icon); asks for the current password |
| Feed | Ranking | Each post gets a score: `likes × 2 + comments × 3 − age in hours × 0.5` |
| Posts | Create | Text plus up to 10 photos/videos per post (max 50 MB per file) |
| Posts | Edit / delete | Only the author can edit the text, delete the post or remove a single photo/video |
| Comments | Add / edit / delete | Only the author can edit or delete their comment |
| Likes | Posts and comments | Toggle like; click "N likes" on a post to see who liked it |
| Notifications | Types | Like, comment, friend request, request accepted, `@mention` |
| Notifications | Details | Shows who did it plus a preview of the post; clicking opens that post (or the Friends page) |
| Stories | Create | Photo, video or text (choose a background colour) |
| Stories | Expiry | Removed automatically after 24 hours (MongoDB TTL index); you can also delete your own story |
| Stories | Viewer | Full-screen with progress bars, auto-advance, and who posted and when |
| Friends | Requests | Send, accept, decline, cancel a sent request, unfriend; a declined request can be sent again |
| Profiles | Edit | Name, bio, location, website, profile picture, cover photo |
| Profiles | Friend list | Friends grid on every profile; the friend button always shows the real status |
| Extras | Search, single post page, comment likes, `@mentions`, "Media unavailable" placeholder | |

</details>

## 🚀 Try it in 1 minute

You need two accounts to see the social features (use a normal window and an incognito window).

1. Register two accounts, for example `alice` and `bob`.
2. As Alice, search for Bob and click **Add Friend**. As Bob, open **Friends** and click **Accept**.
3. As Alice, create a post and a story. As Bob, refresh the feed, then like and comment.
4. As Alice, click the 🔔 bell to see the notifications. Mention someone with `@bob` to notify them.

## 🛠️ Tech stack

| | |
|---|---|
| **Frontend** | React (Vite), React Router, TailwindCSS, Axios |
| **Backend** | Node.js, Express, JWT, bcryptjs, Multer |
| **Database** | MongoDB (Atlas) with Mongoose |
| **Hosting** | Netlify (frontend) and Render (backend) |

## 💻 Run it locally

You need Node.js 18+ and a MongoDB connection string (a free MongoDB Atlas cluster works).

```bash
git clone https://github.com/mohitshivv/social-media-platform.git
cd social-media-platform

# Backend  ->  http://localhost:5000
cd server
cp .env.example .env      # add your own values
npm install
npm run dev

# Frontend (new terminal)  ->  http://localhost:5173
cd client
npm install
npm run dev
```

**Environment variables** (`server/.env`)

| Variable | What it is |
|---|---|
| `MONGO_URI` | Your MongoDB connection string |
| `JWT_SECRET` | A long random secret used to sign logins |
| `JWT_EXPIRE` | Login lifetime, e.g. `7d` |
| `CLIENT_URL` | Frontend address allowed by CORS (no trailing slash) |

For deployment, the frontend also needs `VITE_API_URL` set to the backend URL ending in `/api`.

## 📁 Project structure

```
client/   React + Tailwind app  (pages, components, context, api)
server/   Express API           (models, routes, middleware)
```

<details>
<summary><b>🔌 See the API endpoints</b></summary>

<br>

All routes except register, login and password reset need an `Authorization: Bearer <token>` header.

| Area | Endpoints |
|---|---|
| **Auth** `/api/auth` | `POST /register` · `POST /login` · `GET /me` · `PUT /change-password` · `POST /forgot-password` · `PUT /reset-password/:token` |
| **Users** `/api/users` | `GET /?search=` · `GET /:username` · `PUT /profile` · `PUT /profile-picture` · `PUT /cover-photo` |
| **Posts** `/api/posts` | `POST /` · `GET /feed` · `PUT /:id` · `DELETE /:id` · `PUT /:id/like` · `GET /:id/likes` · `DELETE /:id/media/:mediaId` |
| **Single post** `/api/post` | `GET /:id` |
| **Comments** `/api/comments` | `POST /:postId` · `GET /post/:postId` · `PUT /:id` · `DELETE /:id` · `PUT /:id/like` |
| **Stories** `/api/stories` | `POST /` · `GET /` · `PUT /:id/view` · `DELETE /:id` |
| **Friends** `/api/friends` | `POST /request/:userId` · `PUT /accept/:requestId` · `PUT /decline/:requestId` · `DELETE /cancel/:requestId` · `DELETE /:userId` · `GET /requests` · `GET /sent` · `GET /status/:userId` |
| **Notifications** `/api/notifications` | `GET /` · `PUT /:id/read` · `PUT /read-all` |

</details>

## 🌍 Deployment

- **Backend (Render):** root directory `server`, build `npm install`, start `npm start`, plus the environment variables above.
- **Frontend (Netlify):** base directory `client`, build `npm run build`, publish directory `client/dist`, plus `VITE_API_URL`.
- In MongoDB Atlas, allow network access from `0.0.0.0/0` so Render can connect.

## 📝 Good to know

- **Uploaded photos and videos** are stored on the server's disk. On the free hosting plan this disk is temporary, so older
  uploads can disappear after a restart (a "Media unavailable" placeholder is shown instead). All other data lives in MongoDB.
  For permanent storage, connect a service like Cloudinary or AWS S3.
- **Password reset** shows the reset link on screen because no email service is connected in this demo.
- `@mentions` need the exact username.

---

<div align="center">

Built by **Mohit** · [GitHub @mohitshivv](https://github.com/mohitshivv)

</div>
