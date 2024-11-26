#!/bin/sh

# Apply migrations
echo "Applying migrations"
python manage.py makemigrations || echo "make migrations failed!"
python manage.py migrate || echo "Migration failed!"

# Start the django server
echo "Starting django server..."
python manage.py runserver 0.0.0.0:8003