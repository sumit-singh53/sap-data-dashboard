#!/usr/bin/env python3
"""
Google Analytics Dashboard Launcher
Starts the Flask API server and web server, then opens the dashboard.
"""

import subprocess
import webbrowser
import time
import os
import sys
from pathlib import Path

def start_servers():
    """Start both Flask API and web servers."""
    api_path = Path(__file__).parent / "mock_api"
    
    try:
        print("🚀 Starting Flask API server...")
        # Start Flask server
        api_process = subprocess.Popen(
            [sys.executable, "app.py"],
            cwd=api_path,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        time.sleep(2)  # Give API server time to start
        
        print("🌐 Starting web server...")
        # Start web server
        web_process = subprocess.Popen(
            [sys.executable, "-m", "http.server", "8080"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        time.sleep(2)  # Give web server time to start
        
        return api_process, web_process
    except Exception as e:
        print(f"❌ Error starting servers: {e}")
        return None, None

def open_dashboard():
    """Open the dashboard in the default browser."""
    dashboard_url = "http://localhost:8080"
    print(f"🌐 Opening dashboard: {dashboard_url}")
    webbrowser.open(dashboard_url)

def main():
    """Main launcher function."""
    print("=" * 60)
    print("🎯 Google Analytics Dashboard Launcher")
    print("=" * 60)
    
    # Start servers
    api_process, web_process = start_servers()
    
    if api_process and web_process:
        print("✅ API server started successfully!")
        print("✅ Web server started successfully!")
        print("📊 API available at: http://localhost:5000")
        print("🌐 Dashboard available at: http://localhost:8080")
        
        # Open dashboard
        time.sleep(1)
        open_dashboard()
        
        print("\n" + "=" * 60)
        print("🎉 Google Analytics Dashboard is ready!")
        print("=" * 60)
        print("📝 Instructions:")
        print("   • Dashboard should open automatically in your browser")
        print("   • If not, visit: http://localhost:8080")
        print("   • API server: http://localhost:5000")
        print("   • Press Ctrl+C to stop both servers")
        print("=" * 60)
        
        try:
            # Keep the script running
            api_process.wait()
        except KeyboardInterrupt:
            print("\n🛑 Stopping servers...")
            api_process.terminate()
            web_process.terminate()
            print("✅ Servers stopped successfully!")
    else:
        print("❌ Failed to start servers!")
        sys.exit(1)

if __name__ == "__main__":
    main()