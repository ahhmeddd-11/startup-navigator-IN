# Startup Navigator — Backend

Production-grade Django + Django REST Framework backend for the Startup Navigator platform.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Virtual Environment Setup](#virtual-environment-setup)
4. [Dependency Installation](#dependency-installation)
5. [MySQL Configuration](#mysql-configuration)
6. [Environment Variables](#environment-variables)
7. [Running Migrations](#running-migrations)
8. [Running the Server](#running-the-server)
9. [Running Tests](#running-tests)
10. [Production Deployment Notes](#production-deployment-notes)

---

## Prerequisites

Ensure the following are installed and available on your system:

| Tool | Version | Notes |
|---|---|---|
| Python | 3.13+ | Required |
| pip | Latest | Included with Python |
| MySQL Server | 8.0+ | Must be running |
| Git | Any | Optional |

---

## Project Structure

```
backend/
│
├── config/                      # Django project configuration
│   ├── settings/
│   │   ├── __init__.py          # Loads local or production settings via DJANGO_ENV
│   │   ├── base.py              # Shared settings (DRF, JWT, logging, apps)
│   │   ├── local.py             # Development overrides (debug, MySQL, CORS)
│   │   └── production.py        # Production overrides (security, WhiteNoise)
│   ├── __init__.py              # Installs PyMySQL as MySQLdb fallback
│   ├── urls.py                  # Root URL configuration
│   ├── wsgi.py                  # WSGI entry point (Gunicorn)
│   └── asgi.py                  # ASGI entry point
│
├── apps/                        # Application modules
│   ├── __init__.py
│   ├── users/                   # User management (future: auth, profiles)
│   ├── resources/               # Startup resources (future: templates, guides)
│   ├── knowledge/               # Knowledge base (future: articles, schemes)
│   ├── ai/                      # AI integration (future: Gemini API, chat)
│   └── common/                  # Shared utilities
│       ├── constants/           # Project-wide constants
│       ├── exceptions/          # Custom exception classes
│       ├── permissions/         # Custom DRF permission classes
│       ├── validators/          # Field and business rule validators
│       ├── utils/               # Helper functions
│       └── services/            # Shared service layer interfaces
│
├── media/                       # User-uploaded files (not committed to git)
├── static/                      # Collected static files (not committed to git)
├── manage.py                    # Django command-line utility
├── requirements.txt             # Python dependencies
├── pytest.ini                   # Test runner configuration
├── .env                         # Local environment variables (not committed to git)
├── .env.example                 # Environment variable template
└── .gitignore                   # Git ignore rules
```

---

## Virtual Environment Setup

Create and activate a Python virtual environment inside the `backend/` directory:

**Windows (PowerShell):**
```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

**macOS / Linux:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

---

## Dependency Installation

With the virtual environment activated, install all dependencies:

```bash
pip install -r requirements.txt
```

### Dependency Overview

| Package | Purpose |
|---|---|
| `Django` | Web framework |
| `djangorestframework` | REST API toolkit |
| `djangorestframework-simplejwt` | JWT authentication |
| `django-cors-headers` | CORS policy management |
| `django-environ` | Environment variable handling |
| `mysqlclient` | Native MySQL database driver |
| `PyMySQL` | Pure-Python MySQL fallback driver |
| `Pillow` | Image processing (media uploads) |
| `gunicorn` | WSGI production server |
| `whitenoise` | Static file serving |
| `pytest` | Test framework |
| `pytest-django` | Django integration for pytest |

---

## MySQL Configuration

1. Ensure MySQL Server 8.0+ is running.

2. Create the database:

```sql
CREATE DATABASE startup_navigator
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
```

   Or use the MySQL CLI:

```bash
mysql -u root -p -e "CREATE DATABASE startup_navigator CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

3. Confirm the database exists:

```sql
SHOW DATABASES;
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description | Example |
|---|---|---|
| `DJANGO_SECRET_KEY` | Django secret key (keep this secret!) | `django-insecure-...` |
| `DJANGO_DEBUG` | Enable debug mode (`True` / `False`) | `True` |
| `DJANGO_ALLOWED_HOSTS` | Comma-separated list of allowed hosts | `127.0.0.1,localhost` |
| `DB_NAME` | MySQL database name | `startup_navigator` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | `your_password` |
| `DB_HOST` | MySQL host | `127.0.0.1` |
| `DB_PORT` | MySQL port | `3306` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated frontend origins | `http://localhost:5173` |
| `JWT_SECRET_KEY` | JWT signing key (keep this secret!) | `jwt-secret-...` |

### Switching Environments

Set `DJANGO_ENV` to control which settings file is loaded:

```bash
# Development (default — loads config/settings/local.py)
set DJANGO_ENV=local

# Production (loads config/settings/production.py)
set DJANGO_ENV=production
```

---

## Running Migrations

Apply all database migrations (creates Django's built-in tables):

```bash
python manage.py migrate
```

Create a superuser for the Django admin panel:

```bash
python manage.py createsuperuser
```

---

## Running the Server

**Development:**

```bash
python manage.py runserver
```

The server will be available at `http://127.0.0.1:8000/`.

The Django admin panel is accessible at `http://127.0.0.1:8000/admin/`.

**Production (via Gunicorn):**

```bash
gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

Collect static files before running in production:

```bash
python manage.py collectstatic --noinput
```

---

## Running Tests

```bash
pytest
```

Test discovery is configured via `pytest.ini`. Tests should be placed inside each app directory following Django conventions:

```
apps/users/tests/
apps/resources/tests/
...
```

---

## Production Deployment Notes

- Set `DJANGO_ENV=production` to load `config/settings/production.py`.
- Set `DJANGO_DEBUG=False` in your production `.env`.
- Run `python manage.py collectstatic` before starting the server.
- Use a reverse proxy (nginx, Caddy) in front of Gunicorn.
- Never commit `.env` to version control.
- Rotate `DJANGO_SECRET_KEY` and `JWT_SECRET_KEY` if they are ever exposed.
