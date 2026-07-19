import multiprocessing
import os

# Bind address and port
bind = f"0.0.0.0:{os.environ.get('PORT', '8000')}"

# Worker count (based on cpu count recommendations)
workers = int(os.environ.get("GUNICORN_WORKERS", multiprocessing.cpu_count() * 2 + 1))

# Worker connection thread pool size
threads = int(os.environ.get("GUNICORN_THREADS", 2))

# Maximum requests a worker will process before restarting (prevents memory leaks)
max_requests = 1000
max_requests_jitter = 50

# Worker class
worker_class = "gthread"

# Connection timeout (seconds)
timeout = 30

# Logging configurations
loglevel = os.environ.get("LOG_LEVEL", "info")
accesslog = "-"
errorlog = "-"
