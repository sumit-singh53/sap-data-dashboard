// SAP Dashboard - Advanced Business Intelligence
console.log('🚀 SAP Dashboard Loading...');

// Configuration
const API_BASE = 'http://localhost:5000/api';

// Global error handler for fetch requests
async function safeFetch(url, options = {}) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response;
    } catch (error) {
        console.error(`Fetch error for ${url}:`, error);
        showNotification(`Failed to load data from ${url}`, 'error');
        throw error;
    }
}
let charts = {};
let currentFilters = {
    year: '',
    region: '',
    department: ''
};

// Theme Management
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('sap-theme') || 'light';
        this.applyTheme();
    }

    toggle() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('sap-theme', this.currentTheme);
        this.applyTheme();
    }

    applyTheme() {
        document.body.className = `${this.currentTheme}-theme`;
        const icon = document.querySelector('#themeToggle i');
        if (icon) {
            icon.className = this.currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }
}

// Navigation Manager
class NavigationManager {
    constructor() {
        this.initializeNavigation();
    }

    initializeNavigation() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.showSection(section);
                this.updateActiveNav(link);
            });
        });
    }

    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            
            // Load section-specific data
            this.loadSectionData(sectionId);
        }
    }

    updateActiveNav(activeLink) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        activeLink.parentElement.classList.add('active');
    }

    async loadSectionData(sectionId) {
        switch (sectionId) {
            case 'overview':
                await Promise.all([
                    loadKPIs(),
                    loadMainCharts()
                ]);
                break;
            case 'analytics':
                await loadAnalyticsCharts();
                break;
            case 'reports':
                initializeReports();
                break;
            case 'insights':
                loadInsights();
                break;
        }
    }
}

// Filter Manager
class FilterManager {
    constructor() {
        this.initializeFilters();
    }

    async initializeFilters() {
        try {
            const data = await this.fetchFilterData();
            this.populateFilters(data);
            this.attachFilterListeners();
        } catch (error) {
            console.error('Error initializing filters:', error);
        }
    }

    async fetchFilterData() {
        const response = await safeFetch(`${API_BASE}/google/data`);
        return await response.json();
    }

    populateFilters(data) {
        // Populate year filter
        const years = [...new Set(data.map(item => item.year))].sort();
        const yearFilter = document.getElementById('yearFilter');
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        });

        // Populate region filter
        const regions = [...new Set(data.map(item => item.region))].sort();
        const regionFilter = document.getElementById('regionFilter');
        regions.forEach(region => {
            const option = document.createElement('option');
            option.value = region;
            option.textContent = region;
            regionFilter.appendChild(option);
        });

        // Populate department filter
        const departments = [...new Set(data.map(item => item.department))].sort();
        const departmentFilter = document.getElementById('departmentFilter');
        departments.forEach(department => {
            const option = document.createElement('option');
            option.value = department;
            option.textContent = department;
            departmentFilter.appendChild(option);
        });
    }

    attachFilterListeners() {
        ['yearFilter', 'regionFilter', 'departmentFilter'].forEach(filterId => {
            const filter = document.getElementById(filterId);
            if (filter) {
                filter.addEventListener('change', () => {
                    this.updateFilters();
                    this.applyFilters();
                });
            }
        });
    }

    updateFilters() {
        currentFilters.year = document.getElementById('yearFilter').value;
        currentFilters.region = document.getElementById('regionFilter').value;
        currentFilters.department = document.getElementById('departmentFilter').value;
    }

    async applyFilters() {
        showLoading();
        try {
            await Promise.all([
                loadKPIs(),
                loadMainCharts(),
                loadAnalyticsCharts()
            ]);
        } catch (error) {
            console.error('Error applying filters:', error);
        } finally {
            hideLoading();
        }
    }

    getFilterParams() {
        const params = new URLSearchParams();
        if (currentFilters.year) params.append('year', currentFilters.year);
        if (currentFilters.region) params.append('region', currentFilters.region);
        if (currentFilters.department) params.append('department', currentFilters.department);
        return params.toString();
    }
}

// Utility Functions
function formatCurrency(value) {
    if (value >= 1e9) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        }).format(value / 1e9) + 'B';
    } else if (value >= 1e6) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        }).format(value / 1e6) + 'M';
    } else if (value >= 1e3) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value / 1e3) + 'K';
    } else {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }
}

function formatNumber(value) {
    if (value >= 1e6) {
        return (value / 1e6).toFixed(1) + 'M';
    } else if (value >= 1e3) {
        return (value / 1e3).toFixed(0) + 'K';
    } else {
        return new Intl.NumberFormat('en-US').format(value);
    }
}

function formatPercentage(value) {
    return `${value.toFixed(1)}%`;
}

function showLoading() {
    document.getElementById('loadingOverlay').classList.add('show');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('show');
}

function showNotification(message, type = 'info') {
    console.log(`${type.toUpperCase()}: ${message}`);
    
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remove toast after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 4000);
}

// KPI Management
async function loadKPIs() {
    try {
        const filterParams = filterManager.getFilterParams();
        const response = await safeFetch(`${API_BASE}/google/kpis?${filterParams}`);
        const kpis = await response.json();

        // Update KPI values with logging
        console.log('📊 Updating KPI cards with data:', kpis);
        
        updateKPICard('totalRevenue', formatCurrency(kpis.total_revenue || 0), kpis.revenue_growth || 0);
        updateKPICard('totalProfit', formatCurrency(kpis.total_profit || 0), kpis.profit_growth || 0);
        updateKPICard('totalExpenses', formatCurrency(kpis.total_expenses || 0), kpis.expenses_growth || 0);
        updateKPICard('avgROI', formatPercentage(kpis.avg_roi || 0), kpis.roi_growth || 0);
        updateKPICard('totalEmployees', formatNumber(kpis.total_employees || 0), kpis.employee_growth || 0);
        updateKPICard('expenseEfficiency', `${(kpis.expense_efficiency || 0).toFixed(2)}x`, kpis.efficiency_growth || 0);

        // Load sparklines
        await loadSparklines();

        console.log('✅ KPIs loaded successfully');
    } catch (error) {
        console.error('❌ Error loading KPIs:', error);
        showNotification('Failed to load KPIs', 'error');
    }
}

