import os

from django.core.asgi import get_asgi_application

# Point to our modular settings package
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

application = get_asgi_application()
