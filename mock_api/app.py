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
    # Use enhanced business data as the main data source
    enhanced_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'enhanced_business_data.csv')
    if os.path.exists(enhanced_path):
        print(f"Loading enhanced business data from {enhanced_path}")
        return pd.read_csv(enhanced_path)
    else:
        print("Enhanced business data not found!")
        return pd.DataFrame()  # Return empty DataFrame if no data

def load_google_data():
    # Use the same enhanced data
    return load_data()

@app.route('/api/health')
def health_check():
    return jsonify({"status": "ok"})

@app.route('/api/test')
def test_route():
    return jsonify({"message": "Test route working", "timestamp": datetime.now().isoformat()})

@app.route('/api/sales')
def get_sales():
    # Load data (using enhanced business data)
    df = load_data()
    
    if df.empty:
        return jsonify([])
    
    # Apply filters (adapt to enhanced data columns)
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
    
    # Convert to JSON
    return jsonify(df.to_dict(orient='records'))

@app.route('/api/kpis')
def get_kpis():
    """Get real-time KPI data"""
    df = load_data()
    
    if df.empty:
        return jsonify({})
    
    # Calculate KPIs with some real-time variation using enhanced data
    base_revenue = df['revenue'].sum() if 'revenue' in df.columns else 0
    base_expenses = df['expenses'].sum() if 'expenses' in df.columns else 0
    base_employees = df['employees'].sum() if 'employees' in df.columns else 0
    
    # Add some random variation for real-time effect
    variation = random.uniform(0.95, 1.05)
    
    kpis = {
        'total_revenue': round(base_revenue * variation, 2),
        'total_expenses': round(base_expenses * variation, 2),
        'total_profit': round((base_revenue - base_expenses) * variation, 2),
        'total_employees': round(base_employees * variation),
        'growth_rate': round(random.uniform(-5, 15), 1),
        'avg_performance': round(df['performance_score'].mean() if 'performance_score' in df.columns else 85.0, 1),
        'last_updated': datetime.now().isoformat()
    }
    
    return jsonify(kpis)

@app.route('/api/charts/revenue-trend')
def get_revenue_trend():
    """Get revenue trend data for charts"""
    df = load_data()
    
    if df.empty or 'revenue' not in df.columns:
        return jsonify([])
    
    df['date'] = pd.to_datetime(df['date'])
    
    # Group by date and sum revenue
    trend_data = df.groupby('date')['revenue'].sum().reset_index()
    trend_data['date'] = trend_data['date'].dt.strftime('%Y-%m-%d')
    
    return jsonify(trend_data.to_dict(orient='records'))

@app.route('/api/charts/monthly-summary')
def get_monthly_summary():
    """Get monthly summary data"""
    df = load_data()
    
    if df.empty:
        return jsonify([])
    
    df['date'] = pd.to_datetime(df['date'])
    df['month_year'] = df['date'].dt.strftime('%Y-%m')
    df['month_name'] = df['date'].dt.strftime('%B %Y')
    
    monthly_data = df.groupby(['month_year', 'month_name']).agg({
        'revenue': 'sum',
        'expenses': 'sum', 
        'profit': 'sum',
        'employees': 'sum',
        'performance_score': 'mean',
        'customer_satisfaction': 'mean',
        'roi': 'mean'
    }).reset_index()
    
    # Calculate month-over-month growth
    monthly_data = monthly_data.sort_values('month_year')
    monthly_data['revenue_growth'] = monthly_data['revenue'].pct_change() * 100
    monthly_data['profit_growth'] = monthly_data['profit'].pct_change() * 100
    
    return jsonify(monthly_data.to_dict(orient='records'))