function updateKPICard(elementId, value, trend) {
    console.log(`🔄 Updating KPI card: ${elementId} = ${value}, trend = ${trend}`);
    
    const valueElement = document.getElementById(elementId);
    if (valueElement) {
        valueElement.textContent = value;
        console.log(`✅ Updated ${elementId} value`);
    } else {
        console.error(`❌ Element not found: ${elementId}`);
    }
    
    // Map element IDs to their corresponding trend IDs
    const trendIdMap = {
        'totalRevenue': 'revenueTrend',
        'totalProfit': 'profitTrend', 
        'totalExpenses': 'expensesTrend',
        'avgROI': 'roiTrend',
        'totalEmployees': 'employeesTrend',
        'expenseEfficiency': 'efficiencyTrend'
    };
    
    const trendId = trendIdMap[elementId];
    const trendElement = document.getElementById(trendId);
    
    if (trendElement) {
        const isPositive = trend >= 0;
        trendElement.textContent = `${isPositive ? '+' : ''}${trend.toFixed(1)}%`;
        
        // Update the parent div's class
        const trendContainer = trendElement.parentElement;
        if (trendContainer) {
            trendContainer.className = `kpi-trend ${isPositive ? 'positive' : 'negative'}`;
        }
        
        const icon = trendElement.parentElement.querySelector('i');
        if (icon) {
            icon.className = `fas fa-arrow-${isPositive ? 'up' : 'down'}`;
        }
        console.log(`✅ Updated ${trendId} trend`);
    } else {
        console.error(`❌ Trend element not found: ${trendId}`);
    }
}

async function loadSparklines() {
    try {
        const filterParams = filterManager.getFilterParams();
        const response = await fetch(`${API_BASE}/google/charts/revenue-trend?${filterParams}`);
        const data = await response.json();

        // Create sparklines for each KPI
        const sparklineData = data.slice(-12); // Last 12 data points
        
        createSparkline('revenueSparkline', sparklineData.map(d => d.revenue));
        createSparkline('profitSparkline', sparklineData.map(d => d.revenue - (d.expenses || 0)));
        createSparkline('expensesSparkline', sparklineData.map(d => d.expenses || 0));
        
    } catch (error) {
        console.error('Error loading sparklines:', error);
    }
}

function createSparkline(elementId, data) {
    const element = document.getElementById(elementId);
    if (!element || !data.length) return;

    const trace = {
        x: data.map((_, i) => i),
        y: data,
        type: 'scatter',
        mode: 'lines',
        line: {
            color: '#667eea',
            width: 2
        },
        showlegend: false
    };

    const layout = {
        margin: { t: 0, r: 0, b: 0, l: 0 },
        xaxis: { visible: false },
        yaxis: { visible: false },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent'
    };

    Plotly.newPlot(elementId, [trace], layout, { displayModeBar: false, responsive: true });
}

// Main Charts
async function loadMainCharts() {
    try {
        await Promise.all([
            loadRevenueTrendChart(),
            loadDepartmentChart(),
            loadMonthlySummaryChart()
        ]);
    } catch (error) {
        console.error('Error loading main charts:', error);
    }
}

async function loadMonthlySummaryChart() {
    try {
        const filterParams = filterManager.getFilterParams();
        const response = await fetch(`${API_BASE}/google/charts/monthly-summary?${filterParams}`);
        const data = await response.json();

        if (!data.length) return;

        const revenueTrace = {
            x: data.map(item => item.month_name),
            y: data.map(item => item.revenue),
            type: 'bar',
            name: 'Monthly Revenue',
            marker: {
                color: data.map((_, i) => `hsl(${220 + i * 15}, 70%, 60%)`),
                opacity: 0.8,
                line: { color: 'rgba(255,255,255,0.8)', width: 1 }
            },
            hovertemplate: '<b>%{x}</b><br>' +
                          'Revenue: <b>$%{y:,.0f}</b><br>' +
                          '<extra></extra>'
        };

        const layout = {
            title: {
                text: 'Monthly Revenue Summary',
                font: { size: 16, family: 'Inter, sans-serif', weight: 600 },
                x: 0.05,
                xanchor: 'left'
            },
            xaxis: {
                title: {
                    text: 'Month',
                    font: { size: 14, family: 'Inter, sans-serif', weight: 600 }
                },
                tickfont: { size: 10, family: 'Inter, sans-serif' },
                tickangle: -45,
                showgrid: false
            },
            yaxis: {
                title: {
                    text: 'Revenue (USD)',
                    font: { size: 14, family: 'Inter, sans-serif', weight: 600 }
                },
                tickformat: '$,.2s',
                tickfont: { size: 12, family: 'Inter, sans-serif' },
                showgrid: true,
                gridcolor: 'rgba(128,128,128,0.2)'
            },
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'transparent',
            font: { color: 'inherit', family: 'Inter, sans-serif' },
            margin: { t: 50, r: 30, b: 100, l: 90 },
            showlegend: false
        };

        // Check if monthly chart container exists
        const monthlyChartContainer = document.getElementById('monthlyChart');
        if (monthlyChartContainer) {
            Plotly.newPlot('monthlyChart', [revenueTrace], layout, { 
                displayModeBar: false, 
                responsive: true 
            });
        }

    } catch (error) {
        console.error('Error loading monthly summary chart:', error);
    }
}

async function loadRevenueTrendChart() {
    try {
        const filterParams = filterManager.getFilterParams();
        const response = await fetch(`${API_BASE}/google/charts/revenue-trend?${filterParams}`);
        const data = await response.json();

        const trace = {
            x: data.map(item => {
                const date = new Date(item.date);
                return date.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                });
            }),
            y: data.map(item => item.revenue),
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Revenue Trend',
            line: {
                color: '#667eea',
                width: 3,
                shape: 'spline'
            },
            marker: {
                size: 8,
                color: '#667eea',
                line: { color: 'white', width: 2 }
            },
            hovertemplate: '<b>%{x}</b><br>' +
                          'Revenue: <b>$%{y:,.0f}</b><br>' +
                          '<extra></extra>'
        };

        const layout = {
            title: {
                text: 'Revenue Trend Analysis',
                font: { size: 16, family: 'Inter, sans-serif', weight: 600 },
                x: 0.05,
                xanchor: 'left'
            },
            xaxis: {
                title: {
                    text: 'Time Period',
                    font: { size: 14, family: 'Inter, sans-serif', weight: 600 }
                },
                gridcolor: 'rgba(128,128,128,0.2)',
                tickfont: { size: 11, family: 'Inter, sans-serif' },
                showgrid: true,
                zeroline: false,
                tickangle: -45
            },
            yaxis: {
                title: {
                    text: 'Revenue (USD)',
                    font: { size: 14, family: 'Inter, sans-serif', weight: 600 }
                },
                gridcolor: 'rgba(128,128,128,0.2)',
                tickformat: '$,.2s',
                tickfont: { size: 12, family: 'Inter, sans-serif' },
                showgrid: true,
                zeroline: false
            },
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'transparent',
            font: { 
                color: 'inherit', 
                family: 'Inter, sans-serif',
                size: 12
            },
            margin: { t: 50, r: 30, b: 80, l: 90 },
            showlegend: false,
            hovermode: 'x unified'
        };

        Plotly.newPlot('revenueTrendChart', [trace], layout, { 
            displayModeBar: false, 
            responsive: true 
        });

    } catch (error) {
        console.error('Error loading revenue trend chart:', error);
    }
}

