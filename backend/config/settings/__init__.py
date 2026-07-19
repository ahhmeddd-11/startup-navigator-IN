import os

# Determine which settings to load based on DJANGO_ENV, defaulting to 'local'
env_name = os.environ.get("DJANGO_ENV", "local")

if env_name == "production":
    from .production import *
else:
    from .local import *
