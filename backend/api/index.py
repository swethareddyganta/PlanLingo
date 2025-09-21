import json
import os
from http.server import BaseHTTPRequestHandler

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
        if self.path == '/':
            response = {
                "message": "PlanLingo API", 
                "version": "1.0.0",
                "status": "healthy"
            }
        elif self.path == '/health':
            response = {
                "status": "healthy", 
                "service": "planlingo-api"
            }
        elif self.path == '/api/v1/test':
            response = {
                "message": "API is working", 
                "groq_key": "GROQ_API_KEY" in os.environ,
                "openai_key": "OPENAI_API_KEY" in os.environ
            }
        else:
            response = {
                "message": "PlanLingo API", 
                "version": "1.0.0",
                "status": "healthy"
            }
        
        self.wfile.write(json.dumps(response).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_POST(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
        response = {
            "message": "POST request received", 
            "status": "success"
        }
        
        self.wfile.write(json.dumps(response).encode())