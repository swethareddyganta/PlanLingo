import json
import os
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        query_params = parse_qs(parsed_path.query)

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*') # Allow all origins for now
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

        response_data = {}

        if path == '/':
            response_data = {
                "message": "PlanLingo API",
                "version": "1.0.0",
                "status": "healthy"
            }
        elif path == '/health':
            response_data = {
                "status": "healthy",
                "service": "planlingo-api"
            }
        elif path == '/api/v1/test':
            response_data = {
                "message": "API is working",
                "groq_key_set": "GROQ_API_KEY" in os.environ,
                "openai_key_set": "OPENAI_API_KEY" in os.environ,
                "test_param": query_params.get('param', [''])[0]
            }
        else:
            self.send_response(404)
            self.end_headers()
            response_data = {"detail": "Not Found"}

        self.wfile.write(json.dumps(response_data).encode('utf-8'))

    def do_POST(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*') # Allow all origins for now
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

        response_data = {"message": f"POST request to {path} received"}

        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            request_body = json.loads(post_data.decode('utf-8'))
            response_data["received_data"] = request_body
        except (TypeError, ValueError, json.JSONDecodeError):
            response_data["error"] = "Invalid JSON in request body"

        self.wfile.write(json.dumps(response_data).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()