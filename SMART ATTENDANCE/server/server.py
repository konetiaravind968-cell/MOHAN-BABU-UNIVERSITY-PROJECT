#!/usr/bin/env python3
"""
Smart Attendance Management System (SAMS)
Lightweight HTTP Server for Local Web Hosting & Presentation
"""
import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8080
DIRECTORY = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def run():
    os.chdir(DIRECTORY)
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        url = f"http://localhost:{PORT}/index.html"
        print("=" * 70)
        print(" SMART ATTENDANCE MANAGEMENT SYSTEM (SAMS) - DBMS MINI PROJECT")
        print("=" * 70)
        print(f" Serving project files at: {DIRECTORY}")
        print(f" Server running at:        {url}")
        print("=" * 70)
        print(" Press Ctrl+C in this terminal window to stop the server.")
        print("-" * 70)
        try:
            webbrowser.open(url)
        except Exception:
            pass
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n Server shut down successfully.")
            sys.exit(0)

if __name__ == "__main__":
    run()