@app.route('/api/reports/quarterly-analysis')
def get_quarterly_analysis():
    """Get comprehensive quarterly analysis"""
    df = load_data()
    
    if df.empty:
        return jsonify([])
    
    quarterly_analysis = df.groupby(['quarter', 'year', 'quarter_num']).agg({
        'revenue': ['sum', 'mean', 'std'],
        'expenses': ['sum', 'mean'],
        'profit': ['sum', 'mean'],
        'employees': ['sum', 'mean'],
        'performance_score': ['mean', 'std'],
        'customer_satisfaction': 'mean',
        'roi': 'mean',
        'market_share': 'mean',
        'growth_rate': 'mean'
    }).reset_index()
    
    # Flatten column names
    quarterly_analysis.columns = ['_'.join(col).strip() if col[1] else col[0] for col in quarterly_analysis.columns.values]
    
    # Calculate quarter-over-quarter growth
    quarterly_analysis = quarterly_analysis.sort_values(['year_', 'quarter_num_'])
    quarterly_analysis['revenue_qoq_growth'] = quarterly_analysis['revenue_sum'].pct_change() * 100
    quarterly_analysis['profit_qoq_growth'] = quarterly_analysis['profit_sum'].pct_change() * 100
    
    return jsonify(quarterly_analysis.to_dict(orient='records'))

@app.route('/api/reports/annual-summary')
def get_annual_summary():
    """Get annual summary for report generation"""
    df = load_data()
    
    if df.empty:
        return jsonify({})
    
    annual_data = df.groupby('year').agg({
        'revenue': ['sum', 'mean'],
        'expenses': ['sum', 'mean'],
        'profit': ['sum', 'mean'],
        'employees': ['sum', 'mean'],
        'performance_score': 'mean',
        'customer_satisfaction': 'mean',
        'roi': 'mean',
        'market_share': 'mean',
        'growth_rate': 'mean',
        'nps': 'mean',
        'esg_score': 'mean'
    }).reset_index()
    
    # Flatten column names
    annual_data.columns = ['_'.join(col).strip() if col[1] else col[0] for col in annual_data.columns.values]
    
    # Calculate year-over-year growth
    annual_data = annual_data.sort_values('year_')
    annual_data['revenue_yoy_growth'] = annual_data['revenue_sum'].pct_change() * 100
    annual_data['profit_yoy_growth'] = annual_data['profit_sum'].pct_change() * 100
    
    # Get department and region breakdowns
    dept_breakdown = df.groupby(['year', 'department'])['revenue'].sum().reset_index()
    region_breakdown = df.groupby(['year', 'region'])['revenue'].sum().reset_index()
    
    return jsonify({
        'annual_summary': annual_data.to_dict(orient='records'),
        'department_breakdown': dept_breakdown.to_dict(orient='records'),
        'region_breakdown': region_breakdown.to_dict(orient='records'),
        'total_years': len(annual_data),
        'latest_year': annual_data['year_'].max(),
        'total_revenue_all_years': annual_data['revenue_sum'].sum()
    })

@app.route('/api/charts/region-performance')
def get_region_performance():
    """Get region performance data"""
    df = load_data()
    
    if df.empty or 'region' not in df.columns:
        return jsonify([])
    
    # Use available columns from enhanced data
    agg_dict = {}
    if 'revenue' in df.columns:
        agg_dict['revenue'] = 'sum'
    if 'expenses' in df.columns:
        agg_dict['expenses'] = 'sum'
    if 'employees' in df.columns:
        agg_dict['employees'] = 'sum'
    
    if not agg_dict:
        return jsonify([])
    
    region_data = df.groupby('region').agg(agg_dict).reset_index()
    
    return jsonify(region_data.to_dict(orient='records'))

@app.route('/api/charts/product-mix')
def get_product_mix():
    """Get department mix data for pie chart (using department instead of product)"""
    df = load_data()
    
    if df.empty or 'department' not in df.columns or 'revenue' not in df.columns:
        return jsonify([])
    
    department_data = df.groupby('department')['revenue'].sum().reset_index()
    
    return jsonify(department_data.to_dict(orient='records'))

# SAP Business Data Endpoints (Enhanced Google Data)
@app.route('/api/sap/data')
def get_sap_data():
    """Get SAP business data with filters"""
    return get_google_data()

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

@app.route('/api/sap/kpis')
def get_sap_kpis():
    """Get SAP business KPIs with enhanced metrics"""
    return get_google_kpis()

