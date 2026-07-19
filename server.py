import http.server
import socketserver
import urllib.request
import json
import os

PORT = 8080

class ProxyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/chat':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            # Forward the request to NVIDIA
            url = "https://integrate.api.nvidia.com/v1/chat/completions"
            req = urllib.request.Request(url, data=post_data, headers={
                'Content-Type': 'application/json',
                'Authorization': self.headers['Authorization']
            })
            
            try:
                with urllib.request.urlopen(req) as response:
                    res_body = response.read()
                    self.send_response(response.status)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(res_body)
            except urllib.error.HTTPError as e:
                self.send_response(e.code)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(e.read())
        else:
            super().do_POST()

Handler = ProxyHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving at port {PORT} with NVIDIA API Proxy")
    httpd.serve_forever()