async function loadDepartmentChart() {
    try {
        const filterParams = filterManager.getFilterParams();
        const response = await fetch(`${API_BASE}/google/charts/department-performance?${filterParams}`);
        const data = await response.json();

        // Sort data by revenue for better visualization
        data.sort((a, b) => b.revenue - a.revenue);

        const trace = {
            x: data.map(item => item.department),
            y: data.map(item => item.revenue),
            type: 'bar',
            name: 'Department Revenue',
            marker: {
                color: data.map((_, i) => {
                    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b'];
                    return colors[i % colors.length];
                }),
                opacity: 0.85,
                line: { color: 'rgba(255,255,255,0.8)', width: 1 }
            },
            text: data.map(item => formatCurrency(item.revenue)),
            textposition: 'outside',
            textfont: { size: 10, family: 'Inter, sans-serif', weight: 600 },
            hovertemplate: '<b>%{x} Department</b><br>' +
                          'Revenue: <b>$%{y:,.0f}</b><br>' +
                          'Employees: <b>%{customdata:,.0f}</b><br>' +
                          '<extra></extra>',
            customdata: data.map(item => item.employees || 0)
        };

        const layout = {
            title: {
                text: 'Department Performance Comparison',
                font: { size: 16, family: 'Inter, sans-serif', weight: 600 },
                x: 0.05,
                xanchor: 'left'
            },
            xaxis: {
                title: {
                    text: 'Business Departments',
                    font: { size: 14, family: 'Inter, sans-serif', weight: 600 }
                },
                gridcolor: 'rgba(128,128,128,0.2)',
                tickfont: { size: 11, family: 'Inter, sans-serif' },
                tickangle: -45,
                showgrid: false,
                zeroline: false
            },
            yaxis: {
                title: {
                    text: 'Revenue (USD)',
                    font: { size: 14, family: 'Inter, sans-serif', weight: 600 }
                },
                gridcolor: 'rgba(128,128,128,0.2)',
                tickformat: '$,.2s',
                tickfont: { size: 12, family: 'Inter, sans-serif' },
                showgrid: true,
                zeroline: false
            },
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'transparent',
            font: { 
                color: 'inherit', 
                family: 'Inter, sans-serif',
                size: 12
            },
            margin: { t: 50, r: 30, b: 100, l: 90 },
            showlegend: false,
            hovermode: 'closest'
        };

        Plotly.newPlot('departmentChart', [trace], layout, { 
            displayModeBar: false, 
            responsive: true 
        });

    } catch (error) {
        console.error('Error loading department chart:', error);
    }
}

// Analytics Charts
async function loadAnalyticsCharts() {
    try {
        await Promise.all([
            loadRegionalChart(),
            loadQuarterlyChart(),
            loadProfitMarginChart(),
            loadMarketShareChart(),
            loadYTDChart(),
            loadKPIHeatmap()
        ]);
    } catch (error) {
        console.error('Error loading analytics charts:', error);
    }
}

async function loadRegionalChart() {
    try {
        const filterParams = filterManager.getFilterParams();
        const response = await fetch(`${API_BASE}/google/charts/region-distribution?${filterParams}`);
        const data = await response.json();

        const trace = {
            labels: data.map(item => item.region),
            values: data.map(item => item.revenue),
            type: 'pie',
            hole: 0.4,
            marker: {
                colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'],
                line: { color: 'rgba(255,255,255,0.8)', width: 2 }
            },
            textinfo: 'label+percent',
            textfont: { size: 11, family: 'Inter, sans-serif' },
            hovertemplate: '<b>%{label}</b><br>Revenue: $%{value:,.0f}<br>%{percent}<extra></extra>'
        };

        const layout = {
            title: false,
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'transparent',
            font: { 
                color: 'inherit', 
                family: 'Inter, sans-serif',
                size: 12
            },
            margin: { t: 30, r: 30, b: 30, l: 30 },
            showlegend: false
        };

        Plotly.newPlot('regionalChart', [trace], layout, { 
            displayModeBar: false, 
            responsive: true 
        });

    } catch (error) {
        console.error('Error loading regional chart:', error);
    }
}

async function loadQuarterlyChart() {
    try {
        const filterParams = filterManager.getFilterParams();
        const response = await fetch(`${API_BASE}/google/charts/quarterly-trends?${filterParams}`);
        const data = await response.json();

        const revenueTrace = {
            x: data.map(item => item.quarter),
            y: data.map(item => item.revenue),
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Revenue',
            line: { color: '#667eea', width: 3 },
            marker: { size: 8 }
        };

        const expenseTrace = {
            x: data.map(item => item.quarter),
            y: data.map(item => item.expenses),
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Expenses',
            line: { color: '#f5576c', width: 3 },
            marker: { size: 8 }
        };

        const layout = {
            title: false,
            xaxis: { 
                title: {
                    text: 'Quarter',
                    font: { size: 14, family: 'Inter, sans-serif', weight: 600 }
                },
                tickfont: { size: 12, family: 'Inter, sans-serif' },
                gridcolor: 'rgba(128,128,128,0.2)',
                showgrid: true,
                zeroline: false
            },
            yaxis: { 
                title: {
                    text: 'Amount ($)',
                    font: { size: 14, family: 'Inter, sans-serif', weight: 600 }
                },
                tickformat: '$,.0s',
                tickfont: { size: 12, family: 'Inter, sans-serif' },
                gridcolor: 'rgba(128,128,128,0.2)',
                showgrid: true,
                zeroline: false
            },
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'transparent',
            font: { 
                color: 'inherit', 
                family: 'Inter, sans-serif',
                size: 12
            },
            margin: { t: 30, r: 30, b: 60, l: 80 },
            legend: {
                orientation: 'h',
                x: 0.5,
                xanchor: 'center',
                y: -0.2,
                font: { size: 11, family: 'Inter, sans-serif' }
            }
        };

        Plotly.newPlot('quarterlyChart', [revenueTrace, expenseTrace], layout, { 
            displayModeBar: false, 
            responsive: true 
        });

    } catch (error) {
        console.error('Error loading quarterly chart:', error);
    }
}

