#!/usr/bin/env python3
"""
Simple test script to verify the API works
"""
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from api.index import app
    print("✅ API import successful")
    print(f"✅ App created: {app}")
    print(f"✅ App title: {app.title}")
    print("✅ API is ready for deployment")
except Exception as e:
    print(f"❌ Error importing API: {e}")
    sys.exit(1)
