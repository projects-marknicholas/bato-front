// Initialize AOS
AOS.init({
    duration: 800,
    easing: "ease-in-out",
    once: true,
});

// Sidebar toggle functionality
const sidebarToggle = document.getElementById("sidebarToggle");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");

sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("-translate-x-full");
    sidebarOverlay.classList.toggle("active");
});

sidebarOverlay.addEventListener("click", () => {
    sidebar.classList.add("-translate-x-full");
    sidebarOverlay.classList.remove("active");
});

// Chart instances
let utilizationChart;

// API endpoints
const API_BASE = 'http://127.0.0.1:5000';
const ENDPOINTS = {
    DASHBOARD_DATA: `${API_BASE}/api/dashboard-data`,
    TOMORROW_PREDICTIONS: `${API_BASE}/api/predictions/tomorrow`,
    ANALYTICS_SUMMARY: `${API_BASE}/api/analytics/summary`,
    HEALTH_CHECK: `${API_BASE}/api/health`
};

// Initialize charts
function initializeCharts() {
    // Utilization Chart
    const utilizationCtx = document.getElementById("utilizationChart").getContext("2d");
    utilizationChart = new Chart(utilizationCtx, {
        type: "bar",
        data: {
            labels: [],
            datasets: [
                {
                    label: "Predicted Guests",
                    data: [],
                    backgroundColor: "#059669",
                    borderColor: "#047857",
                    borderWidth: 1,
                },
                {
                    label: "Capacity",
                    data: [],
                    backgroundColor: "rgba(107, 114, 128, 0.3)",
                    borderColor: "rgba(107, 114, 128, 0.5)",
                    borderWidth: 1,
                }
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Guests'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Resources'
                    }
                }
            },
        },
    });
}

// Fetch data from API
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

// Load all data
async function loadAllData() {
    try {
        // Show loading states
        document.getElementById('lastUpdated').textContent = 'Loading...';
        
        // Fetch data from all endpoints
        const [dashboardData, predictionsData, analyticsData] = await Promise.all([
            fetchData(ENDPOINTS.DASHBOARD_DATA),
            fetchData(ENDPOINTS.TOMORROW_PREDICTIONS),
            fetchData(ENDPOINTS.ANALYTICS_SUMMARY)
        ]);
        
        if (dashboardData && dashboardData.success) {
            updateDashboardData(dashboardData.data);
        }
        
        if (predictionsData && predictionsData.success) {
            updatePredictionsData(predictionsData);
        }
        
        if (analyticsData && analyticsData.success) {
            updateAnalyticsData(analyticsData);
        }
        
        // Update last updated time
        const now = new Date();
        document.getElementById('lastUpdated').textContent = now.toLocaleString();
        
    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('lastUpdated').textContent = 'Error loading data';
    }
}

// Update dashboard data
function updateDashboardData(data) {
    // Update summary stats
    if (data.summary) {
        document.getElementById('dayBookings').textContent = data.summary.day_bookings || 0;
        document.getElementById('nightBookings').textContent = data.summary.night_bookings || 0;
        document.getElementById('confirmedBookings').textContent = data.summary.confirmed_bookings || 0;
        document.getElementById('pendingBookings').textContent = data.summary.pending_bookings || 0;
        document.getElementById('totalRevenue').textContent = `₱${(data.summary.total_revenue || 0).toLocaleString()}`;
        document.getElementById('avgBookingValue').textContent = `₱${(data.summary.average_booking_value || 0).toLocaleString()}`;
    }
    
    // Update revenue breakdown
    if (data.revenue_analysis && data.revenue_analysis.by_rate_type) {
        document.getElementById('dayRevenue').textContent = `₱${(data.revenue_analysis.by_rate_type.day || 0).toLocaleString()}`;
        document.getElementById('nightRevenue').textContent = `₱${(data.revenue_analysis.by_rate_type.night || 0).toLocaleString()}`;
    }
}

// Update predictions data
function updatePredictionsData(data) {
    const predictions = data.predictions || [];
    
    // Calculate total predicted guests
    const totalPredictedGuests = predictions.reduce((sum, prediction) => {
        return sum + (prediction.predicted_guests_tomorrow || 0);
    }, 0);
    
    document.getElementById('predictedGuests').textContent = totalPredictedGuests;
    
    // Update utilization chart
    const resourceNames = predictions.map(p => p.resource_name);
    const predictedGuests = predictions.map(p => p.predicted_guests_tomorrow);
    const capacities = predictions.map(p => p.capacity);
    
    utilizationChart.data.labels = resourceNames;
    utilizationChart.data.datasets[0].data = predictedGuests;
    utilizationChart.data.datasets[1].data = capacities;
    utilizationChart.update();
    
    // Update predictions table
    const tableBody = document.getElementById('predictionsTable');
    tableBody.innerHTML = predictions.map(prediction => `
        <tr class="border-b border-gray-100 hover:bg-gray-50">
            <td class="py-3 px-4 text-sm text-gray-800">${prediction.resource_name}</td>
            <td class="py-3 px-4 text-sm text-gray-600">${prediction.capacity}</td>
            <td class="py-3 px-4 text-sm font-medium ${getPredictionColorClass(prediction.predicted_guests_tomorrow, prediction.capacity)}">
                ${prediction.predicted_guests_tomorrow}
            </td>
            <td class="py-3 px-4 text-sm">
                <div class="flex items-center">
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-green-600 h-2 rounded-full" style="width: ${prediction.utilization_rate}%"></div>
                    </div>
                    <span class="ml-2 text-gray-600">${prediction.utilization_rate}%</span>
                </div>
            </td>
            <td class="py-3 px-4 text-sm">
                <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColorClass(prediction.prediction_status)}">
                    ${prediction.prediction_status}
                </span>
            </td>
        </tr>
    `).join('');
}