@app.route('/api/google/kpis')
def get_google_kpis():
    """Get Google business KPIs with enhanced metrics"""
    df = load_google_data()
    
    if df.empty:
        return jsonify({})
    
    # Calculate enhanced KPIs with error handling
    base_revenue = df['revenue'].sum() if 'revenue' in df.columns else 0
    base_expenses = df['expenses'].sum() if 'expenses' in df.columns else 0
    base_profit = df['profit'].sum() if 'profit' in df.columns else (base_revenue - base_expenses)
    
    # Add some real-time variation
    variation = random.uniform(0.98, 1.02)
    
    # Basic KPIs
    kpis = {
        'total_revenue': round(base_revenue * variation, 2),
        'total_expenses': round(base_expenses * variation, 2),
        'total_profit': round(base_profit * variation, 2),
        'total_employees': round(df['employees'].sum() * variation) if 'employees' in df.columns else 300000,
        'avg_performance': round(df['performance_score'].mean() * variation, 1) if 'performance_score' in df.columns else 85.0,
        'profit_margin': round(df['profit_margin'].mean(), 1) if 'profit_margin' in df.columns else round((base_profit / base_revenue) * 100, 1),
        'last_updated': datetime.now().isoformat()
    }
    
    # Enhanced KPIs (if available in enhanced dataset)
    if 'roi' in df.columns:
        kpis.update({
            'avg_roi': round(df['roi'].mean(), 1),
            'expense_efficiency': round(df['expense_efficiency'].mean(), 2),
            'revenue_per_customer': round(df['revenue_per_customer'].mean(), 2),
            'avg_customer_satisfaction': round(df['customer_satisfaction'].mean(), 1),
            'avg_nps': round(df['nps'].mean(), 1),
            'avg_esg_score': round(df['esg_score'].mean(), 1),
            'market_share_avg': round(df['market_share'].mean(), 1)
        })
    
    # Growth rates (calculate from data if available)
    if 'growth_rate' in df.columns:
        kpis['revenue_growth'] = round(df['growth_rate'].mean(), 1)
    else:
        kpis['revenue_growth'] = round(random.uniform(5, 25), 1)
    
    if 'customer_growth_rate' in df.columns:
        kpis['customer_growth'] = round(df['customer_growth_rate'].mean(), 1)
    else:
        kpis['customer_growth'] = round(random.uniform(2, 15), 1)
    
    return jsonify(kpis)

@app.route('/api/google/charts/revenue-trend')
def get_google_revenue_trend():
    """Get Google revenue trend data"""
    df = load_google_data()
    
    if df.empty or 'revenue' not in df.columns or 'date' not in df.columns:
        return jsonify([])
    
    try:
        df['date'] = pd.to_datetime(df['date'])
        
        # Group by date and sum revenue
        trend_data = df.groupby('date')['revenue'].sum().reset_index()
        trend_data['date'] = trend_data['date'].dt.strftime('%Y-%m-%d')
        
        return jsonify(trend_data.to_dict(orient='records'))
    except Exception as e:
        print(f"Error in revenue trend: {e}")
        return jsonify([])

@app.route('/api/google/charts/department-performance')
def get_google_department_performance():
    """Get Google department performance data"""
    df = load_google_data()
    
    if df.empty or 'department' not in df.columns:
        return jsonify([])
    
    try:
        # Build aggregation dict based on available columns
        agg_dict = {}
        if 'revenue' in df.columns:
            agg_dict['revenue'] = 'sum'
        if 'expenses' in df.columns:
            agg_dict['expenses'] = 'sum'
        if 'employees' in df.columns:
            agg_dict['employees'] = 'sum'
        if 'performance_score' in df.columns:
            agg_dict['performance_score'] = 'mean'
        
        if not agg_dict:
            return jsonify([])
        
        dept_data = df.groupby('department').agg(agg_dict).reset_index()
        
        return jsonify(dept_data.to_dict(orient='records'))
    except Exception as e:
        print(f"Error in department performance: {e}")
        return jsonify([])

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

@app.route('/api/google/charts/advanced-kpis')
def get_google_advanced_kpis():
    """Get advanced KPI trends over time"""
    df = load_google_data()
    
    if 'quarter' not in df.columns:
        return jsonify([])
    
    # Group by quarter and calculate average KPIs
    quarterly_kpis = df.groupby('quarter').agg({
        'roi': 'mean',
        'expense_efficiency': 'mean',
        'customer_satisfaction': 'mean',
        'nps': 'mean',
        'esg_score': 'mean',
        'profit_margin': 'mean'
    }).reset_index()
    
    return jsonify(quarterly_kpis.to_dict(orient='records'))