async function loadProfitMarginChart() {
    try {
        const filterParams = filterManager.getFilterParams();
        const response = await fetch(`${API_BASE}/google/charts/department-performance?${filterParams}`);
        const data = await response.json();

        // Calculate profit margin for each department
        const profitMarginData = data.map(item => ({
            department: item.department,
            profit_margin: ((item.revenue - item.expenses) / item.revenue) * 100
        }));

        const trace = {
            x: profitMarginData.map(item => item.department),
            y: profitMarginData.map(item => item.profit_margin),
            type: 'bar',
            marker: {
                color: profitMarginData.map(item => item.profit_margin),
                colorscale: 'Viridis',
                showscale: true,
                colorbar: {
                    title: 'Profit Margin (%)'
                }
            },
            hovertemplate: '<b>%{x}</b><br>Profit Margin: %{y:.1f}%<extra></extra>'
        };

        const layout = {
            title: false,
            xaxis: { title: 'Department' },
            yaxis: { title: 'Profit Margin (%)', ticksuffix: '%' },
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'transparent',
            font: { color: 'inherit' },
            margin: { t: 20, r: 60, b: 60, l: 60 }
        };

        Plotly.newPlot('profitMarginChart', [trace], layout, { 
            displayModeBar: false, 
            responsive: true 
        });

    } catch (error) {
        console.error('Error loading profit margin chart:', error);
    }
}

async function loadMarketShareChart() {
    try {
        const filterParams = filterManager.getFilterParams();
        const response = await fetch(`${API_BASE}/google/charts/department-performance?${filterParams}`);
        const data = await response.json();

        const trace = {
            labels: data.map(item => item.department),
            values: data.map(item => item.revenue),
            type: 'pie',
            textinfo: 'label+percent',
            marker: {
                colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe']
            }
        };

        const layout = {
            title: false,
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'transparent',
            font: { color: 'inherit' },
            margin: { t: 20, r: 20, b: 20, l: 20 }
        };

        Plotly.newPlot('marketShareChart', [trace], layout, { 
            displayModeBar: false, 
            responsive: true 
        });

    } catch (error) {
        console.error('Error loading market share chart:', error);
    }
}

async function loadYTDChart() {
    try {
        const filterParams = filterManager.getFilterParams();
        const response = await fetch(`${API_BASE}/google/charts/ytd-performance?${filterParams}`);
        const data = await response.json();

        if (!data.length) return;

        const revenueTrace = {
            x: data.map(item => item.department),
            y: data.map(item => item.ytd_revenue / 1000000), // Convert to millions
            type: 'bar',
            name: 'YTD Revenue',
            marker: { color: '#667eea' }
        };

        const profitTrace = {
            x: data.map(item => item.department),
            y: data.map(item => item.ytd_profit / 1000000), // Convert to millions
            type: 'bar',
            name: 'YTD Profit',
            marker: { color: '#4facfe' }
        };

        const layout = {
            title: false,
            xaxis: { title: 'Department' },
            yaxis: { title: 'Amount (Millions $)', ticksuffix: 'M' },
            barmode: 'group',
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'transparent',
            font: { color: 'inherit' },
            margin: { t: 20, r: 20, b: 60, l: 60 }
        };

        Plotly.newPlot('ytdChart', [revenueTrace, profitTrace], layout, { 
            displayModeBar: false, 
            responsive: true 
        });

    } catch (error) {
        console.error('Error loading YTD chart:', error);
    }
}

async function loadKPIHeatmap() {
    try {
        const filterParams = filterManager.getFilterParams();
        const response = await fetch(`${API_BASE}/google/charts/regional-heatmap?${filterParams}`);
        const data = await response.json();

        if (!data.length) return;

        // Prepare data for heatmap
        const regions = [...new Set(data.map(item => item.region))];
        const departments = [...new Set(data.map(item => item.department))];
        
        const z = regions.map(region => 
            departments.map(dept => {
                const item = data.find(d => d.region === region && d.department === dept);
                return item ? item.performance_score : 0;
            })
        );

        const trace = {
            z: z,
            x: departments,
            y: regions,
            type: 'heatmap',
            colorscale: 'Viridis',
            showscale: true,
            hovertemplate: '<b>%{y} - %{x}</b><br>Performance: %{z:.1f}<extra></extra>'
        };

        const layout = {
            title: false,
            xaxis: { title: 'Department' },
            yaxis: { title: 'Region' },
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'transparent',
            font: { color: 'inherit' },
            margin: { t: 20, r: 60, b: 60, l: 100 }
        };

        Plotly.newPlot('kpiHeatmap', [trace], layout, { 
            displayModeBar: false, 
            responsive: true 
        });

    } catch (error) {
        console.error('Error loading KPI heatmap:', error);
    }
}

// Report Generation
function initializeReports() {
    // Initialize report configuration listeners
    document.getElementById('previewReport')?.addEventListener('click', previewReport);
    document.getElementById('generatePDF')?.addEventListener('click', generatePDF);
    document.getElementById('exportCSV')?.addEventListener('click', exportCSV);
    
    // Quick report listeners
    document.querySelectorAll('.quick-report-card').forEach(card => {
        card.addEventListener('click', () => {
            const reportType = card.dataset.report;
            generateQuickReport(reportType);
        });
    });
}