// Update analytics data
function updateAnalyticsData(data) {
    // Update high demand count
    if (data.business_insights && data.business_insights.high_demand_resources) {
        document.getElementById('highDemandCount').textContent = data.business_insights.high_demand_resources.length;
    }
    
    // Update promotion opportunities count
    if (data.business_insights && data.business_insights.promotion_opportunities) {
        document.getElementById('promotionCount').textContent = data.business_insights.promotion_opportunities.length;
    }
    
    // Update peak day
    if (data.business_insights && data.business_insights.peak_day) {
        document.getElementById('peakDay').textContent = data.business_insights.peak_day.day_name;
    }
    
    // Update business insights
    const insightsContainer = document.getElementById('businessInsights');
    insightsContainer.innerHTML = '';
    
    if (data.business_insights) {
        // High demand resources
        if (data.business_insights.high_demand_resources && data.business_insights.high_demand_resources.length > 0) {
            const highDemandDiv = document.createElement('div');
            highDemandDiv.className = 'bg-orange-50 border border-orange-200 rounded-lg p-4';
            highDemandDiv.innerHTML = `
                <div class="flex items-start">
                    <i class="fas fa-fire text-orange-500 mt-1 mr-3"></i>
                    <div>
                        <h3 class="font-semibold text-orange-800">High Demand Resources</h3>
                        <p class="text-sm text-orange-700 mt-1">
                            ${data.business_insights.high_demand_resources.map(r => r.resource_name).join(', ')} 
                            are expected to have high utilization (>80%) tomorrow.
                        </p>
                    </div>
                </div>
            `;
            insightsContainer.appendChild(highDemandDiv);
        }
        
        // Promotion opportunities
        if (data.business_insights.promotion_opportunities && data.business_insights.promotion_opportunities.length > 0) {
            const promotionDiv = document.createElement('div');
            promotionDiv.className = 'bg-purple-50 border border-purple-200 rounded-lg p-4';
            promotionDiv.innerHTML = `
                <div class="flex items-start">
                    <i class="fas fa-bullhorn text-purple-500 mt-1 mr-3"></i>
                    <div>
                        <h3 class="font-semibold text-purple-800">Promotion Opportunities</h3>
                        <p class="text-sm text-purple-700 mt-1">
                            Consider promoting ${data.business_insights.promotion_opportunities.map(r => r.resource_name).join(', ')} 
                            as they have low historical utilization.
                        </p>
                    </div>
                </div>
            `;
            insightsContainer.appendChild(promotionDiv);
        }
        
        // Peak day insight
        if (data.business_insights.peak_day) {
            const peakDayDiv = document.createElement('div');
            peakDayDiv.className = 'bg-blue-50 border border-blue-200 rounded-lg p-4';
            peakDayDiv.innerHTML = `
                <div class="flex items-start">
                    <i class="fas fa-chart-line text-blue-500 mt-1 mr-3"></i>
                    <div>
                        <h3 class="font-semibold text-blue-800">Peak Booking Day</h3>
                        <p class="text-sm text-blue-700 mt-1">
                            ${data.business_insights.peak_day.day_name} is your busiest day with 
                            ${data.business_insights.peak_day.bookings} bookings on average.
                        </p>
                    </div>
                </div>
            `;
            insightsContainer.appendChild(peakDayDiv);
        }
        
        // Peak month insight
        if (data.business_insights.peak_month) {
            const monthNames = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];
            const peakMonthDiv = document.createElement('div');
            peakMonthDiv.className = 'bg-green-50 border border-green-200 rounded-lg p-4';
            peakMonthDiv.innerHTML = `
                <div class="flex items-start">
                    <i class="fas fa-calendar-alt text-green-500 mt-1 mr-3"></i>
                    <div>
                        <h3 class="font-semibold text-green-800">Seasonal Pattern</h3>
                        <p class="text-sm text-green-700 mt-1">
                            ${monthNames[data.business_insights.peak_month.month - 1]} is your peak month with 
                            ${data.business_insights.peak_month.bookings} bookings on average.
                        </p>
                    </div>
                </div>
            `;
            insightsContainer.appendChild(peakMonthDiv);
        }
    }
}

// Helper functions
function getPredictionColorClass(predicted, capacity) {
    const utilization = (predicted / capacity) * 100;
    if (utilization >= 80) return 'text-red-600';
    if (utilization >= 50) return 'text-orange-600';
    return 'text-green-600';
}

function getStatusColorClass(status) {
    if (status.includes('Estimated')) return 'bg-blue-100 text-blue-800';
    if (status.includes('Default')) return 'bg-gray-100 text-gray-800';
    return 'bg-green-100 text-green-800';
}

// Initialize dashboard
document.addEventListener("DOMContentLoaded", () => {
    initializeCharts();
    loadAllData();

    // Refresh predictions on button click
    document.getElementById('refreshPredictions').addEventListener('click', () => {
        loadAllData();
    });
});

// Handle window resize
window.addEventListener("resize", () => {
    if (utilizationChart) utilizationChart.resize();
});