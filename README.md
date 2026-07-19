# 🚀 Startup Navigator – AI-Powered Startup Intelligence Platform

> **An AI-powered platform that helps Indian entrepreneurs discover startup knowledge, government schemes, resources, and actionable guidance through an intelligent assistant.**

![Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB)
![Backend](https://img.shields.io/badge/Backend-Django%20REST%20Framework-092E20)
![Database](https://img.shields.io/badge/Database-PostgreSQL-blue)
![AI](https://img.shields.io/badge/AI-Google%20Gemini-orange)

---

# Copyright & Intellectual Property

**Copyright © 2026 Syed Ahmed Ali. All Rights Reserved.**

This repository is published for **portfolio, educational, and technical evaluation purposes only**.

Unless explicitly authorized in writing by the author:
- No copying, redistribution, relicensing, or commercial use.
- No derivative works from substantial portions of this project.
- The source code, architecture, UI/UX, documentation, and workflows remain the intellectual property of the author.

---

# Overview

Startup Navigator is a full-stack AI-powered platform built with React, Django REST Framework, PostgreSQL, and Google Gemini. It centralizes startup resources, government schemes, AI guidance, and knowledge into a single modern web application.

## Features

- JWT Authentication
- AI Assistant (Google Gemini)
- Startup Articles
- Government Schemes
- Startup Resources
- Bookmarks
- Search History
- Personalized Dashboard
- Admin Panel
- Responsive Design

## Tech Stack

### Frontend
- React
- Vite
- TypeScript
- Tailwind CSS
- TanStack Router
- TanStack Query
- Axios

### Backend
- Python
- Django
- Django REST Framework
- SimpleJWT

### Database
- PostgreSQL

### AI
- Google Gemini API

### Deployment
- Vercel
- Render
- Render PostgreSQL

## Architecture

```text
React + Vite
      │
Axios + JWT
      │
Django REST API
      │
Business Logic
      │
PostgreSQL
      │
Google Gemini
```

## Security

- JWT Authentication
- Password Hashing
- Secure Environment Variables
- CORS Protection
- Token Refresh
- Input Validation

## Installation

### Backend

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
npm install
npm run dev
```

## Environment Variables

Backend:

```env
DJANGO_SECRET_KEY=
DATABASE_URL=
JWT_SECRET_KEY=
GEMINI_API_KEY=
GEMINI_MODEL=
```

Frontend:

```env
VITE_API_URL=http://localhost:8000
```

## Future Improvements

- Forgot Password via Email OTP
- Notification System
- Startup Matching
- Investor Discovery
- Multi-language Support
- RAG Knowledge Base
- Mobile Application

# License

**All Rights Reserved**

This project is published for portfolio and technical evaluation purposes only.

# Author

**Syed Ahmed Ali**

GitHub: https://github.com/ahhmeddd-11
Portfolio: https://ahhmeddd.netlify.app/
