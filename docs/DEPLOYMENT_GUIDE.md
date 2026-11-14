# Production Deployment Guide: NexusMind AI

## Recommended Production Architecture
* **Frontend**: Vercel
* **Backend**: Render / Railway
* **Database & File Storage**: Supabase (PostgreSQL + Supabase Storage)

---

## 1. Supabase Setup (Database & Storage)
1. Sign in to [Supabase](https://supabase.com) and create a new project (e.g. `nexusmind-prod`).
2. Go to the **SQL Editor**, open [backend/migrations/001_initial_schema.sql](../backend/migrations/001_initial_schema.sql), paste the contents, and click **Run**.
3. Under **Storage**, create a new bucket named `nexusmind-files` with **Public** set to `false` (private bucket).
4. Go to **Project Settings** -> **API** and copy:
   * **Project URL**: `https://<project-ref>.supabase.co`
   * **service_role secret**: (Used exclusively on the backend)
5. Under **Database Settings**, copy your **Connection String (URI)**.

---

## 2. Backend Deployment (Render)
1. Push your repository to GitHub.
2. Sign in to [Render](https://render.com) and click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Set the following configuration:
   * **Root Directory**: `backend`
   * **Runtime**: `Node`
   * **Build Command**: `npm install && npm run build`
   * **Start Command**: `npm start`
5. In **Environment Variables**, configure:
   * `NODE_ENV`: `production`
   * `PORT`: `5000`
   * `FRONTEND_URL`: `https://your-nexusmind.vercel.app`
   * `DATABASE_URL`: `postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres`
   * `JWT_SECRET`: `your_secure_random_jwt_secret_key`
   * `JWT_EXPIRES_IN`: `7d`
   * `GEMINI_API_KEY`: `your_google_gemini_api_key`
   * `GEMINI_MODEL`: `gemini-1.5-flash`
   * `SUPABASE_URL`: `https://<ref>.supabase.co`
   * `SUPABASE_SERVICE_ROLE_KEY`: `your_service_role_key`
   * `SUPABASE_STORAGE_BUCKET`: `nexusmind-files`
   * `COOKIE_SECURE`: `true`
   * `COOKIE_SAME_SITE`: `lax`
   * `MAX_FILE_SIZE_MB`: `100`
6. Click **Deploy Web Service**.
7. Copy your deployed backend URL: `https://nexusmind-backend.onrender.com`.

---

## 3. Frontend Deployment (Vercel)
1. Sign in to [Vercel](https://vercel.com) and click **Add New...** -> **Project**.
2. Import your GitHub repository.
3. Configure the Project:
   * **Framework Preset**: `Vite`
   * **Root Directory**: `frontend`
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
4. In **Environment Variables**, add:
   * `VITE_API_URL`: `https://nexusmind-backend.onrender.com/api`
5. Click **Deploy**.
6. Your live deployed frontend is now publicly accessible!

