from .base import *

# Ensure debug is False in production
DEBUG = False

# Database configuration: prefers DATABASE_URL if available, falls back to individual variables
if env("DATABASE_URL", default=""):
    DATABASES = {
        "default": env.db("DATABASE_URL"),
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.mysql",
            "NAME": env("DB_NAME"),
            "USER": env("DB_USER"),
            "PASSWORD": env("DB_PASSWORD"),
            "HOST": env("DB_HOST"),
            "PORT": env("DB_PORT"),
        }
    }

DATABASES["default"]["OPTIONS"] = {
    "charset": "utf8mb4",
    "init_command": "SET sql_mode='STRICT_TRANS_TABLES'",
}

# Static files production serving storage (WhiteNoise)
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# CORS configuration for production
CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS", default=[])
CORS_ALLOW_CREDENTIALS = False

# Security headers (essential for production deployments)
SECURE_SSL_REDIRECT = env.bool("SECURE_SSL_REDIRECT", default=True)
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"

# Production-grade logging: log to console for container-based engines (e.g. Docker, Heroku)
LOGGING["handlers"]["console"]["formatter"] = "verbose"
LOGGING["loggers"]["django"]["level"] = "WARNING"
