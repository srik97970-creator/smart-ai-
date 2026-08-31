# 🚀 Deployment Guide: Vercel (Frontend) & Render (Backend)

This guide walks you through deploying your **SmartShop AI** application. 

---

## 💻 1. Frontend Deployment (Vercel)

Vercel is ideal for hosting the static React/Vite frontend.

### Configuration (`frontend/vercel.json`)
We have already created a `frontend/vercel.json` file in your repository:
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://<your-render-backend-name>.onrender.com/api/:path*"
    },
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ]
}
```
> [!IMPORTANT]
> Once you deploy your backend on Render, replace `https://smartshop-ai-backend.onrender.com` in your `frontend/vercel.json` file with your actual Render service URL, commit, and push.

### Steps to Deploy on Vercel:
1. Go to [vercel.com](https://vercel.com/) and log in.
2. Click **Add New** > **Project**.
3. Import your GitHub repository.
4. Set the **Root Directory** of the project to `frontend`.
5. Under **Build & Development Settings**, Vercel will auto-detect **Vite**:
   * Build Command: `npm run build`
   * Output Directory: `dist`
   * Install Command: `npm install`
6. Click **Deploy**.

---

## 🖧 2. Backend Deployment (Render)

Render will host the Node.js Express server backend.

> [!WARNING]
> Because Render instances have an ephemeral file system (files reset when the server restarts), you **must** connect a database like Supabase to persist your inventory and credit ledger (Khata) details permanently.

### Steps to Deploy on Render:
1. Log in to [Render](https://render.com/).
2. Click **New** > **Web Service**.
3. Connect your GitHub repository.
4. Set the configurations:
   * **Name**: `smartshop-ai-backend` (or a name of your choice)
   * **Root Directory**: `backend`
   * **Runtime**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `node server.js`
5. Under **Advanced**, click **Add Environment Variable** and specify:
   * `NODE_ENV`: `production`
   * `GEMINI_API_KEY`: `your_google_gemini_api_key` (Optional: for AI Assistant features)
   * `SUPABASE_URL`: `your_supabase_project_url` (Required for persistent databases)
   * `SUPABASE_KEY`: `your_supabase_anon_public_key` (Required for persistent databases)
6. Click **Create Web Service**.

---

## 🛢️ 3. Setting Up Supabase Database (Recommended)
To run the SQL tables on Supabase:
1. Create a free project on [supabase.com](https://supabase.com/).
2. Go to the **SQL Editor** tab in your Supabase dashboard.
3. Paste the contents of `backend/database/supabase-schema.sql` and run it to initialize all tables (`shops`, `products`, `sales`, `sale_items`, `customers`, `expenses`, `offers`, `pamphlets`, `users`, `credit_transactions`, `credit_payments`).
4. Copy your project's **API URL** and **Anon Public Key** from **Settings > API** and paste them into your Render Web Service environment variables.
