#!/usr/bin/env python3
"""
Mock Audio Analysis Server for WebContainer Demo
Simulates the behavior of the real Librosa backend for demonstration purposes.
"""

import json
import random
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse
import tempfile
import os

class MockAudioAnalysisHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight requests."""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        """Handle GET requests."""
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                'status': 'healthy',
                'message': 'Mock Audio Analysis API is running'
            }
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        """Handle POST requests for audio analysis."""
        if self.path == '/analyze':
            try:
                # Parse content length
                content_length = int(self.headers['Content-Length'])
                
                # Read the uploaded data (we won't actually process it)
                post_data = self.rfile.read(content_length)
                
                # Simulate processing time
                time.sleep(2)
                
                # Generate mock analysis results
                mock_result = self.generate_mock_analysis()
                
                # Send response
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                self.wfile.write(json.dumps(mock_result).encode())
                
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                error_response = {'error': f'Analysis failed: {str(e)}'}
                self.wfile.write(json.dumps(error_response).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def generate_mock_analysis(self):
        """Generate realistic mock analysis results."""
        # Generate realistic tempo (80-180 BPM)
        tempo = random.randint(80, 180)
        
        # Generate realistic song structure
        structures = [
            [
                {'label': 'Intro', 'start_time': 0, 'end_time': 12.5},
                {'label': 'Verse 1', 'start_time': 12.5, 'end_time': 42.8},
                {'label': 'Chorus', 'start_time': 42.8, 'end_time': 73.2},
                {'label': 'Verse 2', 'start_time': 73.2, 'end_time': 103.6},
                {'label': 'Chorus', 'start_time': 103.6, 'end_time': 134.0},
                {'label': 'Outro', 'start_time': 134.0, 'end_time': 156.3}
            ],
            [
                {'label': 'Intro', 'start_time': 0, 'end_time': 8.2},
                {'label': 'Verse 1', 'start_time': 8.2, 'end_time': 35.7},
                {'label': 'Chorus', 'start_time': 35.7, 'end_time': 63.1},
                {'label': 'Verse 2', 'start_time': 63.1, 'end_time': 90.5},
                {'label': 'Bridge', 'start_time': 90.5, 'end_time': 108.8},
                {'label': 'Chorus', 'start_time': 108.8, 'end_time': 145.2}
            ],
            [
                {'label': 'Intro', 'start_time': 0, 'end_time': 15.3},
                {'label': 'Verse 1', 'start_time': 15.3, 'end_time': 48.7},
                {'label': 'Chorus', 'start_time': 48.7, 'end_time': 82.1},
                {'label': 'Verse 2', 'start_time': 82.1, 'end_time': 115.5},
                {'label': 'Chorus', 'start_time': 115.5, 'end_time': 148.9},
                {'label': 'Outro', 'start_time': 148.9, 'end_time': 172.4}
            ]
        ]
        
        selected_structure = random.choice(structures)
        total_duration = selected_structure[-1]['end_time']
        
        return {
            'tempo': tempo,
            'structure': selected_structure,
            'duration': total_duration,
            'sample_rate': 44100
        }

    def log_message(self, format, *args):
        """Override to reduce verbose logging."""
        return

def run_mock_server(port=5000):
    """Run the mock audio analysis server."""
    server_address = ('', port)
    httpd = HTTPServer(server_address, MockAudioAnalysisHandler)
    
    print(f"Mock Audio Analysis Server running on port {port}")
    print("Endpoints:")
    print(f"  GET  http://localhost:{port}/health")
    print(f"  POST http://localhost:{port}/analyze")
    print("\nThis is a simulation for demonstration purposes.")
    print("The real backend would use Librosa for actual audio analysis.")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down mock server...")
        httpd.shutdown()

if __name__ == '__main__':
    run_mock_server()