async function previewReport() {
    const reportType = document.getElementById('reportType').value;
    const reportPeriod = document.getElementById('reportPeriod').value;
    
    const previewContainer = document.getElementById('reportPreview');
    previewContainer.innerHTML = '<div class="loading">Generating preview...</div>';
    
    try {
        const reportContent = await generateReportContent(reportType, reportPeriod);
        previewContainer.innerHTML = reportContent;
    } catch (error) {
        previewContainer.innerHTML = '<div class="error">Error generating preview</div>';
        console.error('Error generating report preview:', error);
    }
}

async function generateReportContent(reportType, reportPeriod) {
    const filterParams = filterManager.getFilterParams();
    
    try {
        // Get KPI data first
        const kpisResponse = await fetch(`${API_BASE}/google/kpis?${filterParams}`);
        const kpis = await kpisResponse.json();
        
        const currentDate = new Date().toLocaleDateString();
        
        // Try to get additional data, but don't fail if it's not available
        let monthlyData = [];
        let departmentData = [];
        
        try {
            const monthlyResponse = await fetch(`${API_BASE}/google/charts/monthly-summary?${filterParams}`);
            monthlyData = await monthlyResponse.json();
        } catch (e) {
            console.warn('Monthly data not available:', e);
        }
        
        try {
            const departmentResponse = await fetch(`${API_BASE}/google/charts/department-performance?${filterParams}`);
            departmentData = await departmentResponse.json();
        } catch (e) {
            console.warn('Department data not available:', e);
        }
        
        // Generate insights based on available data
        const monthlyInsights = monthlyData.length > 1 ? 
            `<li>Monthly data points: ${monthlyData.length} months analyzed</li>
             <li>Average monthly revenue: ${formatCurrency(monthlyData.reduce((sum, m) => sum + (m.revenue || 0), 0) / monthlyData.length)}</li>
             <li>Revenue trend: ${monthlyData.length > 1 && monthlyData[monthlyData.length - 1].revenue > monthlyData[0].revenue ? 'Growing' : 'Stable'}</li>` : 
            '<li>Monthly analysis: Limited data available</li>';
        
        const departmentInsights = departmentData.length > 0 ?
            `<li>Departments analyzed: ${departmentData.length}</li>
             <li>Top performing department: ${departmentData.reduce((best, current) => (current.revenue || 0) > (best.revenue || 0) ? current : best, departmentData[0])?.department || 'N/A'}</li>` :
            '<li>Department analysis: Data not available</li>';
        
        return `
            <div class="report-header" style="border-bottom: 2px solid #667eea; padding-bottom: 20px; margin-bottom: 30px;">
                <h2 style="color: #667eea; margin-bottom: 10px;">SAP Business Intelligence Report</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">
                    <p><strong>Report Type:</strong> ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}</p>
                    <p><strong>Period:</strong> ${reportPeriod.replace('-', ' ').toUpperCase()}</p>
                    <p><strong>Generated:</strong> ${currentDate}</p>
                </div>
            </div>
            
            <div class="report-section" style="margin-bottom: 30px;">
                <h3 style="color: #764ba2; margin-bottom: 20px;">Executive Summary</h3>
                <div class="kpi-summary" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                    <div class="kpi-item" style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea;">
                        <span class="kpi-label" style="display: block; font-weight: 600; color: #666; margin-bottom: 5px;">Total Revenue:</span>
                        <span class="kpi-value" style="font-size: 1.5em; font-weight: bold; color: #667eea;">${formatCurrency(kpis.total_revenue || 0)}</span>
                    </div>
                    <div class="kpi-item" style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #4facfe;">
                        <span class="kpi-label" style="display: block; font-weight: 600; color: #666; margin-bottom: 5px;">Total Profit:</span>
                        <span class="kpi-value" style="font-size: 1.5em; font-weight: bold; color: #4facfe;">${formatCurrency(kpis.total_profit || 0)}</span>
                    </div>
                    <div class="kpi-item" style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #43e97b;">
                        <span class="kpi-label" style="display: block; font-weight: 600; color: #666; margin-bottom: 5px;">ROI:</span>
                        <span class="kpi-value" style="font-size: 1.5em; font-weight: bold; color: #43e97b;">${formatPercentage(kpis.avg_roi || 0)}</span>
                    </div>
                    <div class="kpi-item" style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #f093fb;">
                        <span class="kpi-label" style="display: block; font-weight: 600; color: #666; margin-bottom: 5px;">Total Employees:</span>
                        <span class="kpi-value" style="font-size: 1.5em; font-weight: bold; color: #f093fb;">${formatNumber(kpis.total_employees || 0)}</span>
                    </div>
                </div>
            </div>
            
            <div class="report-section" style="margin-bottom: 30px;">
                <h3 style="color: #764ba2; margin-bottom: 15px;">Key Insights</h3>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                    <h4 style="color: #667eea; margin-bottom: 10px;">Monthly Performance</h4>
                    <ul style="margin-left: 20px; line-height: 1.8;">
                        ${monthlyInsights}
                    </ul>
                    
                    <h4 style="color: #667eea; margin-bottom: 10px; margin-top: 20px;">Department Analysis</h4>
                    <ul style="margin-left: 20px; line-height: 1.8;">
                        ${departmentInsights}
                    </ul>
                    
                    <h4 style="color: #667eea; margin-bottom: 10px; margin-top: 20px;">Business Metrics</h4>
                    <ul style="margin-left: 20px; line-height: 1.8;">
                        <li>Revenue growth trending ${(kpis.revenue_growth || 0) >= 0 ? 'positive' : 'negative'} at ${formatPercentage(Math.abs(kpis.revenue_growth || 0))}</li>
                        <li>Operating efficiency at ${(kpis.expense_efficiency || 0).toFixed(2)}x revenue-to-expense ratio</li>
                        <li>Employee productivity: ${formatCurrency((kpis.total_revenue / kpis.total_employees) || 0)} revenue per employee</li>
                        <li>Customer satisfaction score: ${(kpis.avg_customer_satisfaction || 85).toFixed(1)}/100</li>
                    </ul>
                </div>
            </div>
            
            <div class="report-section">
                <h3 style="color: #764ba2; margin-bottom: 15px;">Recommendations</h3>
                <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
                    <ul style="margin-left: 20px; line-height: 1.8;">
                        <li><strong>Revenue Optimization:</strong> Focus on high-performing departments to maximize growth potential</li>
                        <li><strong>Cost Management:</strong> Review expense efficiency metrics to identify cost reduction opportunities</li>
                        <li><strong>Employee Development:</strong> Invest in training programs to improve productivity per employee</li>
                        <li><strong>Customer Experience:</strong> Implement initiatives to maintain high customer satisfaction levels</li>
                    </ul>
                </div>
            </div>
        `;
        
        return `
            <div class="report-header">
                <h2>SAP Business Intelligence Report</h2>
                <p><strong>Report Type:</strong> ${reportType}</p>
                <p><strong>Period:</strong> ${reportPeriod}</p>
                <p><strong>Generated:</strong> ${currentDate}</p>
            </div>
            
            <div class="report-section">
                <h3>Executive Summary</h3>
                <div class="kpi-summary">
                    <div class="kpi-item">
                        <span class="kpi-label">Total Revenue:</span>
                        <span class="kpi-value">${formatCurrency(kpis.total_revenue)}</span>
                    </div>
                    <div class="kpi-item">
                        <span class="kpi-label">Total Profit:</span>
                        <span class="kpi-value">${formatCurrency(kpis.total_profit)}</span>
                    </div>
                    <div class="kpi-item">
                        <span class="kpi-label">Profit Margin:</span>
                        <span class="kpi-value">${formatPercentage(kpis.profit_margin || 0)}</span>
                    </div>
                    <div class="kpi-item">
                        <span class="kpi-label">ROI:</span>
                        <span class="kpi-value">${formatPercentage(kpis.avg_roi || 0)}</span>
                    </div>
                    <div class="kpi-item">
                        <span class="kpi-label">Total Employees:</span>
                        <span class="kpi-value">${formatNumber(kpis.total_employees)}</span>
                    </div>
                    <div class="kpi-item">
                        <span class="kpi-label">Customer Satisfaction:</span>
                        <span class="kpi-value">${(kpis.avg_customer_satisfaction || 0).toFixed(1)}/100</span>
                    </div>
                </div>
            </div>
            
            <div class="report-section">
                <h3>Monthly Analysis</h3>
                <p>Analysis based on ${monthlyData.length} months of data:</p>
                <ul>
                    ${monthlyInsights}
                    <li>Total months analyzed: ${monthlyData.length}</li>
                    <li>Average monthly revenue: ${formatCurrency(monthlyData.reduce((sum, m) => sum + m.revenue, 0) / monthlyData.length)}</li>
                </ul>
            </div>
            
            <div class="report-section">
                <h3>Quarterly Performance</h3>
                <p>Quarterly trends and performance metrics:</p>
                <ul>
                    ${quarterlyInsights}
                    <li>Total quarters analyzed: ${quarterlyData.length}</li>
                    <li>Average quarterly ROI: ${(quarterlyData.reduce((sum, q) => sum + (q.roi_mean || 0), 0) / quarterlyData.length).toFixed(1)}%</li>
                </ul>
            </div>
            
            <div class="report-section">
                <h3>Annual Overview</h3>
                <p>Year-over-year performance summary:</p>
                <ul>
                    <li>Total years in analysis: ${annualData.total_years || 0}</li>
                    <li>Latest year: ${annualData.latest_year || 'N/A'}</li>
                    <li>Total revenue across all years: ${formatCurrency(annualData.total_revenue_all_years || 0)}</li>
                    <li>Average annual growth: ${annualData.annual_summary?.length > 1 ? 
                        (annualData.annual_summary[annualData.annual_summary.length - 1]?.revenue_yoy_growth?.toFixed(1) || 0) + '%' : 'N/A'}</li>
                </ul>
            </div>
            
            <div class="report-section">
                <h3>Key Insights & Recommendations</h3>
                <ul>
                    <li>Revenue growth trending ${(kpis.revenue_growth || 0) >= 0 ? 'positive' : 'negative'} at ${formatPercentage(Math.abs(kpis.revenue_growth || 0))}</li>
                    <li>Operating efficiency at ${(kpis.expense_efficiency || 0).toFixed(2)}x revenue-to-expense ratio</li>
                    <li>Employee productivity: ${formatCurrency((kpis.total_revenue / kpis.total_employees) || 0)} revenue per employee</li>
                    <li>Customer satisfaction score: ${(kpis.avg_customer_satisfaction || 0).toFixed(1)}/100 - ${(kpis.avg_customer_satisfaction || 0) >= 80 ? 'Excellent' : (kpis.avg_customer_satisfaction || 0) >= 60 ? 'Good' : 'Needs Improvement'}</li>
                    <li>ESG Score: ${(kpis.avg_esg_score || 0).toFixed(1)}/100 - Focus on ${(kpis.avg_esg_score || 0) < 70 ? 'sustainability improvements' : 'maintaining high standards'}</li>
                </ul>
            </div>
        `;
    } catch (error) {
        console.error('Error generating comprehensive report:', error);
        return `<div class="error">Error generating report: ${error.message}</div>`;
    }
}

