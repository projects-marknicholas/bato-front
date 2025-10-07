// Initialize AOS
AOS.init({
    duration: 800,
    easing: "ease-in-out",
    once: true,
});

// API Configuration
const API_BASE_URL = window.CONFIG.API_BASE_URL;
const ENDPOINT_URL = window.CONFIG.ENDPOINTS.ADMIN_GUESTS;

// Global variables
let currentPage = 1;
const recordsPerPage = 10;
let allGuests = [];
let filteredGuests = [];
let sortField = 'visits';
let sortDirection = 'desc';

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
    initializeApp();
    setupEventListeners();
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
        sidebar.classList.toggle('active');
        sidebarOverlay.classList.toggle('active');
    }
}

// Initialize application
async function initializeApp() {
    if (!checkAuthentication()) {
        return;
    }
    
    try {
        await loadGuests();
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showError('Failed to load guests data');
    }
}

// Check if user is authenticated
function checkAuthentication() {
    const apiKey = getApiKey();
    const csrfToken = getCsrfToken();
    
    if (!apiKey || !csrfToken) {
        window.location.href = '../index.html';
        return false;
    }
    return true;
}

// Get API key from localStorage
function getApiKey() {
    try {
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            return user.api_key || null;
        }
    } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
    }
    return null;
}

// Get CSRF token from localStorage
function getCsrfToken() {
    try {
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            return user.csrf_token || null;
        }
    } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
    }
    return null;
}

// API request helper
async function makeApiRequest(endpoint, options = {}) {
    const apiKey = getApiKey();
    const csrfToken = getCsrfToken();

    if (!apiKey) {
        throw new Error('API key not found. Please sign in again.');
    }

    if (!csrfToken) {
        throw new Error('CSRF token not found. Please sign in again.');
    }

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'X-CSRF-Token': csrfToken,
        },
    };

    const config = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    };

    // If body is provided and it's an object, stringify it
    if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        if (response.status === 401) {
            localStorage.removeItem('user');
            window.location.href = '../index.html';
            return;
        }

        if (response.status === 429) {
            throw new Error('Rate limit exceeded. Please try again later.');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Network error: Unable to connect to server');
        }
        throw error;
    }
}

// Load guests from backend
async function loadGuests() {
    try {
        showLoadingState('Loading guests...');
        
        // Build query parameters
        const params = new URLSearchParams();
        params.append('page', currentPage);
        params.append('limit', recordsPerPage);
        
        if (searchInput && searchInput.value) {
            params.append('search', searchInput.value);
        }
        
        const data = await makeApiRequest(`${ENDPOINT_URL}?${params.toString()}`);
        
        if (data && data.success) {
            allGuests = data.data || [];
            filteredGuests = [...allGuests];
            
            updateStats();
            renderTable(data.pagination);
        } else {
            throw new Error('Failed to load guests data');
        }
    } catch (error) {
        console.error('Error loading guests:', error);
        showError('Failed to load guests: ' + error.message);
        
        // Show empty state
        allGuests = [];
        filteredGuests = [];
        updateStats();
        renderTable();
    } finally {
        hideLoadingState();
    }
}

// Filter guests based on filters
function filterGuests() {
    currentPage = 1;
    loadGuests();
}

// Get ranking badge based on rank number
function getRankingBadge(rank) {
  switch (rank) {
    case 1:
      return `<span class="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-500 text-white">🥇 Gold</span>`;
    case 2:
      return `<span class="px-2 py-1 rounded-full text-xs font-semibold bg-gray-400 text-white">🥈 Silver</span>`;
    case 3:
      return `<span class="px-2 py-1 rounded-full text-xs font-semibold bg-orange-600 text-white">🥉 Bronze</span>`;
    default:
      return `<span class="px-2 py-1 rounded-full text-xs font-semibold bg-gray-500 text-white">Unranked</span>`;
  }
}

