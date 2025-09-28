// Initialize AOS
AOS.init({
    duration: 800,
    easing: "ease-in-out",
    once: true,
});

// Sample bookings data
const bookingsData = [
    {
        id: "BK001",
        guestName: "Maria Santos",
        guestEmail: "maria.santos@email.com",
        guestPhone: "+63 912 345 6789",
        resource: "Deluxe Room",
        resourceType: "room",
        checkIn: "2024-01-15",
        checkOut: "2024-01-18",
        guests: 2,
        amount: 7500,
        status: "pending",
        specialRequests: "I would like a room with a view of the pool.",
        bookingDate: "2024-01-10",
        paymentStatus: "pending"
    },
    {
        id: "BK002",
        guestName: "Juan Dela Cruz",
        guestEmail: "juan.delacruz@email.com",
        guestPhone: "+63 917 654 3210",
        resource: "Family Cottage",
        resourceType: "cottage",
        checkIn: "2024-01-20",
        checkOut: "2024-01-22",
        guests: 4,
        amount: 12000,
        status: "confirmed",
        specialRequests: "We need an extra bed for our child.",
        bookingDate: "2024-01-12",
        paymentStatus: "paid"
    },
    {
        id: "BK003",
        guestName: "Ana Rodriguez",
        guestEmail: "ana.rodriguez@email.com",
        guestPhone: "+63 918 765 4321",
        resource: "Bamboo Hut",
        resourceType: "hut",
        checkIn: "2024-01-25",
        checkOut: "2024-01-27",
        guests: 2,
        amount: 5400,
        status: "completed",
        specialRequests: "We are celebrating our anniversary.",
        bookingDate: "2024-01-05",
        paymentStatus: "paid"
    },
    {
        id: "BK004",
        guestName: "Carlos Mendoza",
        guestEmail: "carlos.mendoza@email.com",
        guestPhone: "+63 919 876 5432",
        resource: "Pool Villa",
        resourceType: "villa",
        checkIn: "2024-02-01",
        checkOut: "2024-02-05",
        guests: 6,
        amount: 25000,
        status: "pending",
        specialRequests: "We need early check-in if possible.",
        bookingDate: "2024-01-14",
        paymentStatus: "pending"
    },
    {
        id: "BK005",
        guestName: "Lisa Garcia",
        guestEmail: "lisa.garcia@email.com",
        guestPhone: "+63 920 987 6543",
        resource: "Deluxe Room",
        resourceType: "room",
        checkIn: "2024-01-18",
        checkOut: "2024-01-20",
        guests: 2,
        amount: 5000,
        status: "cancelled",
        specialRequests: "None",
        bookingDate: "2024-01-08",
        paymentStatus: "refunded"
    },
    {
        id: "BK006",
        guestName: "Roberto Silva",
        guestEmail: "roberto.silva@email.com",
        guestPhone: "+63 921 098 7654",
        resource: "Family Cottage",
        resourceType: "cottage",
        checkIn: "2024-02-10",
        checkOut: "2024-02-12",
        guests: 5,
        amount: 15000,
        status: "confirmed",
        specialRequests: "We have a baby, need a crib.",
        bookingDate: "2024-01-13",
        paymentStatus: "paid"
    },
    {
        id: "BK007",
        guestName: "Elena Reyes",
        guestEmail: "elena.reyes@email.com",
        guestPhone: "+63 922 109 8765",
        resource: "Bamboo Hut",
        resourceType: "hut",
        checkIn: "2024-01-22",
        checkOut: "2024-01-24",
        guests: 2,
        amount: 5400,
        status: "completed",
        specialRequests: "Vegetarian meals please.",
        bookingDate: "2024-01-09",
        paymentStatus: "paid"
    },
    {
        id: "BK008",
        guestName: "Miguel Torres",
        guestEmail: "miguel.torres@email.com",
        guestPhone: "+63 923 210 9876",
        resource: "Pool Villa",
        resourceType: "villa",
        checkIn: "2024-02-15",
        checkOut: "2024-02-20",
        guests: 8,
        amount: 37500,
        status: "pending",
        specialRequests: "We are a large family with children.",
        bookingDate: "2024-01-15",
        paymentStatus: "pending"
    },
    {
        id: "BK009",
        guestName: "Sofia Hernandez",
        guestEmail: "sofia.hernandez@email.com",
        guestPhone: "+63 924 321 0987",
        resource: "Deluxe Room",
        resourceType: "room",
        checkIn: "2024-01-28",
        checkOut: "2024-01-30",
        guests: 2,
        amount: 5000,
        status: "confirmed",
        specialRequests: "Honeymoon suite if available.",
        bookingDate: "2024-01-11",
        paymentStatus: "paid"
    },
    {
        id: "BK010",
        guestName: "David Lim",
        guestEmail: "david.lim@email.com",
        guestPhone: "+63 925 432 1098",
        resource: "Family Cottage",
        resourceType: "cottage",
        checkIn: "2024-02-05",
        checkOut: "2024-02-07",
        guests: 4,
        amount: 12000,
        status: "pending",
        specialRequests: "We will arrive late, around 10 PM.",
        bookingDate: "2024-01-16",
        paymentStatus: "pending"
    }
];

