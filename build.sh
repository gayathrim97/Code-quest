#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "==> Installing Python Requirements..."
pip install -r requirements.txt

echo "==> Collecting Static Files..."
python manage.py collectstatic --no-input

echo "==> Applying Database Migrations..."
python manage.py migrate --noinput

echo "==> Seeding initial challenge and quiz content..."
python manage.py seed_data

echo "==> Build finished successfully!"
