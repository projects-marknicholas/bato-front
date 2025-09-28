// Initialize AOS
AOS.init({
    duration: 800,
    easing: "ease-in-out",
    once: true,
});

// Sample guest data with ranking based on visits
const guestsData = [
    {
        id: "G001",
        name: "Carlos Mendoza",
        email: "carlos.mendoza@email.com",
        phone: "+63 912 345 6789",
        visits: 15,
        lastVisit: "2024-01-15",
        totalSpent: 125000,
        status: "vip",
        joinDate: "2022-03-10",
        preferences: "Prefers pool view rooms, vegetarian meals",
        notes: "Very satisfied customer, always leaves positive reviews"
    },
    {
        id: "G002",
        name: "Lisa Garcia",
        email: "lisa.garcia@email.com",
        phone: "+63 917 654 3210",
        visits: 12,
        lastVisit: "2024-01-12",
        totalSpent: 98000,
        status: "vip",
        joinDate: "2022-05-22",
        preferences: "Family cottage, extra bed for child",
        notes: "Celebrates anniversary every year at the resort"
    },
    {
        id: "G003",
        name: "Roberto Silva",
        email: "roberto.silva@email.com",
        phone: "+63 918 765 4321",
        visits: 10,
        lastVisit: "2024-01-08",
        totalSpent: 75000,
        status: "vip",
        joinDate: "2022-07-15",
        preferences: "Bamboo hut, early check-in",
        notes: "Business traveler, often books for clients"
    },
    {
        id: "G004",
        name: "Elena Reyes",
        email: "elena.reyes@email.com",
        phone: "+63 919 876 5432",
        visits: 8,
        lastVisit: "2023-12-20",
        totalSpent: 62000,
        status: "vip",
        joinDate: "2022-09-05",
        preferences: "Quiet area, spa services",
        notes: "Yoga instructor, often brings groups"
    },
    {
        id: "G005",
        name: "Miguel Torres",
        email: "miguel.torres@email.com",
        phone: "+63 920 987 6543",
        visits: 7,
        lastVisit: "2023-12-15",
        totalSpent: 58000,
        status: "regular",
        joinDate: "2023-01-10",
        preferences: "Pool villa, family activities",
        notes: "Large family, always books during school holidays"
    },
    {
        id: "G006",
        name: "Sofia Hernandez",
        email: "sofia.hernandez@email.com",
        phone: "+63 921 098 7654",
        visits: 6,
        lastVisit: "2023-11-28",
        totalSpent: 45000,
        status: "regular",
        joinDate: "2023-02-15",
        preferences: "Honeymoon suite, romantic dinners",
        notes: "Newlywed, very particular about room decorations"
    },
    {
        id: "G007",
        name: "David Lim",
        email: "david.lim@email.com",
        phone: "+63 922 109 8765",
        visits: 5,
        lastVisit: "2023-11-15",
        totalSpent: 38000,
        status: "regular",
        joinDate: "2023-03-20",
        preferences: "Deluxe room, business center access",
        notes: "Frequent business traveler, prefers quiet floors"
    },
    {
        id: "G008",
        name: "Maria Santos",
        email: "maria.santos@email.com",
        phone: "+63 923 210 9876",
        visits: 4,
        lastVisit: "2023-10-30",
        totalSpent: 32000,
        status: "regular",
        joinDate: "2023-04-05",
        preferences: "Ground floor rooms, accessibility features",
        notes: "Elderly guest, requires special assistance"
    },
    {
        id: "G009",
        name: "Juan Dela Cruz",
        email: "juan.delacruz@email.com",
        phone: "+63 924 321 0987",
        visits: 3,
        lastVisit: "2023-10-15",
        totalSpent: 24000,
        status: "regular",
        joinDate: "2023-05-12",
        preferences: "Adventure activities, guided tours",
        notes: "Adventure seeker, always tries new activities"
    },
    {
        id: "G010",
        name: "Ana Rodriguez",
        email: "ana.rodriguez@email.com",
        phone: "+63 925 432 1098",
        visits: 2,
        lastVisit: "2023-09-28",
        totalSpent: 18000,
        status: "new",
        joinDate: "2023-06-18",
        preferences: "Spa treatments, wellness activities",
        notes: "Health-conscious, prefers organic meals"
    },
    {
        id: "G011",
        name: "James Wilson",
        email: "james.wilson@email.com",
        phone: "+63 926 543 2109",
        visits: 2,
        lastVisit: "2023-09-10",
        totalSpent: 16000,
        status: "new",
        joinDate: "2023-07-22",
        preferences: "Golf course access, sports facilities",
        notes: "Golf enthusiast, often brings business partners"
    },
    {
        id: "G012",
        name: "Sarah Johnson",
        email: "sarah.johnson@email.com",
        phone: "+63 927 654 3210",
        visits: 1,
        lastVisit: "2023-08-25",
        totalSpent: 8000,
        status: "new",
        joinDate: "2023-08-01",
        preferences: "Beachfront rooms, water sports",
        notes: "First-time visitor, very impressed with service"
    }
];

