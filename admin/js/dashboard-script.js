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

// Time filter functionality
const timeFilter = document.getElementById("timeFilter");
const yearSelector = document.getElementById("yearSelector");

timeFilter.addEventListener("change", (e) => {
    const selectedFilter = e.target.value;

    // Show/hide year selector
    if (selectedFilter === "yearly") {
        yearSelector.classList.remove("hidden");
    } else {
        yearSelector.classList.add("hidden");
    }

    // Update charts and stats
    updateDashboardData(selectedFilter);
});

yearSelector.addEventListener("change", () => {
    updateDashboardData("yearly", yearSelector.value);
});

// Chart instances
let revenueChart, occupancyChart;

// Initialize charts
function initializeCharts() {
    // Revenue Chart
    const revenueCtx = document.getElementById("revenueChart").getContext("2d");
    revenueChart = new Chart(revenueCtx, {
        type: "line",
        data: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            datasets: [
                {
                    label: "Revenue (₱)",
                    data: [15000, 18000, 22000, 19000, 25000, 28000, 24000],
                    borderColor: "#059669",
                    backgroundColor: "rgba(5, 150, 105, 0.1)",
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value) => "₱" + value.toLocaleString(),
                    },
                },
            },
        },
    });

    // Occupancy Chart
    const occupancyCtx = document.getElementById("occupancyChart").getContext("2d");
    occupancyChart = new Chart(occupancyCtx, {
        type: "doughnut",
        data: {
            labels: ["Occupied", "Available", "Maintenance"],
            datasets: [
                {
                    data: [18, 5, 2],
                    backgroundColor: ["#059669", "#10b981", "#f59e0b"],
                    borderWidth: 0,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom",
                },
            },
        },
    });
}

// Update dashboard data based on filter
function updateDashboardData(filter, year = null) {
    console.log("Updating dashboard data for filter:", filter, year);

    // Update chart period labels
    document.getElementById("revenueChartPeriod").textContent =
        filter.charAt(0).toUpperCase() + filter.slice(1) + (year ? ` (${year})` : " performance");
    document.getElementById("occupancyChartPeriod").textContent =
        filter.charAt(0).toUpperCase() + filter.slice(1) + (year ? ` (${year})` : " status");

    // Sample data for different filters
    const sampleData = {
        daily: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            revenue: [15000, 18000, 22000, 19000, 25000, 28000, 24000],
            todayBookings: 12,
            currentGuests: 45,
            todayRevenue: "₱24,500",
            availableResources: "18/25",
        },
        weekly: {
            labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
            revenue: [120000, 135000, 148000, 162000],
            todayBookings: 84,
            currentGuests: 312,
            todayRevenue: "₱162,000",
            availableResources: "15/25",
        },
        yearly: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            revenue: [450000, 520000, 480000, 610000, 720000, 850000, 920000, 880000, 750000, 680000, 590000, 640000],
            todayBookings: 1248,
            currentGuests: 2856,
            todayRevenue: "₱8,640,000",
            availableResources: "20/25",
        },
    };

    const data = sampleData[filter];

    // Update stats cards
    document.getElementById("todayBookings").textContent = data.todayBookings;
    document.getElementById("currentGuests").textContent = data.currentGuests;
    document.getElementById("todayRevenue").textContent = data.todayRevenue;
    document.getElementById("availableResources").textContent = data.availableResources;

    // Update revenue chart
    revenueChart.data.labels = data.labels;
    revenueChart.data.datasets[0].data = data.revenue;
    revenueChart.update();

    // Update occupancy chart based on filter
    if (filter === "daily") {
        occupancyChart.data.datasets[0].data = [18, 5, 2];
    } else if (filter === "weekly") {
        occupancyChart.data.datasets[0].data = [15, 8, 2];
    } else if (filter === "yearly") {
        occupancyChart.data.datasets[0].data = [20, 3, 2];
    }
    occupancyChart.update();
}

// Load recent bookings
function loadRecentBookings() {
    const recentBookings = [
        {
            id: "BK001",
            guest: "Maria Santos",
            resource: "Deluxe Room",
            date: "2024-01-15",
            status: "confirmed",
            amount: "₱2,500",
        },
        {
            id: "BK002",
            guest: "Juan Dela Cruz",
            resource: "Family Cottage",
            date: "2024-01-15",
            status: "pending",
            amount: "₱4,000",
        },
        {
            id: "BK003",
            guest: "Ana Rodriguez",
            resource: "Bamboo Hut",
            date: "2024-01-14",
            status: "confirmed",
            amount: "₱1,800",
        },
    ];

    const container = document.getElementById("recentBookings");
    container.innerHTML = recentBookings
        .map(
            (booking) => `
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div class="flex-1">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                            <span class="text-white font-semibold text-sm">${booking.guest
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}</span>
                        </div>
                        <div>
                            <p class="font-medium text-gray-900">${booking.guest}</p>
                            <p class="text-sm text-gray-600">${booking.resource} • ${booking.date}</p>
                        </div>
                    </div>
                </div>
                <div class="text-right">
                    <p class="font-semibold text-gray-900">${booking.amount}</p>
                    <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        booking.status === "confirmed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }">
                        ${booking.status}
                    </span>
                </div>
            </div>
        `
        )
        .join("");
}

// Load top guests
function loadTopGuests() {
    const topGuests = [
        { name: "Carlos Mendoza", visits: 15, badge: 1 },
        { name: "Lisa Garcia", visits: 12, badge: 2 },
        { name: "Roberto Silva", visits: 10, badge: 3 },
        { name: "Elena Reyes", visits: 8, badge: 4 },
        { name: "Miguel Torres", visits: 7, badge: 5 },
    ];

    const container = document.getElementById("topGuests");
    container.innerHTML = topGuests
        .map(
            (guest) => `
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div class="flex items-center space-x-3">
                    <div class="relative">
                        <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                            <span class="text-white font-semibold text-sm">${guest.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}</span>
                        </div>
                        ${
                            guest.badge <= 3
                                ? `
                            <div class="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                                <span class="text-white text-xs font-bold">${guest.badge}</span>
                            </div>
                        `
                                : `
                            <div class="absolute -top-1 -right-1 w-5 h-5 bg-gray-500 rounded-full flex items-center justify-center">
                                <span class="text-white text-xs font-bold">${guest.badge}</span>
                            </div>
                        `
                        }
                    </div>
                    <div>
                        <p class="font-medium text-gray-900">${guest.name}</p>
                        <p class="text-sm text-gray-600">${guest.visits} visits</p>
                    </div>
                </div>
                <div class="text-right">
                    <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        guest.badge <= 3 ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"
                    }">
                        Top ${guest.badge}
                    </span>
                </div>
            </div>
        `
        )
        .join("");
}

// Initialize dashboard
document.addEventListener("DOMContentLoaded", () => {
    initializeCharts();
    loadRecentBookings();
    loadTopGuests();

    // Set initial filter
    updateDashboardData("daily");
});

// Handle window resize
window.addEventListener("resize", () => {
    if (revenueChart) revenueChart.resize();
    if (occupancyChart) occupancyChart.resize();
});