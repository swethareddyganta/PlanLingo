"""
Basic API tests for PlanLingo backend
"""
import pytest
import json
from unittest.mock import patch
import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from api.index import handler
from http.server import BaseHTTPRequestHandler
from io import BytesIO


class MockRequest:
    def __init__(self, path, method='GET', headers=None, data=None):
        self.path = path
        self.method = method
        self.headers = headers or {}
        self.data = data or b''


class MockResponse:
    def __init__(self):
        self.status_code = None
        self.headers = {}
        self.data = b''
    
    def write(self, data):
        self.data += data
    
    def send_response(self, code):
        self.status_code = code
    
    def send_header(self, key, value):
        self.headers[key] = value
    
    def end_headers(self):
        pass


def test_root_endpoint():
    """Test the root endpoint returns correct response"""
    mock_req = MockRequest('/')
    mock_resp = MockResponse()
    
    # Create a mock handler
    class MockHandler(handler):
        def __init__(self):
            pass
        
        def __getattr__(self, name):
            return getattr(mock_resp, name)
    
    mock_handler = MockHandler()
    mock_handler.path = '/'
    mock_handler.wfile = mock_resp
    mock_handler.headers = {}
    
    # Mock the methods
    mock_handler.send_response = mock_resp.send_response
    mock_handler.send_header = mock_resp.send_header
    mock_handler.end_headers = mock_resp.end_headers
    mock_handler.wfile.write = mock_resp.write
    
    # Test GET request
    mock_handler.do_GET()
    
    # Verify response
    assert mock_resp.status_code == 200
    response_data = json.loads(mock_resp.data.decode('utf-8'))
    assert response_data['message'] == 'PlanLingo API'
    assert response_data['version'] == '1.0.0'
    assert response_data['status'] == 'healthy'


def test_health_endpoint():
    """Test the health endpoint"""
    mock_req = MockRequest('/health')
    mock_resp = MockResponse()
    
    class MockHandler(handler):
        def __init__(self):
            pass
        
        def __getattr__(self, name):
            return getattr(mock_resp, name)
    
    mock_handler = MockHandler()
    mock_handler.path = '/health'
    mock_handler.wfile = mock_resp
    mock_handler.headers = {}
    
    mock_handler.send_response = mock_resp.send_response
    mock_handler.send_header = mock_resp.send_header
    mock_handler.end_headers = mock_resp.end_headers
    mock_handler.wfile.write = mock_resp.write
    
    mock_handler.do_GET()
    
    assert mock_resp.status_code == 200
    response_data = json.loads(mock_resp.data.decode('utf-8'))
    assert response_data['status'] == 'healthy'
    assert response_data['service'] == 'planlingo-api'


def test_api_v1_test_endpoint():
    """Test the API v1 test endpoint"""
    mock_req = MockRequest('/api/v1/test')
    mock_resp = MockResponse()
    
    class MockHandler(handler):
        def __init__(self):
            pass
        
        def __getattr__(self, name):
            return getattr(mock_resp, name)
    
    mock_handler = MockHandler()
    mock_handler.path = '/api/v1/test'
    mock_handler.wfile = mock_resp
    mock_handler.headers = {}
    
    mock_handler.send_response = mock_resp.send_response
    mock_handler.send_header = mock_resp.send_header
    mock_handler.end_headers = mock_resp.end_headers
    mock_handler.wfile.write = mock_resp.write
    
    mock_handler.do_GET()
    
    assert mock_resp.status_code == 200
    response_data = json.loads(mock_resp.data.decode('utf-8'))
    assert response_data['message'] == 'API is working'
    assert 'groq_key_set' in response_data
    assert 'openai_key_set' in response_data


def test_404_endpoint():
    """Test 404 for unknown endpoints"""
    mock_req = MockRequest('/unknown')
    mock_resp = MockResponse()
    
    class MockHandler(handler):
        def __init__(self):
            pass
        
        def __getattr__(self, name):
            return getattr(mock_resp, name)
    
    mock_handler = MockHandler()
    mock_handler.path = '/unknown'
    mock_handler.wfile = mock_resp
    mock_handler.headers = {}
    
    mock_handler.send_response = mock_resp.send_response
    mock_handler.send_header = mock_resp.send_header
    mock_handler.end_headers = mock_resp.end_headers
    mock_handler.wfile.write = mock_resp.write
    
    mock_handler.do_GET()
    
    assert mock_resp.status_code == 404
    response_data = json.loads(mock_resp.data.decode('utf-8'))
    assert response_data['detail'] == 'Not Found'


if __name__ == '__main__':
    pytest.main([__file__])