// Global variables
let currentPage = 1;
const recordsPerPage = 10;
let filteredGuests = [];
let sortField = 'visits';
let sortDirection = 'desc';
let sortedGuestsByVisits = [];

// DOM Elements
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const visitsFilter = document.getElementById('visitsFilter');
const guestsTableBody = document.getElementById('guestsTableBody');
const pagination = document.getElementById('pagination');
const showingFrom = document.getElementById('showingFrom');
const showingTo = document.getElementById('showingTo');
const totalRecords = document.getElementById('totalRecords');
const guestModal = document.getElementById('guestModal');
const closeModal = document.getElementById('closeModal');
const guestDetails = document.getElementById('guestDetails');
const exportBtn = document.getElementById('exportBtn');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize data
    sortedGuestsByVisits = [...guestsData].sort((a, b) => b.visits - a.visits);
    filteredGuests = [...guestsData];
    
    updateStats();
    sortGuests();
    renderTable();
    setupEventListeners();
    
    console.log('Page initialized with', guestsData.length, 'guests');
});

// Set up event listeners
function setupEventListeners() {
    // Sidebar toggle
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', toggleSidebar);
    }
    
    // Filters
    if (searchInput) {
        searchInput.addEventListener('input', filterGuests);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', filterGuests);
    }
    if (visitsFilter) {
        visitsFilter.addEventListener('change', filterGuests);
    }
    
    // Sorting
    const sortableHeaders = document.querySelectorAll('th[data-sort]');
    if (sortableHeaders.length > 0) {
        sortableHeaders.forEach(th => {
            th.addEventListener('click', function() {
                const field = this.getAttribute('data-sort');
                sortGuests(field);
            });
        });
    }
    
    // Modal
    if (closeModal) {
        closeModal.addEventListener('click', closeGuestModal);
    }
    
    // Export button
    if (exportBtn) {
        exportBtn.addEventListener('click', exportGuests);
    }
    
    // Close modal when clicking outside
    if (guestModal) {
        guestModal.addEventListener('click', function(e) {
            if (e.target === guestModal) {
                closeGuestModal();
            }
        });
    }
}

// Toggle sidebar on mobile
function toggleSidebar() {
    if (sidebar && sidebarOverlay) {
        sidebar.classList.toggle('-translate-x-full');
        sidebarOverlay.classList.toggle('active');
    }
}

// Sort guests by specified field
function sortGuests(field = null) {
    if (field) {
        if (sortField === field) {
            // Toggle direction if same field
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            // New field, default to descending for visits/rank, ascending for others
            sortField = field;
            sortDirection = (field === 'visits' || field === 'rank' || field === 'totalSpent') ? 'desc' : 'asc';
        }
    }
    
    filteredGuests.sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];
        
        // Special handling for rank (which is based on visits)
        if (sortField === 'rank') {
            aValue = a.visits;
            bValue = b.visits;
        }
        
        if (sortField === 'name') {
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
        }
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
    
    // Update sort indicators
    const sortableHeaders = document.querySelectorAll('th[data-sort]');
    if (sortableHeaders.length > 0) {
        sortableHeaders.forEach(th => {
            const indicator = th.querySelector('.sort-indicator');
            if (th.getAttribute('data-sort') === sortField) {
                indicator.textContent = sortDirection === 'asc' ? '↑' : '↓';
            } else {
                if (indicator) indicator.textContent = '';
            }
        });
    }
    
    renderTable();
}

// Filter guests based on filters
function filterGuests() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const status = statusFilter ? statusFilter.value : 'all';
    const visits = visitsFilter ? visitsFilter.value : 'all';
    
    filteredGuests = guestsData.filter(guest => {
        // Search filter
        const matchesSearch = 
            guest.name.toLowerCase().includes(searchTerm) ||
            guest.email.toLowerCase().includes(searchTerm) ||
            guest.phone.toLowerCase().includes(searchTerm);
        
        // Status filter
        let matchesStatus = true;
        if (status === 'current') {
            // For demo purposes, we'll consider guests who visited in the last 30 days as current
            const lastVisit = new Date(guest.lastVisit);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            matchesStatus = lastVisit >= thirtyDaysAgo;
        } else if (status === 'vip') {
            matchesStatus = guest.status === 'vip';
        } else if (status === 'new') {
            matchesStatus = guest.visits <= 2;
        }
        
        // Visits filter
        let matchesVisits = true;
        if (visits === '10plus') {
            matchesVisits = guest.visits >= 10;
        } else if (visits === '5-10') {
            matchesVisits = guest.visits >= 5 && guest.visits <= 10;
        } else if (visits === '1-5') {
            matchesVisits = guest.visits >= 1 && guest.visits <= 5;
        }
        
        return matchesSearch && matchesStatus && matchesVisits;
    });
    
    currentPage = 1;
    sortGuests();
    updateStats();
}

