#!/bin/bash
# Build script for Vercel deployment

# Install system dependencies for psycopg2
apt-get update
apt-get install -y libpq-dev

# Install Python dependencies
pip install -r requirements.txt
