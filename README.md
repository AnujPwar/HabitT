# HabitSync 🌿

A gamified Habit Tracker built with React, Python/Flask, and MongoDB Atlas.

## 🚀 Deployment Guide

### Backend (Python)
- **Environment Variables**: Create a `.env` in `backend/` with:
  - `MONGO_URI`: Your MongoDB Atlas string.
  - `PORT`: (Optional) Defaults to 5000.
  - `DEBUG`: Set to `False` for production.
- **Run**: `gunicorn app:app` (on Linux) or `python app.py`.

### Frontend (React/Vite)
- **Environment Variables**: Create a `.env` in `frontend/` with:
  - `VITE_API_BASE`: The URL where your backend is hosted (e.g., `https://your-backend.render.com/api`).
- **Build**: `npm run build`.
- **Serve**: Deploy the `dist/` folder to Vercel, Netlify, or similar.

## ✨ Features
- **RPG System**: Gain XP and Level Up. Lose HP for missed days.
- **Visual Logs**: Upload and manage progress photos.
- **Weekly Navigation**: Scroll through future and past weeks.
- **Smart Suggestions**: Fast-add habits based on popular choices.