// Global variables
let currentPage = 1;
const recordsPerPage = 5;
let filteredBookings = [...bookingsData];

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
    updateStats();
    renderTable();
    setupEventListeners();
});

// Set up event listeners
function setupEventListeners() {
    // Sidebar toggle
    sidebarToggle.addEventListener('click', toggleSidebar);
    sidebarOverlay.addEventListener('click', toggleSidebar);
    
    // Filters
    searchInput.addEventListener('input', filterBookings);
    statusFilter.addEventListener('change', filterBookings);
    resourceFilter.addEventListener('change', filterBookings);
    dateFilter.addEventListener('change', filterBookings);
    
    // Modal
    closeModal.addEventListener('click', closeBookingModal);
    
    // Export button
    exportBtn.addEventListener('click', exportBookings);
    
    // Close modal when clicking outside
    bookingModal.addEventListener('click', function(e) {
        if (e.target === bookingModal) {
            closeBookingModal();
        }
    });
}

// Toggle sidebar on mobile
function toggleSidebar() {
    sidebar.classList.toggle('-translate-x-full');
    sidebarOverlay.classList.toggle('active');
}

// Filter bookings based on filters
function filterBookings() {
    const searchTerm = searchInput.value.toLowerCase();
    const status = statusFilter.value;
    const resource = resourceFilter.value;
    const date = dateFilter.value;
    
    filteredBookings = bookingsData.filter(booking => {
        // Search filter
        const matchesSearch = 
            booking.id.toLowerCase().includes(searchTerm) ||
            booking.guestName.toLowerCase().includes(searchTerm) ||
            booking.resource.toLowerCase().includes(searchTerm);
        
        // Status filter
        const matchesStatus = status === 'all' || booking.status === status;
        
        // Resource filter
        const matchesResource = resource === 'all' || 
            booking.resource.toLowerCase().replace(' ', '-') === resource;
        
        // Date filter
        let matchesDate = true;
        if (date) {
            matchesDate = booking.checkIn === date || booking.checkOut === date;
        }
        
        return matchesSearch && matchesStatus && matchesResource && matchesDate;
    });
    
    currentPage = 1;
    renderTable();
    updateStats();
}

// Render the table with current data
function renderTable() {
    // Calculate pagination
    const totalPages = Math.ceil(filteredBookings.length / recordsPerPage);
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = Math.min(startIndex + recordsPerPage, filteredBookings.length);
    const currentBookings = filteredBookings.slice(startIndex, endIndex);
    
    // Update showing records info
    showingFrom.textContent = filteredBookings.length > 0 ? startIndex + 1 : 0;
    showingTo.textContent = endIndex;
    totalRecords.textContent = filteredBookings.length;
    
    // Clear table body
    bookingsTableBody.innerHTML = '';
    
    // Populate table rows with AOS animations
    currentBookings.forEach((booking, index) => {
        const row = document.createElement('tr');
        row.setAttribute('data-aos', 'fade-up');
        row.setAttribute('data-aos-delay', (index % 5) * 100);
        
        row.innerHTML = `
            <td class="font-medium">${booking.id}</td>
            <td>${booking.guestName}</td>
            <td>${booking.resource}</td>
            <td>${formatDate(booking.checkIn)}</td>
            <td>${formatDate(booking.checkOut)}</td>
            <td>${booking.guests}</td>
            <td class="font-semibold">₱${booking.amount.toLocaleString()}</td>
            <td><span class="status-badge status-${booking.status}">${booking.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="view-details btn-primary text-sm" data-id="${booking.id}">
                        <i class="fas fa-eye mr-1"></i> View
                    </button>
                    ${booking.status === 'pending' ? `
                        <button class="confirm-booking btn-secondary text-sm" data-id="${booking.id}">
                            <i class="fas fa-check mr-1"></i> Accept
                        </button>
                        <button class="reject-booking btn-danger text-sm" data-id="${booking.id}">
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
            const bookingId = this.getAttribute('data-id');
            showBookingDetails(bookingId);
        });
    });
    
    document.querySelectorAll('.confirm-booking').forEach(button => {
        button.addEventListener('click', function() {
            const bookingId = this.getAttribute('data-id');
            updateBookingStatus(bookingId, 'confirmed');
        });
    });
    
    document.querySelectorAll('.reject-booking').forEach(button => {
        button.addEventListener('click', function() {
            const bookingId = this.getAttribute('data-id');
            updateBookingStatus(bookingId, 'cancelled');
        });
    });
    
    // Render pagination
    renderPagination(totalPages);
    
    // Reinitialize AOS for new elements
    AOS.refresh();
}