async function generatePDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(20);
        doc.text('SAP Business Intelligence Report', 20, 30);
        
        // Add date
        doc.setFontSize(12);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45);
        
        // Get KPI data
        const filterParams = filterManager.getFilterParams();
        const kpisResponse = await fetch(`${API_BASE}/google/kpis?${filterParams}`);
        const kpis = await kpisResponse.json();
        
        // Add KPIs
        doc.setFontSize(16);
        doc.text('Key Performance Indicators', 20, 65);
        
        doc.setFontSize(12);
        let yPos = 80;
        const kpiData = [
            ['Total Revenue', formatCurrency(kpis.total_revenue)],
            ['Total Profit', formatCurrency(kpis.total_profit)],
            ['Total Expenses', formatCurrency(kpis.total_expenses)],
            ['Average ROI', formatPercentage(kpis.avg_roi || 0)],
            ['Total Employees', formatNumber(kpis.total_employees)]
        ];
        
        kpiData.forEach(([label, value]) => {
            doc.text(`${label}: ${value}`, 20, yPos);
            yPos += 15;
        });
        
        // Save PDF
        doc.save('sap-business-report.pdf');
        showNotification('PDF report generated successfully', 'success');
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        showNotification('Error generating PDF report', 'error');
    }
}

async function exportCSV() {
    try {
        const filterParams = filterManager.getFilterParams();
        const link = document.createElement('a');
        link.href = `${API_BASE}/google/export?${filterParams}`;
        link.download = 'sap-business-data.csv';
        link.click();
        showNotification('CSV data exported successfully', 'success');
    } catch (error) {
        console.error('Error exporting CSV:', error);
        showNotification('Error exporting CSV data', 'error');
    }
}

