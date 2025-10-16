# Google Analytics Dashboard

A modern, responsive dashboard for Google business analytics and data visualization with SAP Fiori-inspired design.

## 🚀 Features

### 🎨 Modern Design
- **SAP Fiori-inspired** clean, professional interface
- **Fully responsive** layout that works on all devices
- **Modern typography** using Inter font family
- **Smooth animations** and hover effects

### 📊 Interactive Analytics
- **Real-time KPI monitoring** with Google business data
- **Interactive charts** with Chart.js visualizations
- **Multiple chart types** (line, bar, doughnut)
- **Department performance** tracking
- **Regional analysis** and trends

### 🔄 Real-time Capabilities
- **Live data fetching** from Flask REST API
- **Real-time KPI updates** with trend indicators
- **Auto-refresh functionality**
- **Error handling** and status notifications

### 📱 Mobile-Friendly Design
- **Responsive grid layouts**
- **Touch-friendly** interface elements
- **Collapsible sidebar** navigation
- **Optimized for all screen sizes**

### 🛠 Key Features
- **Multi-section navigation**: Dashboard, Graphs, Reports, Settings
- **Google business data**: 5 departments, 3 regions
- **Data export functionality** (CSV download)
- **Interactive charts** with hover effects
- **Clean, modern interface**

## 🚀 Quick Start

### Prerequisites
- **Python 3.8+** with pip package manager
- **Modern web browser** (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)

### ⚡ Quick Setup

1. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Start the backend API**
   ```bash
   cd mock_api
   python app.py
   ```

3. **Start the web server**
   ```bash
   # In a new terminal
   python -m http.server 8080
   ```

4. **Open the dashboard**
   Visit: `http://localhost:8080`

### 🎯 Access URLs
- **Dashboard**: `http://localhost:8080`
- **API Server**: `http://localhost:5000`
- **API Health**: `http://localhost:5000/api/health`

## 📡 API Endpoints

### Core Endpoints
- `GET /api/health` - Health check
- `GET /api/google/data` - Google business data with filtering
- `GET /api/google/kpis` - Real-time KPI metrics
- `GET /api/google/export` - Export filtered data

### Chart Data Endpoints
- `GET /api/google/charts/revenue-trend` - Revenue trend over time
- `GET /api/google/charts/department-performance` - Department performance comparison
- `GET /api/google/charts/region-distribution` - Regional revenue distribution
- `GET /api/google/charts/revenue-expense` - Revenue vs expenses analysis
- `GET /api/google/charts/employee-performance` - Employee performance correlation
- `GET /api/google/charts/quarterly-trends` - Quarterly business trends
- `GET /api/google/charts/department-comparison` - Multi-metric department comparison
- `GET /api/google/charts/regional-heatmap` - Regional performance heatmap
- `GET /api/google/charts/profitability` - Profitability bubble analysis

### Legacy Endpoints (for backward compatibility)
- `GET /api/sales` - Legacy sales data
- `GET /api/sales/csv` - Legacy CSV export

## 📊 Dashboard Sections

### 🏠 Dashboard (Main Overview)
**KPI Cards:**
- **Total Revenue** - Google's total revenue across all business units
- **Total Expenses** - Operational expenses with growth trends
- **Total Employees** - Workforce size with growth indicators
- **Average Performance** - Performance score across departments

**Charts:**
- **Revenue Trend** - Time-series revenue analysis
- **Department Performance** - Business unit comparison

### 📈 Graphs (Advanced Analytics)
**Interactive Charts:**
- **Revenue vs Expenses** - Dual-line profitability analysis
- **Regional Distribution** - Geographic revenue breakdown

### 📋 Reports & Settings
- **Reports Section** - Business intelligence reports (coming soon)
- **Settings Section** - Dashboard configuration (coming soon)

### 🔍 Data & Controls
- **Google Business Data** - 5 departments (Search, Cloud, YouTube, Hardware, AI)
- **Regional Coverage** - North America, Europe, Asia Pacific
- **Export Functionality** - CSV data download
- **Refresh Controls** - Manual data refresh

## Technology Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **JavaScript (ES6+)** - Interactive functionality
- **Chart.js** - Data visualization
- **Font Awesome** - Icons
- **SAP 72 Font** - Typography

### Backend
- **Python Flask** - REST API server
- **Pandas** - Data processing
- **Flask-CORS** - Cross-origin resource sharing

## 📁 File Structure

```
sap-data-dashboard/
├── index.html                    # Main dashboard (single file)
├── requirements.txt              # Python dependencies
├── start_dashboard.py           # Python launcher
├── start_dashboard.bat          # Windows launcher
├── README.md                    # Documentation
├── data/
│   ├── sales.csv               # Legacy sales data
│   └── google_business_data.csv # Google business data
└── mock_api/
    └── app.py                  # Flask API server
```

## Customization

### Colors
The dashboard uses SAP's official color palette defined in CSS variables:
- `--sap-blue: #0070f2`
- `--sap-green: #30914c`
- `--sap-orange: #e76500`
- `--sap-red: #bb0000`

### Data Source
To connect to your own data source:
1. Update the API endpoints in `mock_api/app.py`
2. Modify the data loading functions in `dashboard.js`
3. Update the CSV file in `data/sales.csv` with your data

### Styling
The dashboard uses a comprehensive CSS design system with:
- Consistent spacing using CSS custom properties
- Responsive breakpoints for mobile/tablet/desktop
- Smooth animations and transitions
- SAP Fiori design principles

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Performance Features

- Efficient data loading with loading states
- Chart.js for optimized rendering
- CSS animations using GPU acceleration
- Responsive images and optimized assets
- Auto-refresh with visibility API integration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or issues, please open an issue on GitHub or contact the development team.