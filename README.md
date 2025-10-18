# SAP Business Intelligence Dashboard

A modern, interactive business intelligence dashboard built with Flask, Plotly, and advanced glassmorphism design. Features Power BI-style interactivity with real-time data visualization, comprehensive analytics, and professional report generation.

## 🚀 Features

### Core Functionality
- **Real-time KPI Monitoring** - Live business metrics with trend indicators
- **Interactive Charts** - Revenue trends, department performance, regional analysis
- **Month-over-Month Analysis** - Detailed performance tracking with growth metrics
- **Advanced Analytics** - Quarterly trends, profit margins, market share analysis
- **Professional Reports** - PDF/CSV export with comprehensive business insights
- **Fullscreen Chart View** - Trading app-style detailed chart analysis

### User Experience
- **Glassmorphism Design** - Modern, professional UI with backdrop blur effects
- **Dark/Light Theme** - Seamless theme switching with smooth transitions
- **Responsive Layout** - Optimized for desktop, tablet, and mobile devices
- **Interactive Filters** - Dynamic data filtering by year, region, and department
- **Toast Notifications** - Real-time feedback for user actions

### Technical Features
- **Flask REST API** - Robust backend with comprehensive endpoints
- **Plotly.js Integration** - Professional, interactive data visualizations
- **Enhanced Data Processing** - Advanced business metrics and calculations
- **Error Handling** - Graceful error management with user-friendly messages

## 📊 Dashboard Sections

1. **Overview** - KPI cards, revenue trends, department performance, monthly analysis
2. **Analytics** - Regional performance, quarterly trends, profit analysis, market share
3. **Reports** - Configurable report generation with preview functionality
4. **Insights** - AI-powered business recommendations and alerts

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.7+
- pip (Python package manager)

### Quick Start
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sap-data-dashboard
   ```

2. **Run the dashboard**
   ```bash
   python start_sap_dashboard.py
   ```

The launcher will automatically:
- Check and install required dependencies
- Start the Flask API server
- Open the dashboard in your default browser
- Provide health checks and status updates

### Manual Installation
If you prefer manual setup:
```bash
pip install flask flask-cors pandas numpy
python mock_api/app.py
```
Then open `sap-dashboard.html` in your browser.

## 📁 Project Structure

```
sap-data-dashboard/
├── data/
│   └── enhanced_business_data.csv    # Business data with 700+ records
├── mock_api/
│   └── app.py                        # Flask API server with 20+ endpoints
├── sap-dashboard.html                # Main dashboard interface
├── sap-dashboard.js                  # Interactive functionality & charts
├── sap-styles.css                    # Modern glassmorphism styling
├── start_sap_dashboard.py            # Professional launcher script
└── README.md                         # This file
```

## 🔧 API Endpoints

### Core Data
- `GET /api/health` - Server health check
- `GET /api/google/kpis` - Key performance indicators
- `GET /api/google/data` - Filtered business data

### Charts & Analytics
- `GET /api/google/charts/revenue-trend` - Revenue over time
- `GET /api/google/charts/department-performance` - Department metrics
- `GET /api/google/charts/monthly-summary` - Month-over-month analysis
- `GET /api/google/charts/quarterly-trends` - Quarterly performance
- `GET /api/google/charts/region-distribution` - Regional breakdown

### Reports & Export
- `GET /api/google/export` - CSV data export
- Report generation with PDF/HTML output

## 💡 Key Features Explained

### Fullscreen Chart View
Click the expand button on any chart to view it in a professional fullscreen modal with:
- Enhanced chart details and tooltips
- Trading app-style presentation
- Interactive zoom and pan capabilities
- Professional styling with glassmorphism effects

### Month-over-Month Analysis
Comprehensive monthly performance tracking including:
- Revenue growth calculations
- Month-over-month comparisons
- Trend analysis and insights
- Visual growth indicators

### Report Generation
Professional business reports with:
- Executive summary with key metrics
- Monthly and departmental analysis
- Business insights and recommendations
- Multiple export formats (PDF, HTML, CSV)

### Advanced Analytics
Deep business intelligence including:
- Profit margin analysis by department
- Regional performance heatmaps
- Year-to-date comparisons
- Market share distribution

## 🎨 Design Philosophy

The dashboard follows modern design principles:
- **Glassmorphism** - Translucent elements with backdrop blur
- **Responsive Design** - Seamless experience across all devices
- **Professional Color Scheme** - Business-appropriate gradients and colors
- **Smooth Animations** - Polished transitions and interactions
- **Accessibility** - High contrast and readable typography

## 🚀 Performance

- **Fast Loading** - Optimized data fetching and caching
- **Responsive Charts** - Smooth interactions even with large datasets
- **Efficient API** - RESTful endpoints with proper error handling
- **Memory Management** - Optimized JavaScript for smooth performance

## 🔒 Data Security

- **No External Dependencies** - All data processed locally
- **Secure API** - CORS-enabled with proper headers
- **Data Validation** - Input sanitization and error handling

## 📱 Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:
1. Check the console for error messages
2. Ensure Python dependencies are installed
3. Verify port 5000 is available
4. Check that all required files are present

For additional support, please open an issue in the repository.

---

**Built with ❤️ for modern business intelligence**