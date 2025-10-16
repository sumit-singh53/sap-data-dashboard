from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import pandas as pd
from datetime import datetime, timedelta
import os
import random
import numpy as np

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Load data functions
def load_data():
    csv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'sales.csv')
    return pd.read_csv(csv_path)

def load_google_data():
    csv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'google_business_data.csv')
    return pd.read_csv(csv_path)

@app.route('/api/health')
def health_check():
    return jsonify({"status": "ok"})

@app.route('/api/sales')
def get_sales():
    # Load data
    df = load_data()
    
    # Apply filters
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    region = request.args.get('region')
    product = request.args.get('product')
    
    if start_date:
        df = df[df['date'] >= start_date]
    if end_date:
        df = df[df['date'] <= end_date]
    if region:
        df = df[df['region'] == region]
    if product:
        df = df[df['product'] == product]
    
    # Convert to JSON
    return jsonify(df.to_dict(orient='records'))

@app.route('/api/kpis')
def get_kpis():
    """Get real-time KPI data"""
    df = load_data()
    
    # Calculate KPIs with some real-time variation
    base_revenue = df['revenue'].sum()
    base_sales = df['sales'].sum()
    base_quantity = df['quantity'].sum()
    
    # Add some random variation for real-time effect
    variation = random.uniform(0.95, 1.05)
    
    kpis = {
        'total_revenue': round(base_revenue * variation, 2),
        'total_sales': round(base_sales * variation),
        'total_quantity': round(base_quantity * variation),
        'avg_order_value': round((base_revenue * variation) / (base_sales * variation), 2),
        'growth_rate': round(random.uniform(-5, 15), 1),
        'conversion_rate': round(random.uniform(2.5, 4.8), 1),
        'last_updated': datetime.now().isoformat()
    }
    
    return jsonify(kpis)

@app.route('/api/charts/revenue-trend')
def get_revenue_trend():
    """Get revenue trend data for charts"""
    df = load_data()
    df['date'] = pd.to_datetime(df['date'])
    
    # Group by date and sum revenue
    trend_data = df.groupby('date')['revenue'].sum().reset_index()
    trend_data['date'] = trend_data['date'].dt.strftime('%Y-%m-%d')
    
    return jsonify(trend_data.to_dict(orient='records'))

@app.route('/api/charts/region-performance')
def get_region_performance():
    """Get region performance data"""
    df = load_data()
    
    region_data = df.groupby('region').agg({
        'revenue': 'sum',
        'sales': 'sum',
        'quantity': 'sum'
    }).reset_index()
    
    return jsonify(region_data.to_dict(orient='records'))

@app.route('/api/charts/product-mix')
def get_product_mix():
    """Get product mix data for pie chart"""
    df = load_data()
    
    product_data = df.groupby('product')['revenue'].sum().reset_index()
    
    return jsonify(product_data.to_dict(orient='records'))

# Google Business Data Endpoints
@app.route('/api/google/data')
def get_google_data():
    """Get Google business data with filters"""
    df = load_google_data()
    
    # Apply filters
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    region = request.args.get('region')
    department = request.args.get('department')
    
    if start_date:
        df = df[df['date'] >= start_date]
    if end_date:
        df = df[df['date'] <= end_date]
    if region:
        df = df[df['region'] == region]
    if department:
        df = df[df['department'] == department]
    
    return jsonify(df.to_dict(orient='records'))

@app.route('/api/google/kpis')
def get_google_kpis():
    """Get Google business KPIs"""
    df = load_google_data()
    
    # Calculate KPIs with some real-time variation
    base_revenue = df['revenue'].sum()
    base_expenses = df['expenses'].sum()
    base_employees = df['employees'].sum()
    base_performance = df['performance_score'].mean()
    
    # Add some random variation for real-time effect
    variation = random.uniform(0.98, 1.02)
    
    kpis = {
        'total_revenue': round(base_revenue * variation, 2),
        'total_expenses': round(base_expenses * variation, 2),
        'total_employees': round(base_employees * variation),
        'avg_performance': round(base_performance * variation, 1),
        'revenue_growth': round(random.uniform(5, 25), 1),
        'expenses_growth': round(random.uniform(-5, 15), 1),
        'employees_growth': round(random.uniform(2, 12), 1),
        'performance_growth': round(random.uniform(1, 8), 1),
        'profit_margin': round(((base_revenue - base_expenses) / base_revenue) * 100, 1),
        'last_updated': datetime.now().isoformat()
    }
    
    return jsonify(kpis)

@app.route('/api/google/charts/revenue-trend')
def get_google_revenue_trend():
    """Get Google revenue trend data"""
    df = load_google_data()
    df['date'] = pd.to_datetime(df['date'])
    
    # Group by date and sum revenue
    trend_data = df.groupby('date')['revenue'].sum().reset_index()
    trend_data['date'] = trend_data['date'].dt.strftime('%Y-%m-%d')
    
    return jsonify(trend_data.to_dict(orient='records'))

@app.route('/api/google/charts/department-performance')
def get_google_department_performance():
    """Get Google department performance data"""
    df = load_google_data()
    
    dept_data = df.groupby('department').agg({
        'revenue': 'sum',
        'expenses': 'sum',
        'employees': 'sum',
        'performance_score': 'mean'
    }).reset_index()
    
    return jsonify(dept_data.to_dict(orient='records'))