// Render pagination controls
function renderPagination(totalPages) {
    pagination.innerHTML = '';
    
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

// Show booking details in modal
function showBookingDetails(bookingId) {
    const booking = bookingsData.find(b => b.id === bookingId);
    if (!booking) return;
    
    bookingDetails.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
                <h4 class="font-semibold text-gray-700 mb-2">Guest Information</h4>
                <p><strong>Name:</strong> ${booking.guestName}</p>
                <p><strong>Email:</strong> ${booking.guestEmail}</p>
                <p><strong>Phone:</strong> ${booking.guestPhone}</p>
            </div>
            <div>
                <h4 class="font-semibold text-gray-700 mb-2">Booking Information</h4>
                <p><strong>Booking ID:</strong> ${booking.id}</p>
                <p><strong>Booking Date:</strong> ${formatDate(booking.bookingDate)}</p>
                <p><strong>Status:</strong> <span class="status-badge status-${booking.status}">${booking.status}</span></p>
                <p><strong>Payment Status:</strong> ${booking.paymentStatus}</p>
            </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
                <h4 class="font-semibold text-gray-700 mb-2">Reservation Details</h4>
                <p><strong>Resource:</strong> ${booking.resource}</p>
                <p><strong>Check-in:</strong> ${formatDate(booking.checkIn)}</p>
                <p><strong>Check-out:</strong> ${formatDate(booking.checkOut)}</p>
                <p><strong>Number of Guests:</strong> ${booking.guests}</p>
                <p><strong>Total Amount:</strong> ₱${booking.amount.toLocaleString()}</p>
            </div>
            <div>
                <h4 class="font-semibold text-gray-700 mb-2">Special Requests</h4>
                <p>${booking.specialRequests || 'No special requests'}</p>
            </div>
        </div>
        
        <div class="flex justify-end gap-4 mt-8">
            ${booking.status === 'pending' ? `
                <button class="confirm-booking-modal btn-primary" data-id="${booking.id}">
                    <i class="fas fa-check mr-2"></i> Accept Booking
                </button>
                <button class="reject-booking-modal btn-danger" data-id="${booking.id}">
                    <i class="fas fa-times mr-2"></i> Reject Booking
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
    const closeBtn = bookingDetails.querySelector('.close-modal-btn');
    
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            const bookingId = this.getAttribute('data-id');
            updateBookingStatus(bookingId, 'confirmed');
            closeBookingModal();
        });
    }
    
    if (rejectBtn) {
        rejectBtn.addEventListener('click', function() {
            const bookingId = this.getAttribute('data-id');
            updateBookingStatus(bookingId, 'cancelled');
            closeBookingModal();
        });
    }
    
    closeBtn.addEventListener('click', closeBookingModal);
    
    // Show modal
    bookingModal.classList.add('active');
}

// Close booking modal
function closeBookingModal() {
    bookingModal.classList.remove('active');
}

// Update booking status
function updateBookingStatus(bookingId, newStatus) {
    const bookingIndex = bookingsData.findIndex(b => b.id === bookingId);
    if (bookingIndex !== -1) {
        bookingsData[bookingIndex].status = newStatus;
        
        // If confirming, set payment status to paid
        if (newStatus === 'confirmed') {
            bookingsData[bookingIndex].paymentStatus = 'paid';
        }
        
        // If rejecting, set payment status to refunded if it was paid
        if (newStatus === 'cancelled' && bookingsData[bookingIndex].paymentStatus === 'paid') {
            bookingsData[bookingIndex].paymentStatus = 'refunded';
        }
        
        filterBookings();
        
        // Show confirmation message
        alert(`Booking ${bookingId} has been ${newStatus}.`);
    }
}

// Update stats cards
function updateStats() {
    const total = filteredBookings.length;
    const pending = filteredBookings.filter(b => b.status === 'pending').length;
    const confirmed = filteredBookings.filter(b => b.status === 'confirmed').length;
    const cancelled = filteredBookings.filter(b => b.status === 'cancelled').length;
    
    document.getElementById('totalBookings').textContent = total;
    document.getElementById('pendingBookings').textContent = pending;
    document.getElementById('confirmedBookings').textContent = confirmed;
    document.getElementById('cancelledBookings').textContent = cancelled;
}

// Format date for display
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Export bookings to CSV
function exportBookings() {
    // Simple CSV export implementation
    const headers = ['Booking ID', 'Guest Name', 'Resource', 'Check-in', 'Check-out', 'Guests', 'Amount', 'Status'];
    const csvContent = [
        headers.join(','),
        ...filteredBookings.map(booking => [
            booking.id,
            `"${booking.guestName}"`,
            `"${booking.resource}"`,
            booking.checkIn,
            booking.checkOut,
            booking.guests,
            booking.amount,
            booking.status
        ].join(','))
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
    
    alert('Bookings exported successfully!');
}