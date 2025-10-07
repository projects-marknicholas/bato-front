// Initialize AOS
AOS.init({
    duration: 800,
    easing: "ease-in-out",
    once: true,
});

// API Configuration
const API_BASE_URL = window.CONFIG.API_BASE_URL;
const ENDPOINT_URL = window.CONFIG.ENDPOINTS.ADMIN_BOOKINGS;

// Global variables
let currentPage = 1;
const recordsPerPage = 10;
let allBookings = [];
let filteredBookings = [];

// DOM Elements
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const resourceFilter = document.getElementById('resourceFilter');
const dateFilter = document.getElementById('dateFilter');
const bookingsTableBody = document.getElementById('bookingsTableBody');
const pagination = document.getElementById('pagination');
const showingFrom = document.getElementById('showingFrom');
const showingTo = document.getElementById('showingTo');
const totalRecords = document.getElementById('totalRecords');
const bookingModal = document.getElementById('bookingModal');
const closeModal = document.getElementById('closeModal');
const bookingDetails = document.getElementById('bookingDetails');
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
        searchInput.addEventListener('input', filterBookings);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', filterBookings);
    }
    if (resourceFilter) {
        resourceFilter.addEventListener('change', filterBookings);
    }
    if (dateFilter) {
        dateFilter.addEventListener('change', filterBookings);
    }
    
    // Modal
    if (closeModal) {
        closeModal.addEventListener('click', closeBookingModal);
    }
    
    // Export button
    if (exportBtn) {
        exportBtn.addEventListener('click', exportBookings);
    }
    
    // Close modal when clicking outside
    if (bookingModal) {
        bookingModal.addEventListener('click', function(e) {
            if (e.target === bookingModal) {
                closeBookingModal();
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
        await loadBookings();
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showError('Failed to load bookings data');
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

// Load bookings from backend
async function loadBookings() {
    try {
        showLoadingState('Loading bookings...');
        
        // Build query parameters
        const params = new URLSearchParams();
        params.append('page', currentPage);
        params.append('limit', recordsPerPage);
        
        if (searchInput && searchInput.value) {
            params.append('search', searchInput.value);
        }
        
        if (statusFilter && statusFilter.value !== 'all') {
            params.append('status', statusFilter.value);
        }
        
        const data = await makeApiRequest(`${ENDPOINT_URL}?${params.toString()}`);
        
        if (data && data.success) {
            allBookings = data.data || [];
            filteredBookings = [...allBookings];
            
            updateStats();
            renderTable(data.pagination);
        } else {
            throw new Error('Failed to load bookings data');
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
        showError('Failed to load bookings: ' + error.message);
        
        // Show empty state
        allBookings = [];
        filteredBookings = [];
        updateStats();
        renderTable();
    } finally {
        hideLoadingState();
    }
}

// Filter bookings based on filters
function filterBookings() {
    currentPage = 1;
    loadBookings();
}

// Format currency for display
function formatCurrency(amount) {
    if (!amount || amount === 0) return '₱0.00';
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

// Format datetime for display (time only)
function formatTime(dateString) {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return dateString;
    }
}

// Get initials from name
function getInitials(firstName, lastName) {
    if (!firstName && !lastName) return '?';
    return ((firstName?.[0] || '') + (lastName?.[0] || '')).toUpperCase();
}

// Calculate duration in days
function calculateDuration(checkIn, checkOut) {
    if (!checkIn || !checkOut) return 0;
    try {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (e) {
        return 0;
    }
}

// Render the table with current data
function renderTable(paginationData = null) {
    if (!bookingsTableBody) {
        console.error('Table body element not found');
        return;
    }
    
    // Clear table body
    bookingsTableBody.innerHTML = '';
    
    // Check if there are bookings to display
    if (!filteredBookings || filteredBookings.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="9" class="text-center py-8 text-gray-500">
                <i class="fas fa-calendar-times text-4xl mb-4 block"></i>
                No bookings found
            </td>
        `;
        bookingsTableBody.appendChild(row);
        
        // Update showing records info
        updateShowingInfo(0, paginationData);
        return;
    }
    
    // Populate table rows
    filteredBookings.forEach((booking, index) => {
        const row = document.createElement('tr');
        row.setAttribute('data-aos', 'fade-up');
        row.setAttribute('data-aos-delay', (index % 10) * 50);
        
        // Generate a temporary booking ID if not provided by API
        const bookingId = booking.booking_id || `temp_${index}`;
        const firstName = booking.first_name || '';
        const lastName = booking.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim() || 'Unknown Guest';
        const resourceName = booking.resource_name || 'Unknown Resource';
        const checkIn = booking.check_in;
        const checkOut = booking.check_out;
        const guests = booking.guests || 0;
        const status = booking.status || 'pending';
        const paymentStatus = booking.payment_status || 'pending';
        const amount = booking.amount || 0;
        const duration = calculateDuration(checkIn, checkOut);
        
        row.innerHTML = `
            <td>
                <div class="flex items-center">
                    <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                        <span class="text-white font-semibold text-sm">${getInitials(firstName, lastName)}</span>
                    </div>
                    <div>
                        <div class="font-medium">${fullName}</div>
                        <div class="text-xs text-gray-500">${guests} guest${guests !== 1 ? 's' : ''}</div>
                    </div>
                </div>
            </td>
            <td>${resourceName}</td>
            <td>
                <div>${formatDate(checkIn)}</div>
                <div class="text-xs text-gray-500">${formatTime(checkIn)}</div>
            </td>
            <td>
                <div>${formatDate(checkOut)}</div>
                <div class="text-xs text-gray-500">${formatTime(checkOut)}</div>
            </td>
            <td class="font-semibold">
                ${formatCurrency(amount)}
            </td>
            <td>
                <span class="status-badge status-${status}">${status}</span>
                ${paymentStatus === 'paid' ? 
                    '<div class="text-xs text-green-600 mt-1">Paid</div>' : 
                    '<div class="text-xs text-yellow-600 mt-1">Pending</div>'
                }
            </td>
            <td>
                <div class="action-buttons">
                    <button class="view-details btn-primary text-sm" data-booking='${JSON.stringify(booking).replace(/'/g, "&apos;")}'>
                        <i class="fas fa-eye mr-1"></i> View
                    </button>
                    ${status === 'pending' ? `
                        <button class="confirm-booking btn-secondary text-sm" data-booking='${JSON.stringify({...booking, booking_id: bookingId}).replace(/'/g, "&apos;")}'>
                            <i class="fas fa-check mr-1"></i> Accept
                        </button>
                        <button class="reject-booking btn-danger text-sm" data-booking='${JSON.stringify({...booking, booking_id: bookingId}).replace(/'/g, "&apos;")}'>
                            <i class="fas fa-times mr-1"></i> Reject
                        </button>
                    ` : ''}
                </div>
            </td>
        `;
        bookingsTableBody.appendChild(row);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.view-details').forEach(button => {
        button.addEventListener('click', function() {
            const bookingData = JSON.parse(this.getAttribute('data-booking'));
            showBookingDetails(bookingData);
        });
    });
    
    document.querySelectorAll('.confirm-booking').forEach(button => {
        button.addEventListener('click', function() {
            const bookingData = JSON.parse(this.getAttribute('data-booking'));
            updateBookingStatus(bookingData, 'confirmed');
        });
    });
    
    document.querySelectorAll('.reject-booking').forEach(button => {
        button.addEventListener('click', function() {
            const bookingData = JSON.parse(this.getAttribute('data-booking'));
            updateBookingStatus(bookingData, 'cancelled');
        });
    });
    
    document.querySelectorAll('.complete-booking').forEach(button => {
        button.addEventListener('click', function() {
            const bookingData = JSON.parse(this.getAttribute('data-booking'));
            updateBookingStatus(bookingData, 'completed');
        });
    });
    
    // Update showing info and pagination
    updateShowingInfo(filteredBookings.length, paginationData);
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
            loadBookings();
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
            loadBookings();
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
            loadBookings();
        }
    });
    pagination.appendChild(nextButton);
}

// Show booking details in modal
function showBookingDetails(booking) {
    const bookingId = booking.booking_id || 'Unknown';
    const firstName = booking.first_name || '';
    const lastName = booking.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim() || 'Unknown Guest';
    const resourceName = booking.resource_name || 'Unknown Resource';
    const checkIn = booking.check_in;
    const checkOut = booking.check_out;
    const guests = booking.guests || 0;
    const status = booking.status || 'pending';
    const paymentStatus = booking.payment_status || 'pending';
    const amount = booking.amount || 0;
    const specialRequest = booking.special_request || 'No special requests';
    const duration = calculateDuration(checkIn, checkOut);
    const bookingDate = booking.created_at || 'Unknown';
    
    if (bookingDetails) {
        bookingDetails.innerHTML = `
            <div class="flex items-center gap-4 mb-6">
                <div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                    <span class="text-white font-semibold text-xl">${getInitials(firstName, lastName)}</span>
                </div>
                <div>
                    <h3 class="text-xl font-bold">${fullName}</h3>
                    <p class="text-gray-600">${guests} guest${guests !== 1 ? 's' : ''} • ${duration} night${duration !== 1 ? 's' : ''}</p>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <h4 class="font-semibold text-gray-700 mb-2">Booking Information</h4>
                    <p class="mb-2"><strong>Booking ID:</strong> ${bookingId}</p>
                    <p class="mb-2"><strong>Resource:</strong> ${resourceName}</p>
                    <p class="mb-2"><strong>Check-in:</strong> ${formatDate(checkIn)} at ${formatTime(checkIn)}</p>
                    <p class="mb-2"><strong>Check-out:</strong> ${formatDate(checkOut)} at ${formatTime(checkOut)}</p>
                    <p class="mb-2"><strong>Duration:</strong> ${duration} night${duration !== 1 ? 's' : ''}</p>
                    <p><strong>Booking Date:</strong> ${formatDate(bookingDate)}</p>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-700 mb-2">Status & Payment</h4>
                    <p class="mb-2"><strong>Status:</strong> <span class="status-badge status-${status}">${status}</span></p>
                    <p class="mb-2"><strong>Payment Status:</strong> ${paymentStatus === 'paid' ? '<span class="text-green-600 font-semibold">Paid</span>' : '<span class="text-yellow-600 font-semibold">Pending</span>'}</p>
                    <p class="mb-2"><strong>Number of Guests:</strong> ${guests}</p>
                    <p><strong>Total Amount:</strong> <span class="font-bold text-lg">${formatCurrency(amount)}</span></p>
                </div>
            </div>
            
            <div class="mb-6">
                <h4 class="font-semibold text-gray-700 mb-2">Special Requests</h4>
                <p class="text-gray-700 bg-gray-50 p-3 rounded-lg">${specialRequest}</p>
            </div>
            
            <div class="flex justify-end gap-4 mt-8">
                ${status === 'pending' ? `
                    <button class="confirm-booking-modal btn-primary" data-booking='${JSON.stringify({...booking, booking_id: bookingId}).replace(/'/g, "&apos;")}'>
                        <i class="fas fa-check mr-2"></i> Accept Booking
                    </button>
                    <button class="reject-booking-modal btn-danger" data-booking='${JSON.stringify({...booking, booking_id: bookingId}).replace(/'/g, "&apos;")}'>
                        <i class="fas fa-times mr-2"></i> Reject Booking
                    </button>
                ` : ''}
                ${status === 'confirmed' ? `
                    <button class="complete-booking-modal btn-secondary" data-booking='${JSON.stringify({...booking, booking_id: bookingId}).replace(/'/g, "&apos;")}'>
                        <i class="fas fa-flag-checkered mr-2"></i> Mark Complete
                    </button>
                ` : ''}
                <button class="close-modal-btn btn-secondary">
                    Close
                </button>
            </div>
        `;
        
        // Add event listeners to modal buttons
        const confirmBtn = bookingDetails.querySelector('.confirm-booking-modal');
        const rejectBtn = bookingDetails.querySelector('.reject-booking-modal');
        const completeBtn = bookingDetails.querySelector('.complete-booking-modal');
        const closeBtn = bookingDetails.querySelector('.close-modal-btn');
        
        if (confirmBtn) {
            confirmBtn.addEventListener('click', function() {
                const bookingData = JSON.parse(this.getAttribute('data-booking'));
                updateBookingStatus(bookingData, 'confirmed');
                closeBookingModal();
            });
        }
        
        if (rejectBtn) {
            rejectBtn.addEventListener('click', function() {
                const bookingData = JSON.parse(this.getAttribute('data-booking'));
                updateBookingStatus(bookingData, 'cancelled');
                closeBookingModal();
            });
        }
        
        if (completeBtn) {
            completeBtn.addEventListener('click', function() {
                const bookingData = JSON.parse(this.getAttribute('data-booking'));
                updateBookingStatus(bookingData, 'completed');
                closeBookingModal();
            });
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', closeBookingModal);
        }
    }
    
    // Show modal
    if (bookingModal) {
        bookingModal.classList.add('active');
    }
}

// Close booking modal
function closeBookingModal() {
    if (bookingModal) {
        bookingModal.classList.remove('active');
    }
}

// Update booking status
async function updateBookingStatus(booking, newStatus) {
    try {
        const bookingId = booking.booking_id;
        
        if (!bookingId) {
            showError('Cannot update booking: Booking ID not found');
            return;
        }

        // Map frontend status to backend status
        let backendStatus = newStatus;
        let paymentStatus = booking.payment_status;
        
        // Handle "completed" status (convert to "confirmed" for backend)
        if (newStatus === 'completed') {
            backendStatus = 'confirmed';
        }
        
        // Auto-update payment status when confirming
        if (newStatus === 'confirmed') {
            paymentStatus = 'paid';
        }

        const updateData = {
            booking_id: bookingId,
            status: backendStatus,
            payment_status: paymentStatus
        };
        
        const response = await makeApiRequest(ENDPOINT_URL, {
            method: 'PUT',
            body: updateData
        });

        if (response && response.success) {
            showSuccess(`Booking ${bookingId} status updated to ${newStatus}`);
            await loadBookings(); // Reload bookings to reflect changes
        } else {
            throw new Error(response?.error || 'Failed to update booking');
        }
        
    } catch (error) {
        console.error('Error updating booking status:', error);
        showError('Failed to update booking status: ' + error.message);
    }
}

// Update stats cards
function updateStats() {
    const total = filteredBookings.length;
    const pending = filteredBookings.filter(b => b.status === 'pending').length;
    const confirmed = filteredBookings.filter(b => b.status === 'confirmed').length;
    const cancelled = filteredBookings.filter(b => b.status === 'cancelled').length;
    
    if (document.getElementById('totalBookings')) {
        document.getElementById('totalBookings').textContent = total;
    }
    if (document.getElementById('pendingBookings')) {
        document.getElementById('pendingBookings').textContent = pending;
    }
    if (document.getElementById('confirmedBookings')) {
        document.getElementById('confirmedBookings').textContent = confirmed;
    }
    if (document.getElementById('cancelledBookings')) {
        document.getElementById('cancelledBookings').textContent = cancelled;
    }
}

// Export bookings to CSV
function exportBookings() {
    try {
        const headers = ['Booking ID', 'Guest Name', 'Resource', 'Check-in', 'Check-out', 'Guests', 'Amount', 'Status', 'Payment Status', 'Special Requests'];
        const csvContent = [
            headers.join(','),
            ...filteredBookings.map(booking => {
                const firstName = booking.first_name || '';
                const lastName = booking.last_name || '';
                const fullName = `${firstName} ${lastName}`.trim();
                const bookingId = booking.booking_id || 'Unknown';
                
                return [
                    `"${bookingId}"`,
                    `"${fullName}"`,
                    `"${booking.resource_name || ''}"`,
                    booking.check_in || '',
                    booking.check_out || '',
                    booking.guests || 0,
                    booking.amount || 0,
                    booking.status || '',
                    booking.payment_status || '',
                    `"${(booking.special_request || '').replace(/"/g, '""')}"`
                ].join(',');
            })
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `batospring-bookings-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showSuccess('Bookings exported successfully!');
    } catch (error) {
        console.error('Error exporting bookings:', error);
        showError('Failed to export bookings');
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