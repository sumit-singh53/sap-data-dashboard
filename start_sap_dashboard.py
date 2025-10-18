#!/usr/bin/env python3
"""
SAP Dashboard Launcher
Enhanced Business Intelligence Dashboard with Power BI-style interactivity
"""

import subprocess
import sys
import time
import webbrowser
import os
from pathlib import Path

def check_dependencies():
    """Check if required Python packages are installed"""
    required_packages = ['flask', 'flask-cors', 'pandas', 'numpy']
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"❌ Missing required packages: {', '.join(missing_packages)}")
        print("📦 Installing missing packages...")
        
        for package in missing_packages:
            try:
                subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
                print(f"✅ Installed {package}")
            except subprocess.CalledProcessError:
                print(f"❌ Failed to install {package}")
                return False
    
    return True

def start_api_server():
    """Start the Flask API server"""
    print("🚀 Starting SAP Dashboard API Server...")
    
    api_script = Path(__file__).parent / 'mock_api' / 'app.py'
    
    if not api_script.exists():
        print(f"❌ API script not found: {api_script}")
        return None
    
    # Check if data file exists
    data_file = Path(__file__).parent / 'data' / 'enhanced_business_data.csv'
    if not data_file.exists():
        print(f"❌ Data file not found: {data_file}")
        print("📁 Please ensure enhanced_business_data.csv exists in the data folder")
        return None
    
    try:
        # Start the Flask server in a subprocess with better error handling
        process = subprocess.Popen([
            sys.executable, str(api_script)
        ], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, 
           creationflags=subprocess.CREATE_NEW_CONSOLE if os.name == 'nt' else 0)
        
        # Give the server more time to start
        time.sleep(5)
        
        # Check if the process is still running
        if process.poll() is None:
            print("✅ API Server started successfully on http://localhost:5000")
            
            # Test the API connection
            try:
                import urllib.request
                urllib.request.urlopen('http://localhost:5000/api/health', timeout=5)
                print("✅ API Health check passed")
            except Exception as e:
                print(f"⚠️ API started but health check failed: {e}")
            
            return process
        else:
            stdout, stderr = process.communicate()
            print(f"❌ API Server failed to start:")
            if stdout:
                print(f"OUTPUT: {stdout.decode()}")
            return None
            
    except Exception as e:
        print(f"❌ Error starting API server: {e}")
        return None

def open_dashboard():
    """Open the SAP dashboard in the default web browser"""
    dashboard_path = Path(__file__).parent / 'sap-dashboard.html'
    
    if not dashboard_path.exists():
        print(f"❌ Dashboard file not found: {dashboard_path}")
        return False
    
    try:
        # Convert to file URL
        dashboard_url = f"file://{dashboard_path.absolute()}"
        print(f"🌐 Opening SAP Dashboard: {dashboard_url}")
        
        webbrowser.open(dashboard_url)
        return True
        
    except Exception as e:
        print(f"❌ Error opening dashboard: {e}")
        return False

def main():
    """Main function to start the SAP Dashboard"""
    print("=" * 60)
    print("🏢 SAP BUSINESS INTELLIGENCE DASHBOARD")
    print("=" * 60)
    print("🎯 Features:")
    print("   • Power BI-style interactivity")
    print("   • Real-time data visualization")
    print("   • Advanced analytics & insights")
    print("   • PDF/CSV report generation")
    print("   • Responsive design (mobile + desktop)")
    print("   • Dark/Light theme support")
    print("=" * 60)
    
    # Check if all required files exist
    required_files = [
        'sap-dashboard.html',
        'sap-dashboard.js', 
        'sap-styles.css',
        'mock_api/app.py',
        'data/enhanced_business_data.csv'
    ]
    
    missing_files = []
    for file_path in required_files:
        if not Path(file_path).exists():
            missing_files.append(file_path)
    
    if missing_files:
        print("❌ Missing required files:")
        for file_path in missing_files:
            print(f"   • {file_path}")
        print("\n📁 Please ensure all dashboard files are present")
        input("Press Enter to exit...")
        return 1
    
    # Check dependencies
    print("🔍 Checking Python dependencies...")
    if not check_dependencies():
        print("❌ Failed to install required dependencies")
        input("Press Enter to exit...")
        return 1
    
    # Start API server
    print("🚀 Starting API server...")
    api_process = start_api_server()
    if not api_process:
        print("❌ Failed to start API server")
        print("\n🔧 Troubleshooting tips:")
        print("   • Check if port 5000 is already in use")
        print("   • Ensure Python and pip are properly installed")
        print("   • Try running: pip install flask flask-cors pandas numpy")
        input("Press Enter to exit...")
        return 1
    
    # Wait a moment for server to fully initialize
    print("⏳ Initializing server...")
    time.sleep(3)
    
    # Open dashboard
    print("🌐 Opening dashboard...")
    if not open_dashboard():
        print("❌ Failed to open dashboard")
        print("🔧 Manual access: Open sap-dashboard.html in your browser")
        api_process.terminate()
        input("Press Enter to exit...")
        return 1
    
    print("\n🎉 SAP Dashboard launched successfully!")
    print("\n📊 Dashboard Features:")
    print("   • Interactive charts with hover tooltips")
    print("   • Dynamic filters (year, region, department)")
    print("   • Real-time KPI monitoring")
    print("   • Advanced analytics section")
    print("   • Report generation (PDF/CSV)")
    print("   • Business insights & recommendations")
    
    print("\n🔧 Controls:")
    print("   • Use filters in the header to slice data")
    print("   • Click theme toggle (top-right) for dark mode")
    print("   • Navigate between sections using sidebar")
    print("   • Generate reports in the Reports section")
    
    print("\n⚡ API Server running on: http://localhost:5000")
    print("🌐 Dashboard URL: file://" + str(Path(__file__).parent / 'sap-dashboard.html'))
    
    try:
        print("\n⏹️  Press Ctrl+C to stop the server...")
        api_process.wait()
    except KeyboardInterrupt:
        print("\n🛑 Shutting down SAP Dashboard...")
        try:
            api_process.terminate()
            api_process.wait(timeout=5)
        except:
            api_process.kill()
        print("✅ Dashboard stopped successfully")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())