async function generateQuickReport(reportType) {
    showNotification(`Generating ${reportType} report...`, 'info');
    
    try {
        const filterParams = filterManager.getFilterParams();
        const kpisResponse = await fetch(`${API_BASE}/google/kpis?${filterParams}`);
        const kpis = await kpisResponse.json();
        
        let reportContent = '';
        const currentDate = new Date().toLocaleDateString();
        
        switch (reportType) {
            case 'monthly':
                const monthlyResponse = await fetch(`${API_BASE}/google/charts/monthly-summary?${filterParams}`);
                const monthlyData = await monthlyResponse.json();
                
                reportContent = `
                    <h2>Monthly Summary Report</h2>
                    <p>Generated: ${currentDate}</p>
                    <h3>Key Metrics</h3>
                    <ul>
                        <li>Total Revenue: ${formatCurrency(kpis.total_revenue)}</li>
                        <li>Total Profit: ${formatCurrency(kpis.total_profit)}</li>
                        <li>Monthly Growth: ${(kpis.revenue_growth || 0).toFixed(1)}%</li>
                        <li>Employee Count: ${formatNumber(kpis.total_employees)}</li>
                    </ul>
                `;
                break;
                
            case 'quarterly':
                const quarterlyResponse = await fetch(`${API_BASE}/google/charts/quarterly-trends?${filterParams}`);
                const quarterlyData = await quarterlyResponse.json();
                
                reportContent = `
                    <h2>Quarterly Analysis Report</h2>
                    <p>Generated: ${currentDate}</p>
                    <h3>Quarterly Performance</h3>
                    <ul>
                        <li>Total Revenue: ${formatCurrency(kpis.total_revenue)}</li>
                        <li>Profit Margin: ${formatPercentage(kpis.profit_margin || 0)}</li>
                        <li>ROI: ${formatPercentage(kpis.avg_roi || 0)}</li>
                        <li>Quarters Analyzed: ${quarterlyData.length}</li>
                    </ul>
                `;
                break;
                
            case 'annual':
                const departmentResponse = await fetch(`${API_BASE}/google/charts/department-performance?${filterParams}`);
                const departmentData = await departmentResponse.json();
                
                reportContent = `
                    <h2>Annual Report</h2>
                    <p>Generated: ${currentDate}</p>
                    <h3>Annual Overview</h3>
                    <ul>
                        <li>Total Revenue: ${formatCurrency(kpis.total_revenue)}</li>
                        <li>Total Profit: ${formatCurrency(kpis.total_profit)}</li>
                        <li>Departments: ${departmentData.length}</li>
                        <li>Average ROI: ${formatPercentage(kpis.avg_roi || 0)}</li>
                        <li>Employee Efficiency: ${(kpis.expense_efficiency || 0).toFixed(2)}x</li>
                    </ul>
                `;
                break;
        }
        
        // Create and download report
        const blob = new Blob([reportContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.html`;
        a.click();
        URL.revokeObjectURL(url);
        
        showNotification(`${reportType} report generated and downloaded successfully`, 'success');
        
    } catch (error) {
        console.error('Error generating quick report:', error);
        showNotification(`Error generating ${reportType} report`, 'error');
    }
}

// Insights
function loadInsights() {
    // Insights are static for now, but could be dynamic based on data analysis
    console.log('Insights loaded');
}

// Fullscreen Chart Manager
class FullscreenManager {
    constructor() {
        this.modal = document.getElementById('fullscreenModal');
        this.title = document.getElementById('fullscreenTitle');
        this.chart = document.getElementById('fullscreenChart');
        this.closeBtn = document.getElementById('fullscreenClose');
        this.currentChart = null;
        
        this.initializeEvents();
    }
    
    initializeEvents() {
        // Close button
        this.closeBtn?.addEventListener('click', () => this.close());
        
        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.close();
            }
        });
        
        // Click outside to close
        this.modal?.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
        
        // Fullscreen buttons
        document.querySelectorAll('[data-action="fullscreen"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const chartContainer = e.target.closest('.chart-container');
                const chartElement = chartContainer.querySelector('[id$="Chart"]');
                const chartTitle = chartContainer.querySelector('.chart-title').textContent;
                
                if (chartElement) {
                    this.open(chartElement.id, chartTitle);
                }
            });
        });
    }
    
    async open(chartId, title) {
        const originalChart = document.getElementById(chartId);
        if (!originalChart) {
            console.error('Chart not found:', chartId);
            return;
        }
        
        this.title.textContent = title;
        this.chart.innerHTML = `<div id="${chartId}_fullscreen" style="width: 100%; height: 100%;"></div>`;
        
        // Show modal first
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Wait a bit for modal to show, then recreate chart with fresh data
        setTimeout(async () => {
            try {
                await this.recreateChart(chartId);
            } catch (error) {
                console.error('Error recreating chart:', error);
                this.chart.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666;">Error loading chart data</div>';
            }
        }, 100);
    }
    
    async recreateChart(chartId) {
        const filterParams = window.filterManager ? window.filterManager.getFilterParams() : '';
        
        try {
            let data, layout;
            
            switch (chartId) {
                case 'revenueTrendChart':
                    const revenueResponse = await fetch(`${API_BASE}/google/charts/revenue-trend?${filterParams}`);
                    const revenueData = await revenueResponse.json();
                    
                    data = [{
                        x: revenueData.map(item => item.date),
                        y: revenueData.map(item => item.revenue),
                        type: 'scatter',
                        mode: 'lines+markers',
                        name: 'Revenue',
                        line: { color: '#667eea', width: 3 },
                        marker: { size: 8, color: '#667eea' },
                        hovertemplate: '<b>%{x}</b><br>Revenue: $%{y:,.0f}<extra></extra>'
                    }];
                    
                    layout = {
                        title: { text: 'Revenue Trend Analysis', font: { size: 20 } },
                        xaxis: { title: 'Date', gridcolor: 'rgba(128,128,128,0.2)' },
                        yaxis: { title: 'Revenue ($)', tickformat: '$,.0s', gridcolor: 'rgba(128,128,128,0.2)' },
                        paper_bgcolor: 'transparent',
                        plot_bgcolor: 'transparent',
                        font: { color: 'inherit', family: 'Inter, sans-serif', size: 14 },
                        margin: { t: 60, r: 40, b: 60, l: 80 }
                    };
                    break;
                    
                case 'departmentChart':
                    const deptResponse = await fetch(`${API_BASE}/google/charts/department-performance?${filterParams}`);
                    const deptData = await deptResponse.json();
                    
                    data = [{
                        x: deptData.map(item => item.department),
                        y: deptData.map(item => item.revenue),
                        type: 'bar',
                        name: 'Revenue',
                        marker: {
                            color: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'],
                            opacity: 0.8
                        },
                        hovertemplate: '<b>%{x}</b><br>Revenue: $%{y:,.0f}<extra></extra>'
                    }];
                    
                    layout = {
                        title: { text: 'Department Performance', font: { size: 20 } },
                        xaxis: { title: 'Department', tickangle: -45 },
                        yaxis: { title: 'Revenue ($)', tickformat: '$,.0s', gridcolor: 'rgba(128,128,128,0.2)' },
                        paper_bgcolor: 'transparent',
                        plot_bgcolor: 'transparent',
                        font: { color: 'inherit', family: 'Inter, sans-serif', size: 14 },
                        margin: { t: 60, r: 40, b: 100, l: 80 }
                    };
                    break;
                    
                case 'monthlyChart':
                    const monthlyResponse = await fetch(`${API_BASE}/google/charts/monthly-summary?${filterParams}`);
                    const monthlyData = await monthlyResponse.json();
                    
                    if (!monthlyData.length) {
                        this.chart.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666;">No monthly data available</div>';
                        return;
                    }
                    
                    data = [{
                        x: monthlyData.map(item => item.month_name),
                        y: monthlyData.map(item => item.revenue),
                        type: 'bar',
                        name: 'Monthly Revenue',
                        marker: {
                            color: monthlyData.map((_, i) => `hsl(${220 + i * 15}, 70%, 60%)`),
                            opacity: 0.8
                        },
                        hovertemplate: '<b>%{x}</b><br>Revenue: $%{y:,.0f}<br>Growth: %{customdata:.1f}%<extra></extra>',
                        customdata: monthlyData.map(item => item.revenue_growth || 0)
                    }];
                    
                    layout = {
                        title: { text: 'Monthly Performance Analysis', font: { size: 20 } },
                        xaxis: { title: 'Month', tickangle: -45 },
                        yaxis: { title: 'Revenue ($)', tickformat: '$,.0s', gridcolor: 'rgba(128,128,128,0.2)' },
                        paper_bgcolor: 'transparent',
                        plot_bgcolor: 'transparent',
                        font: { color: 'inherit', family: 'Inter, sans-serif', size: 14 },
                        margin: { t: 60, r: 40, b: 100, l: 80 }
                    };
                    break;
                    
                default:
                    // For other charts, try to clone existing data
                    const originalChart = document.getElementById(chartId);
                    const plotlyDiv = originalChart?.querySelector('.plotly-graph-div');
                    if (plotlyDiv && plotlyDiv.data && plotlyDiv.layout) {
                        data = plotlyDiv.data;
                        layout = {
                            ...plotlyDiv.layout,
                            width: undefined,
                            height: undefined,
                            margin: { t: 60, r: 40, b: 80, l: 80 },
                            font: { color: 'inherit', family: 'Inter, sans-serif', size: 14 }
                        };
                    } else {
                        this.chart.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666;">Chart data not available</div>';
                        return;
                    }
            }
            
            Plotly.newPlot(`${chartId}_fullscreen`, data, layout, {
                displayModeBar: true,
                responsive: true,
                displaylogo: false,
                modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d', 'autoScale2d']
            });
            
        } catch (error) {
            console.error('Error in recreateChart:', error);
            this.chart.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666;">Error loading chart data</div>';
        }
    }
    
    close() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
        this.chart.innerHTML = '';
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Initializing SAP Dashboard...');
    
    try {
        // Initialize managers
        window.themeManager = new ThemeManager();
        window.navigationManager = new NavigationManager();
        window.filterManager = new FilterManager();
        window.fullscreenManager = new FullscreenManager();
        
        // Initialize theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            themeManager.toggle();
        });
        
        // Initialize refresh button
        document.getElementById('refreshBtn')?.addEventListener('click', async () => {
            showLoading();
            try {
                await Promise.all([
                    loadKPIs(),
                    loadMainCharts(),
                    loadAnalyticsCharts()
                ]);
                showNotification('Dashboard refreshed successfully', 'success');
            } catch (error) {
                console.error('Error refreshing dashboard:', error);
                showNotification('Error refreshing dashboard', 'error');
            } finally {
                hideLoading();
            }
        });
        
        // Test API connection with better error handling
        console.log('🔗 Testing API connection...');
        try {
            const healthResponse = await fetch(`${API_BASE}/health`);
            if (!healthResponse.ok) {
                throw new Error(`HTTP ${healthResponse.status}: ${healthResponse.statusText}`);
            }
            const healthData = await healthResponse.json();
            
            if (healthData.status === 'ok') {
                console.log('✅ API connection successful');
                
                // Load initial data with individual error handling
                showLoading();
                
                console.log('📊 Loading KPIs...');
                try {
                    await loadKPIs();
                    console.log('✅ KPIs loaded successfully');
                } catch (error) {
                    console.error('❌ KPI loading failed:', error);
                }
                
                console.log('📈 Loading main charts...');
                try {
                    await loadMainCharts();
                    console.log('✅ Main charts loaded successfully');
                } catch (error) {
                    console.error('❌ Main charts loading failed:', error);
                }
                
                hideLoading();
                console.log('✅ SAP Dashboard initialized successfully');
            } else {
                throw new Error('API health check failed');
            }
        } catch (error) {
            console.error('❌ API connection failed:', error);
            showNotification(`API connection failed: ${error.message}. Please ensure the server is running on http://localhost:5000`, 'error');
            hideLoading();
        }
        
    } catch (error) {
        console.error('❌ Dashboard initialization failed:', error);
        showNotification('Dashboard initialization failed. Please check if the API server is running.', 'error');
        hideLoading();
    }
});

// Responsive sidebar toggle
document.addEventListener('DOMContentLoaded', () => {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }
});

console.log('📝 SAP Dashboard script loaded');