// Get ranking badge based on global rank (by visits)
function getRankingBadge(guest) {
    // Find the global rank based on visits
    const globalRank = sortedGuestsByVisits.findIndex(g => g.id === guest.id) + 1;
    
    if (globalRank === 1) {
        return `<span class="ranking-badge ranking-1">${globalRank}</span>`;
    } else if (globalRank === 2) {
        return `<span class="ranking-badge ranking-2">${globalRank}</span>`;
    } else if (globalRank === 3) {
        return `<span class="ranking-badge ranking-3">${globalRank}</span>`;
    } else if (globalRank <= 10) {
        return `<span class="ranking-badge ranking-4-10">${globalRank}</span>`;
    } else {
        return `<span class="ranking-badge ranking-other">${globalRank}</span>`;
    }
}

// Render the table with current data
function renderTable() {
    if (!guestsTableBody) {
        console.error('Table body element not found');
        return;
    }
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredGuests.length / recordsPerPage);
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = Math.min(startIndex + recordsPerPage, filteredGuests.length);
    const currentGuests = filteredGuests.slice(startIndex, endIndex);
    
    // Update showing records info
    if (showingFrom) showingFrom.textContent = filteredGuests.length > 0 ? startIndex + 1 : 0;
    if (showingTo) showingTo.textContent = endIndex;
    if (totalRecords) totalRecords.textContent = filteredGuests.length;
    
    // Clear table body
    guestsTableBody.innerHTML = '';
    
    // Check if there are guests to display
    if (currentGuests.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="8" class="text-center py-8 text-gray-500">
                <i class="fas fa-users-slash text-4xl mb-4 block"></i>
                No guests found matching your criteria
            </td>
        `;
        guestsTableBody.appendChild(row);
        return;
    }
    
    // Populate table rows with AOS animations
    currentGuests.forEach((guest, index) => {
        const row = document.createElement('tr');
        row.setAttribute('data-aos', 'fade-up');
        row.setAttribute('data-aos-delay', (index % 10) * 50);
        
        row.innerHTML = `
            <td class="font-medium">${getRankingBadge(guest)}</td>
            <td>
                <div class="flex items-center">
                    <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                        <span class="text-white font-semibold text-sm">${guest.name.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <div>
                        <div class="font-medium">${guest.name}</div>
                        <div class="text-xs text-gray-500">${guest.status.toUpperCase()} Guest</div>
                    </div>
                </div>
            </td>
            <td>${guest.email}</td>
            <td>${guest.phone}</td>
            <td>
                <span class="visits-count">
                    <i class="fas fa-calendar-day mr-1"></i> ${guest.visits}
                </span>
            </td>
            <td>${formatDate(guest.lastVisit)}</td>
            <td class="font-semibold">₱${guest.totalSpent.toLocaleString()}</td>
            <td>
                <div class="action-buttons">
                    <button class="view-details btn-primary text-sm" data-id="${guest.id}">
                        <i class="fas fa-eye mr-1"></i> View
                    </button>
                    <button class="send-msg btn-secondary text-sm" data-id="${guest.id}">
                        <i class="fas fa-envelope mr-1"></i> Message
                    </button>
                </div>
            </td>
        `;
        guestsTableBody.appendChild(row);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.view-details').forEach(button => {
        button.addEventListener('click', function() {
            const guestId = this.getAttribute('data-id');
            showGuestDetails(guestId);
        });
    });
    
    document.querySelectorAll('.send-msg').forEach(button => {
        button.addEventListener('click', function() {
            const guestId = this.getAttribute('data-id');
            alert(`Message feature would open for guest ${guestId}`);
        });
    });
    
    // Render pagination
    renderPagination(totalPages);
    
    // Reinitialize AOS for new elements
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
}

// Render pagination controls
function renderPagination(totalPages) {
    if (!pagination) return;
    
    pagination.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // Previous button
    const prevButton = document.createElement('button');
    prevButton.className = `page-btn ${currentPage === 1 ? 'disabled' : ''}`;
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });
    pagination.appendChild(prevButton);
    
    // Page buttons
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            currentPage = i;
            renderTable();
        });
        pagination.appendChild(pageButton);
    }
    
    // Next button
    const nextButton = document.createElement('button');
    nextButton.className = `page-btn ${currentPage === totalPages ? 'disabled' : ''}`;
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
        }
    });
    pagination.appendChild(nextButton);
}

// Show guest details in modal
function showGuestDetails(guestId) {
    const guest = guestsData.find(g => g.id === guestId);
    if (!guest) return;
    
    // Calculate global rank based on visits
    const globalRank = sortedGuestsByVisits.findIndex(g => g.id === guest.id) + 1;
    
    if (guestDetails) {
        guestDetails.innerHTML = `
            <div class="flex items-center gap-4 mb-6">
                <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                    <span class="text-white font-semibold text-xl">${guest.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div>
                    <h3 class="text-xl font-bold">${guest.name}</h3>
                    <p class="text-gray-600">${globalRank <= 10 ? `Rank #${globalRank} Guest` : 'Regular Guest'}</p>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <h4 class="font-semibold text-gray-700 mb-2">Contact Information</h4>
                    <p><strong>Email:</strong> ${guest.email}</p>
                    <p><strong>Phone:</strong> ${guest.phone}</p>
                    <p><strong>Member Since:</strong> ${formatDate(guest.joinDate)}</p>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-700 mb-2">Guest Statistics</h4>
                    <p><strong>Total Visits:</strong> ${guest.visits}</p>
                    <p><strong>Last Visit:</strong> ${formatDate(guest.lastVisit)}</p>
                    <p><strong>Total Spent:</strong> ₱${guest.totalSpent.toLocaleString()}</p>
                    <p><strong>Status:</strong> <span class="px-2 py-1 rounded-full text-xs font-medium ${guest.status === 'vip' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}">${guest.status.toUpperCase()}</span></p>
                </div>
            </div>
            
            <div class="mb-6">
                <h4 class="font-semibold text-gray-700 mb-2">Preferences</h4>
                <p>${guest.preferences}</p>
            </div>
            
            <div class="mb-6">
                <h4 class="font-semibold text-gray-700 mb-2">Notes</h4>
                <p>${guest.notes}</p>
            </div>
            
            <div class="flex justify-end gap-4 mt-8">
                <button class="send-msg-modal btn-primary" data-id="${guest.id}">
                    <i class="fas fa-envelope mr-2"></i> Send Message
                </button>
                <button class="close-modal-btn btn-secondary">
                    Close
                </button>
            </div>
        `;
        
        // Add event listeners to modal buttons
        const msgBtn = guestDetails.querySelector('.send-msg-modal');
        const closeBtn = guestDetails.querySelector('.close-modal-btn');
        
        if (msgBtn) {
            msgBtn.addEventListener('click', function() {
                const guestId = this.getAttribute('data-id');
                alert(`Message feature would open for guest ${guestId}`);
            });
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', closeGuestModal);
        }
    }
    
    // Show modal
    if (guestModal) {
        guestModal.classList.add('active');
    }
}

// Close guest modal
function closeGuestModal() {
    if (guestModal) {
        guestModal.classList.remove('active');
    }
}

// Update stats cards
function updateStats() {
    const total = filteredGuests.length;
    const vip = filteredGuests.filter(g => g.status === 'vip').length;
    
    // For demo, we'll calculate current guests as those who visited in the last 30 days
    const current = filteredGuests.filter(g => {
        const lastVisit = new Date(g.lastVisit);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return lastVisit >= thirtyDaysAgo;
    }).length;
    
    const avgVisits = filteredGuests.length > 0 ? 
        (filteredGuests.reduce((sum, guest) => sum + guest.visits, 0) / filteredGuests.length).toFixed(1) : 0;
    
    if (document.getElementById('totalGuests')) {
        document.getElementById('totalGuests').textContent = total;
    }
    if (document.getElementById('vipGuests')) {
        document.getElementById('vipGuests').textContent = vip;
    }
    if (document.getElementById('currentGuests')) {
        document.getElementById('currentGuests').textContent = current;
    }
    if (document.getElementById('avgVisits')) {
        document.getElementById('avgVisits').textContent = avgVisits;
    }
}

// Format date for display
function formatDate(dateString) {
    try {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    } catch (e) {
        return dateString;
    }
}

// Export guests to CSV
function exportGuests() {
    // Simple CSV export implementation
    const headers = ['Rank', 'Name', 'Email', 'Phone', 'Visits', 'Last Visit', 'Total Spent', 'Status'];
    const csvContent = [
        headers.join(','),
        ...filteredGuests.map(guest => {
            const globalRank = sortedGuestsByVisits.findIndex(g => g.id === guest.id) + 1;
            return [
                globalRank,
                `"${guest.name}"`,
                `"${guest.email}"`,
                `"${guest.phone}"`,
                guest.visits,
                guest.lastVisit,
                guest.totalSpent,
                guest.status
            ].join(',');
        })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batospring-guests-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Guests exported successfully!');
}