// Format currency for display
function formatCurrency(amount) {
    return `₱${parseFloat(amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (e) {
        return dateString;
    }
}

// Get initials from name
function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

// Render the table with current data
function renderTable(paginationData = null) {
    if (!guestsTableBody) {
        console.error('Table body element not found');
        return;
    }
    
    // Clear table body
    guestsTableBody.innerHTML = '';
    
    // Check if there are guests to display
    if (!filteredGuests || filteredGuests.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="8" class="text-center py-8 text-gray-500">
                <i class="fas fa-users-slash text-4xl mb-4 block"></i>
                No guests found
            </td>
        `;
        guestsTableBody.appendChild(row);
        
        // Update showing records info
        updateShowingInfo(0, paginationData);
        return;
    }
    
    // Populate table rows
    filteredGuests.forEach((guest, index) => {
        const row = document.createElement('tr');
        const firstName = guest.first_name || '';
        const lastName = guest.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim() || 'Unknown Guest';
        const email = guest.email_address || 'No email';
        const phone = guest.phone_number || 'No phone';
        const visits = guest.total_visits || 0;
        const lastVisit = guest.last_visit || guest.created_at;
        const totalSpent = guest.total_spent || 0;
        const rank = guest.rank || 0;
        
        row.innerHTML = `
            <td class="font-medium">${getRankingBadge(rank)}</td>
            <td>
                <div class="flex items-center">
                    <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                        <span class="text-white font-semibold text-sm">${getInitials(fullName)}</span>
                    </div>
                    <div>
                        <div class="font-medium">${fullName}</div>
                        <div class="text-xs text-gray-500">${visits >= 10 ? 'VIP' : visits >= 5 ? 'Regular' : 'New'} Guest</div>
                    </div>
                </div>
            </td>
            <td>${email}</td>
            <td>${phone}</td>
            <td>
                <span class="visits-count">
                    <i class="fas fa-calendar-day mr-1"></i> ${visits}
                </span>
            </td>
            <td>${formatDate(lastVisit)}</td>
            <td class="font-semibold">${formatCurrency(totalSpent)}</td>
            <td>
                <div class="action-buttons">
                    <button class="view-details btn-primary text-sm" data-guest='${JSON.stringify(guest).replace(/'/g, "&apos;")}'>
                        <i class="fas fa-eye mr-1"></i> View
                    </button>
                    <button class="send-msg btn-secondary text-sm" data-email="${email}">
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
            const guestData = JSON.parse(this.getAttribute('data-guest'));
            showGuestDetails(guestData);
        });
    });
    
    document.querySelectorAll('.send-msg').forEach(button => {
        button.addEventListener('click', function() {
            const email = this.getAttribute('data-email');
            showMessageModal(email);
        });
    });
    
    // Update showing info and pagination
    updateShowingInfo(filteredGuests.length, paginationData);
    renderPagination(paginationData);
    
    // Reinitialize AOS for new elements
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
}

// Update showing records info
function updateShowingInfo(currentItemsCount, paginationData) {
    if (!paginationData) {
        if (showingFrom) showingFrom.textContent = currentItemsCount > 0 ? '1' : '0';
        if (showingTo) showingTo.textContent = currentItemsCount;
        if (totalRecords) totalRecords.textContent = currentItemsCount;
        return;
    }
    
    const startIndex = (paginationData.current_page - 1) * paginationData.per_page + 1;
    const endIndex = Math.min(startIndex + currentItemsCount - 1, paginationData.total_items);
    
    if (showingFrom) showingFrom.textContent = startIndex;
    if (showingTo) showingTo.textContent = endIndex;
    if (totalRecords) totalRecords.textContent = paginationData.total_items;
}

// Render pagination controls
function renderPagination(paginationData) {
    if (!pagination) return;
    
    pagination.innerHTML = '';
    
    if (!paginationData || paginationData.total_pages <= 1) {
        return;
    }
    
    // Previous button
    const prevButton = document.createElement('button');
    prevButton.className = `page-btn ${!paginationData.has_prev ? 'disabled' : ''}`;
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.disabled = !paginationData.has_prev;
    prevButton.addEventListener('click', () => {
        if (paginationData.has_prev) {
            currentPage = paginationData.current_page - 1;
            loadGuests();
        }
    });
    pagination.appendChild(prevButton);
    
    // Page buttons
    for (let i = 1; i <= paginationData.total_pages; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `page-btn ${i === paginationData.current_page ? 'active' : ''}`;
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            currentPage = i;
            loadGuests();
        });
        pagination.appendChild(pageButton);
    }
    
    // Next button
    const nextButton = document.createElement('button');
    nextButton.className = `page-btn ${!paginationData.has_next ? 'disabled' : ''}`;
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.disabled = !paginationData.has_next;
    nextButton.addEventListener('click', () => {
        if (paginationData.has_next) {
            currentPage = paginationData.current_page + 1;
            loadGuests();
        }
    });
    pagination.appendChild(nextButton);
}

// Show guest details in modal
function showGuestDetails(guest) {
    const firstName = guest.first_name || '';
    const lastName = guest.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim() || 'Unknown Guest';
    const email = guest.email_address || 'No email';
    const phone = guest.phone_number || 'No phone';
    const visits = guest.total_visits || 0;
    const rank = guest.rank || 0;
    const lastVisit = guest.last_visit || guest.created_at;
    const totalSpent = guest.total_spent || 0;
    const address = guest.address || 'No address provided';
    const joinDate = guest.created_at || 'Unknown';
    
    if (guestDetails) {
        guestDetails.innerHTML = `
            <div class="flex items-center gap-4 mb-6">
                <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                    <span class="text-white font-semibold text-xl">${getInitials(fullName)}</span>
                </div>
                <div>
                    <h3 class="text-xl font-bold">${fullName}</h3>
                    <p class="text-gray-600">${visits >= 10 ? 'VIP Guest' : visits >= 5 ? 'Regular Guest' : 'New Guest'}</p>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <h4 class="font-semibold text-gray-700 mb-2">Contact Information</h4>
                    <p class="mb-2"><strong>Email:</strong> ${email}</p>
                    <p class="mb-2"><strong>Phone:</strong> ${phone}</p>
                    <p class="mb-2"><strong>Address:</strong> ${address}</p>
                    <p><strong>Member Since:</strong> ${formatDate(joinDate)}</p>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-700 mb-2">Guest Statistics</h4>
                    <p class="mb-2"><strong>Total Visits:</strong> ${visits}</p>
                    <p class="mb-2"><strong>Last Visit:</strong> ${formatDate(lastVisit)}</p>
                    <p class="mb-2"><strong>Total Spent:</strong> ${formatCurrency(totalSpent)}</p>
                    <p><strong>Status:</strong> ${getRankingBadge(rank)}</p>
                </div>
            </div>
            
            <div class="flex justify-end gap-4 mt-8">
                <button class="send-msg-modal btn-primary" data-email="${email}">
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
                const email = this.getAttribute('data-email');
                showMessageModal(email);
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

// Show message modal
function showMessageModal(email) {
    // Simple implementation - in a real app, you'd have a proper messaging system
    const message = prompt(`Enter message to send to ${email}:`, "Dear guest, thank you for choosing BatoSpring Resort!");
    if (message) {
        showSuccess(`Message sent to ${email}`);
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
    const vip = filteredGuests.filter(g => (g.total_visits || 0) >= 10).length;
    
    // Calculate current guests as those who visited in the last 30 days
    const current = filteredGuests.filter(g => {
        if (!g.last_visit) return false;
        try {
            const lastVisit = new Date(g.last_visit);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return lastVisit >= thirtyDaysAgo;
        } catch (e) {
            return false;
        }
    }).length;
    
    const avgVisits = filteredGuests.length > 0 ? 
        (filteredGuests.reduce((sum, guest) => sum + (guest.total_visits || 0), 0) / filteredGuests.length).toFixed(1) : 0;
    
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

// Export guests to CSV
function exportGuests() {
    try {
        const headers = ['Name', 'Email', 'Phone', 'Visits', 'Last Visit', 'Total Spent', 'Status'];
        const csvContent = [
            headers.join(','),
            ...filteredGuests.map(guest => {
                const firstName = guest.first_name || '';
                const lastName = guest.last_name || '';
                const fullName = `${firstName} ${lastName}`.trim();
                const visits = guest.total_visits || 0;
                const status = visits >= 10 ? 'VIP' : visits >= 5 ? 'Regular' : 'New';
                
                return [
                    `"${fullName}"`,
                    `"${guest.email_address || ''}"`,
                    `"${guest.phone_number || ''}"`,
                    visits,
                    guest.last_visit || '',
                    guest.total_spent || 0,
                    status
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
        
        showSuccess('Guests exported successfully!');
    } catch (error) {
        console.error('Error exporting guests:', error);
        showError('Failed to export guests');
    }
}

// UI Helper Functions
function showLoadingState(message = 'Loading...') {
}

function hideLoadingState() {
    // Hide loading indicator
}

// SweetAlert 2 functions
function showSuccess(message) {
    Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
    });
}

function showError(message) {
    Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: message,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
    });
}