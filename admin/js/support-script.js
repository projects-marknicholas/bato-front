// Initialize AOS
AOS.init({
    duration: 800,
    easing: "ease-in-out",
    once: true,
});

// Sample inquiries data
const inquiriesData = [
    {
        id: "INQ001",
        name: "John Doe",
        email: "john.doe@example.com",
        subject: "Booking Confirmation Issue",
        message: "I haven't received my booking confirmation email.",
        date: "2025-09-24",
        status: "open",
        response: ""
    },
    {
        id: "INQ002",
        name: "Jane Smith",
        email: "jane.smith@example.com",
        subject: "Pool Availability",
        message: "Is the infinity pool available this weekend?",
        date: "2025-09-23",
        status: "responded",
        response: "The infinity pool is available this weekend. Please book in advance."
    },
    {
        id: "INQ003",
        name: "Mike Johnson",
        email: "mike.j@example.com",
        subject: "Payment Query",
        message: "Can I pay with a credit card on-site?",
        date: "2025-09-22",
        status: "closed",
        response: "Yes, we accept credit card payments on-site."
    },
    {
        id: "INQ004",
        name: "Sarah Williams",
        email: "sarah.w@example.com",
        subject: "Cottage Amenities",
        message: "What amenities are included in the family cottage?",
        date: "2025-09-21",
        status: "open",
        response: ""
    },
    {
        id: "INQ005",
        name: "David Brown",
        email: "david.b@example.com",
        subject: "Cancellation Policy",
        message: "What is your cancellation policy for bookings?",
        date: "2025-09-20",
        status: "responded",
        response: "Cancellations made 7 days before arrival are fully refundable."
    }
];

// Global variables
let currentPage = 1;
const recordsPerPage = 5;
let filteredInquiries = [];
let sortField = 'name';
let sortDirection = 'asc';

// DOM Elements
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const inquiriesTableBody = document.getElementById('inquiriesTableBody');
const pagination = document.getElementById('pagination');
const showingFrom = document.getElementById('showingFrom');
const showingTo = document.getElementById('showingTo');
const totalRecords = document.getElementById('totalRecords');
const inquiryModal = document.getElementById('inquiryModal');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const inquiryForm = document.getElementById('inquiryForm');
const modalTitle = document.getElementById('modalTitle');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize data
    filteredInquiries = [...inquiriesData];
    
    updateStats();
    sortInquiries();
    renderTable();
    setupEventListeners();
    
    console.log('Page initialized with', inquiriesData.length, 'inquiries');
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
        searchInput.addEventListener('input', filterInquiries);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', filterInquiries);
    }
    
    // Sorting
    const sortableHeaders = document.querySelectorAll('th[data-sort]');
    if (sortableHeaders.length > 0) {
        sortableHeaders.forEach(th => {
            th.addEventListener('click', function() {
                const field = this.getAttribute('data-sort');
                sortInquiries(field);
            });
        });
    }
    
    // Modal
    if (closeModal) {
        closeModal.addEventListener('click', closeInquiryModal);
    }
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeInquiryModal);
    }
    
    // Form submission
    if (inquiryForm) {
        inquiryForm.addEventListener('submit', saveResponse);
    }
    
    // Close modal when clicking outside
    if (inquiryModal) {
        inquiryModal.addEventListener('click', function(e) {
            if (e.target === inquiryModal) {
                closeInquiryModal();
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

// Sort inquiries by specified field
function sortInquiries(field = null) {
    if (field) {
        if (sortField === field) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            sortField = field;
            sortDirection = 'asc';
        }
    }
    
    filteredInquiries.sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];
        
        if (sortField === 'name' || sortField === 'email' || sortField === 'subject') {
            aValue = a[sortField].toLowerCase();
            bValue = b[sortField].toLowerCase();
        } else if (sortField === 'date') {
            aValue = new Date(a.date);
            bValue = new Date(b.date);
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
                if (!indicator) {
                    const newIndicator = document.createElement('span');
                    newIndicator.className = 'sort-indicator';
                    th.appendChild(newIndicator);
                }
                th.querySelector('.sort-indicator').textContent = sortDirection === 'asc' ? '↑' : '↓';
            } else {
                if (indicator) indicator.textContent = '';
            }
        });
    }
    
    renderTable();
}

// Filter inquiries based on filters
function filterInquiries() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const status = statusFilter ? statusFilter.value : 'all';
    
    filteredInquiries = inquiriesData.filter(inquiry => {
        // Search filter
        const matchesSearch = 
            inquiry.name.toLowerCase().includes(searchTerm) ||
            inquiry.email.toLowerCase().includes(searchTerm) ||
            inquiry.subject.toLowerCase().includes(searchTerm) ||
            inquiry.message.toLowerCase().includes(searchTerm);
        
        // Status filter
        const matchesStatus = status === 'all' || inquiry.status === status;
        
        return matchesSearch && matchesStatus;
    });
    
    currentPage = 1;
    sortInquiries();
    updateStats();
}

