"""
ASGI config for backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os
import sys

# Check if the virtual environment is active
if os.getenv('VIRTUAL_ENV') is None:
    sys.stderr.write("Please activate the virtual environment before running this script.\n")
    sys.exit(1)

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

application = get_asgi_application()