@app.route('/api/google/charts/rolling-metrics')
def get_google_rolling_metrics():
    """Get rolling metrics data"""
    df = load_google_data()
    
    if 'rolling_revenue_avg' not in df.columns:
        return jsonify([])
    
    # Get latest rolling metrics by department
    latest_data = df.groupby('department').tail(1)
    
    rolling_data = latest_data[['department', 'rolling_revenue_avg', 'rolling_profit_avg', 'profit_volatility']].to_dict(orient='records')
    
    return jsonify(rolling_data)

@app.route('/api/google/charts/competitive-analysis')
def get_google_competitive_analysis():
    """Get competitive analysis data"""
    df = load_google_data()
    
    if 'region_competitiveness_index' not in df.columns:
        return jsonify([])
    
    # Get latest competitive data
    latest_quarter = df['quarter'].max()
    competitive_data = df[df['quarter'] == latest_quarter]
    
    result = competitive_data[['department', 'region', 'region_competitiveness_index', 'profit_rank', 'market_share']].to_dict(orient='records')
    
    return jsonify(result)

@app.route('/api/google/charts/ytd-performance')
def get_google_ytd_performance():
    """Get year-to-date performance data"""
    df = load_google_data()
    
    if 'ytd_revenue' not in df.columns:
        return jsonify([])
    
    # Get current year YTD data
    current_year = datetime.now().year
    ytd_data = df[df['year'] == current_year]
    
    if ytd_data.empty:
        # Fallback to latest year in data
        latest_year = df['year'].max()
        ytd_data = df[df['year'] == latest_year]
    
    # Group by department and get latest YTD values
    ytd_summary = ytd_data.groupby('department').agg({
        'ytd_revenue': 'max',
        'ytd_profit': 'max',
        'quarter_num': 'max'
    }).reset_index()
    
    return jsonify(ytd_summary.to_dict(orient='records'))

@app.route('/api/google/charts/monthly-summary')
def get_google_monthly_summary():
    """Get monthly summary data for month-over-month analysis"""
    df = load_google_data()
    
    if df.empty or 'date' not in df.columns:
        return jsonify([])
    
    try:
        # Convert date column to datetime
        df['date'] = pd.to_datetime(df['date'])
        df['month'] = df['date'].dt.to_period('M')
        df['month_name'] = df['date'].dt.strftime('%b %Y')
        
        # Group by month and calculate metrics
        monthly_data = df.groupby(['month', 'month_name']).agg({
            'revenue': 'sum',
            'expenses': 'sum',
            'profit': 'sum',
            'employees': 'sum'
        }).reset_index()
        
        # Sort by month
        monthly_data = monthly_data.sort_values('month')
        
        # Calculate month-over-month growth
        monthly_data['revenue_growth'] = monthly_data['revenue'].pct_change() * 100
        monthly_data['profit_growth'] = monthly_data['profit'].pct_change() * 100
        
        # Fill NaN values for first month
        monthly_data = monthly_data.fillna(0)
        
        return jsonify(monthly_data.to_dict(orient='records'))
        
    except Exception as e:
        print(f"Error in monthly summary: {e}")
        return jsonify([])

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
    temp_csv = 'temp_enhanced_google_data.csv'
    df.to_csv(temp_csv, index=False)
    
    return send_file(
        temp_csv,
        mimetype='text/csv',
        as_attachment=True,
        download_name='enhanced_google_business_data.csv'
    )

@app.route('/api/sales/csv')
def get_sales_csv():
    df = load_data()
    
    if df.empty:
        return jsonify({"error": "No data available"})
    
    # Apply same filters as /api/sales
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
    temp_csv = 'temp_enhanced_data.csv'
    df.to_csv(temp_csv, index=False)
    
    return send_file(
        temp_csv,
        mimetype='text/csv',
        as_attachment=True,
        download_name='enhanced_business_data.csv'
    )

if __name__ == '__main__':
    print("Starting SAP Dashboard API Server...")
    print("Loading business data...")
    
    # Test data loading
    df = load_data()
    if df.empty:
        print("No data loaded!")
    else:
        print(f"Loaded {len(df)} records")
        print(f"Total Revenue: ${df['revenue'].sum():,.0f}")
    
    print("Server starting on http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=False)