@app.route('/api/google/charts/region-distribution')
def get_google_region_distribution():
    """Get Google region distribution data"""
    df = load_google_data()
    
    region_data = df.groupby('region')['revenue'].sum().reset_index()
    
    return jsonify(region_data.to_dict(orient='records'))

@app.route('/api/google/charts/revenue-expense')
def get_google_revenue_expense():
    """Get Google revenue vs expense trend"""
    df = load_google_data()
    df['date'] = pd.to_datetime(df['date'])
    
    trend_data = df.groupby('date').agg({
        'revenue': 'sum',
        'expenses': 'sum'
    }).reset_index()
    trend_data['date'] = trend_data['date'].dt.strftime('%Y-%m-%d')
    
    return jsonify(trend_data.to_dict(orient='records'))

@app.route('/api/google/charts/employee-performance')
def get_google_employee_performance():
    """Get Google employee vs performance scatter data"""
    df = load_google_data()
    
    scatter_data = df.groupby('department').agg({
        'employees': 'sum',
        'performance_score': 'mean'
    }).reset_index()
    
    return jsonify(scatter_data.to_dict(orient='records'))

@app.route('/api/google/charts/quarterly-trends')
def get_google_quarterly_trends():
    """Get Google quarterly trends"""
    df = load_google_data()
    
    quarterly_data = df.groupby('quarter').agg({
        'revenue': 'sum',
        'expenses': 'sum'
    }).reset_index()
    
    return jsonify(quarterly_data.to_dict(orient='records'))

@app.route('/api/google/charts/department-comparison')
def get_google_department_comparison():
    """Get Google department comparison radar data"""
    df = load_google_data()
    
    # Calculate normalized scores for radar chart
    dept_comparison = []
    for dept in df['department'].unique():
        dept_df = df[df['department'] == dept]
        
        # Normalize metrics to 0-100 scale
        revenue_score = min(100, (dept_df['revenue'].sum() / df['revenue'].sum()) * 500)
        efficiency_score = max(0, 100 - ((dept_df['expenses'].sum() / dept_df['revenue'].sum()) * 100))
        growth_score = random.uniform(60, 95)  # Simulated growth score
        performance_score = dept_df['performance_score'].mean()
        innovation_score = random.uniform(70, 98)  # Simulated innovation score
        
        dept_comparison.append({
            'department': dept,
            'revenue_score': round(revenue_score, 1),
            'efficiency_score': round(efficiency_score, 1),
            'growth_score': round(growth_score, 1),
            'performance_score': round(performance_score, 1),
            'innovation_score': round(innovation_score, 1)
        })
    
    return jsonify(dept_comparison)

@app.route('/api/google/charts/regional-heatmap')
def get_google_regional_heatmap():
    """Get Google regional heatmap data"""
    df = load_google_data()
    
    heatmap_data = df.groupby(['region', 'department'])['performance_score'].mean().reset_index()
    
    return jsonify(heatmap_data.to_dict(orient='records'))

@app.route('/api/google/charts/profitability')
def get_google_profitability():
    """Get Google profitability bubble chart data"""
    df = load_google_data()
    
    profitability_data = []
    for dept in df['department'].unique():
        dept_df = df[df['department'] == dept]
        revenue = dept_df['revenue'].sum() / 1000000  # Convert to millions
        profit_margin = ((dept_df['revenue'].sum() - dept_df['expenses'].sum()) / dept_df['revenue'].sum()) * 100
        market_share = random.uniform(10, 30)  # Simulated market share
        
        profitability_data.append({
            'department': dept,
            'revenue': round(revenue, 1),
            'profit_margin': round(profit_margin, 1),
            'market_share': round(market_share, 1)
        })
    
    return jsonify(profitability_data)

@app.route('/api/google/export')
def export_google_data():
    """Export Google business data as CSV"""
    df = load_google_data()
    
    # Apply same filters as /api/google/data
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    region = request.args.get('region')
    department = request.args.get('department')
    
    if start_date:
        df = df[df['date'] >= start_date]
    if end_date:
        df = df[df['date'] <= end_date]
    if region:
        df = df[df['region'] == region]
    if department:
        df = df[df['department'] == department]
    
    # Save filtered data to temporary file
    temp_csv = 'temp_google_data.csv'
    df.to_csv(temp_csv, index=False)
    
    return send_file(
        temp_csv,
        mimetype='text/csv',
        as_attachment=True,
        download_name='google_business_data.csv'
    )

@app.route('/api/sales/csv')
def get_sales_csv():
    df = load_data()
    
    # Apply same filters as /api/sales
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    region = request.args.get('region')
    product = request.args.get('product')
    
    if start_date:
        df = df[df['date'] >= start_date]
    if end_date:
        df = df[df['date'] <= end_date]
    if region:
        df = df[df['region'] == region]
    if product:
        df = df[df['product'] == product]
    
    # Save filtered data to temporary file
    temp_csv = 'temp_sales.csv'
    df.to_csv(temp_csv, index=False)
    
    return send_file(
        temp_csv,
        mimetype='text/csv',
        as_attachment=True,
        download_name='sales_data.csv'
    )

if __name__ == '__main__':
    app.run(port=5000, debug=True)