from flask import Flask, jsonify, request, send_file
import pandas as pd
from datetime import datetime
import os

app = Flask(__name__)

# Load data function
def load_data():
    csv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'sales.csv')
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