// Get status badge
function getStatusBadge(status) {
    if (status === 'open') {
        return `<span class="status-badge status-open">Open</span>`;
    } else if (status === 'responded') {
        return `<span class="status-badge status-responded">Responded</span>`;
    } else if (status === 'closed') {
        return `<span class="status-badge status-closed">Closed</span>`;
    }
}

// Render the table with current data
function renderTable() {
    if (!inquiriesTableBody) {
        console.error('Table body element not found');
        return;
    }
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredInquiries.length / recordsPerPage);
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = Math.min(startIndex + recordsPerPage, filteredInquiries.length);
    const currentInquiries = filteredInquiries.slice(startIndex, endIndex);
    
    // Update showing records info
    if (showingFrom) showingFrom.textContent = filteredInquiries.length > 0 ? startIndex + 1 : 0;
    if (showingTo) showingTo.textContent = endIndex;
    if (totalRecords) totalRecords.textContent = filteredInquiries.length;
    
    // Clear table body
    inquiriesTableBody.innerHTML = '';
    
    // Check if there are inquiries to display
    if (currentInquiries.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="6" class="text-center py-8 text-gray-500">
                <i class="fas fa-envelope text-4xl mb-4 block"></i>
                No inquiries found matching your criteria
            </td>
        `;
        inquiriesTableBody.appendChild(row);
        return;
    }
    
    // Populate table rows with AOS animations
    currentInquiries.forEach((inquiry, index) => {
        const row = document.createElement('tr');
        row.setAttribute('data-aos', 'fade-up');
        row.setAttribute('data-aos-delay', (index % 10) * 50);
        
        row.innerHTML = `
            <td class="font-medium">${inquiry.name}</td>
            <td>${inquiry.email}</td>
            <td>${inquiry.subject}</td>
            <td>${inquiry.date}</td>
            <td>${getStatusBadge(inquiry.status)}</td>
            <td>
                <div class="action-buttons">
                    <button class="reply-inquiry btn-primary text-sm" data-id="${inquiry.id}">
                        <i class="fas fa-reply mr-1"></i> Reply
                    </button>
                    <button class="delete-inquiry btn-danger text-sm" data-id="${inquiry.id}">
                        <i class="fas fa-trash mr-1"></i> Delete
                    </button>
                </div>
            </td>
        `;
        inquiriesTableBody.appendChild(row);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.reply-inquiry').forEach(button => {
        button.addEventListener('click', function() {
            const inquiryId = this.getAttribute('data-id');
            openReplyInquiryModal(inquiryId);
        });
    });
    
    document.querySelectorAll('.delete-inquiry').forEach(button => {
        button.addEventListener('click', function() {
            const inquiryId = this.getAttribute('data-id');
            deleteInquiry(inquiryId);
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

// Open reply inquiry modal
function openReplyInquiryModal(inquiryId) {
    const inquiry = inquiriesData.find(i => i.id === inquiryId);
    if (!inquiry) return;
    
    if (modalTitle) modalTitle.textContent = 'Reply to Inquiry';
    if (inquiryForm) {
        document.getElementById('inquiryId').value = inquiry.id;
        document.getElementById('customerName').value = inquiry.name;
        document.getElementById('email').value = inquiry.email;
        document.getElementById('subject').value = inquiry.subject;
        document.getElementById('message').value = inquiry.message;
        document.getElementById('response').value = inquiry.response;
        document.getElementById('status').value = inquiry.status;
    }
    
    // Show modal
    if (inquiryModal) inquiryModal.classList.add('active');
}

// Close inquiry modal
function closeInquiryModal() {
    if (inquiryModal) {
        inquiryModal.classList.remove('active');
    }
}

// Save response
function saveResponse(event) {
    event.preventDefault();
    
    // Get form data
    const id = document.getElementById('inquiryId').value;
    const response = document.getElementById('response').value;
    const status = document.getElementById('status').value;
    
    // Update inquiry
    const index = inquiriesData.findIndex(i => i.id === id);
    if (index !== -1) {
        inquiriesData[index].response = response;
        inquiriesData[index].status = status;
        
        // Update UI
        filterInquiries();
        closeInquiryModal();
        
        // Show success message
        alert('Response sent successfully!');
    }
}

// Delete inquiry
function deleteInquiry(inquiryId) {
    if (!confirm('Are you sure you want to delete this inquiry?')) return;
    
    const index = inquiriesData.findIndex(i => i.id === inquiryId);
    if (index !== -1) {
        inquiriesData.splice(index, 1);
        filterInquiries();
        alert('Inquiry deleted successfully!');
    }
}

// Update stats cards
function updateStats() {
    const total = filteredInquiries.length;
    const open = filteredInquiries.filter(i => i.status === 'open').length;
    const responded = filteredInquiries.filter(i => i.status === 'responded').length;
    
    if (document.getElementById('totalInquiries')) {
        document.getElementById('totalInquiries').textContent = total;
    }
    if (document.getElementById('openInquiries')) {
        document.getElementById('openInquiries').textContent = open;
    }
    if (document.getElementById('respondedInquiries')) {
        document.getElementById('respondedInquiries').textContent = responded;
    }
}