// Initialize AOS
AOS.init({
    duration: 800,
    easing: "ease-in-out",
    once: true,
});

// Sample FAQs data
const faqsData = [
    {
        id: "FAQ001",
        question: "How do I make a booking?",
        answer: "You can make a booking through our website by selecting your desired dates and resources. Alternatively, contact our reservation team.",
        category: "booking",
        lastUpdated: "2025-09-20",
        status: "active"
    },
    {
        id: "FAQ002",
        question: "What are the check-in and check-out times?",
        answer: "Check-in time is 2:00 PM and check-out time is 12:00 PM. Early check-in or late check-out may be available upon request.",
        category: "general",
        lastUpdated: "2025-09-15",
        status: "active"
    },
    {
        id: "FAQ003",
        question: "What payment methods do you accept?",
        answer: "We accept credit cards, debit cards, bank transfers, and cash payments at the resort.",
        category: "payment",
        lastUpdated: "2025-09-10",
        status: "pending"
    },
    {
        id: "FAQ004",
        question: "Are pets allowed in the resort?",
        answer: "Unfortunately, pets are not allowed in our facilities to ensure the comfort of all guests.",
        category: "facilities",
        lastUpdated: "2025-09-05",
        status: "active"
    },
    {
        id: "FAQ005",
        question: "What is the cancellation policy?",
        answer: "Cancellations made 7 days before arrival are fully refundable. Within 7 days, 50% refund. No-show is non-refundable.",
        category: "booking",
        lastUpdated: "2025-09-01",
        status: "active"
    },
    {
        id: "FAQ006",
        question: "Do you have WiFi available?",
        answer: "Yes, complimentary WiFi is available throughout the resort premises.",
        category: "facilities",
        lastUpdated: "2025-08-25",
        status: "inactive"
    }
];

// Global variables
let currentPage = 1;
const recordsPerPage = 5;
let filteredFAQs = [];
let sortField = 'question';
let sortDirection = 'asc';

// DOM Elements
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const faqsTableBody = document.getElementById('faqsTableBody');
const pagination = document.getElementById('pagination');
const showingFrom = document.getElementById('showingFrom');
const showingTo = document.getElementById('showingTo');
const totalRecords = document.getElementById('totalRecords');
const faqModal = document.getElementById('faqModal');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const addFAQBtn = document.getElementById('addFAQBtn');
const faqForm = document.getElementById('faqForm');
const modalTitle = document.getElementById('modalTitle');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize data
    filteredFAQs = [...faqsData];
    
    updateStats();
    sortFAQs();
    renderTable();
    setupEventListeners();
    
    console.log('Page initialized with', faqsData.length, 'FAQs');
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
        searchInput.addEventListener('input', filterFAQs);
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterFAQs);
    }
    
    // Sorting
    const sortableHeaders = document.querySelectorAll('th[data-sort]');
    if (sortableHeaders.length > 0) {
        sortableHeaders.forEach(th => {
            th.addEventListener('click', function() {
                const field = this.getAttribute('data-sort');
                sortFAQs(field);
            });
        });
    }
    
    // Modal
    if (closeModal) {
        closeModal.addEventListener('click', closeFAQModal);
    }
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeFAQModal);
    }
    
    // Add FAQ button
    if (addFAQBtn) {
        addFAQBtn.addEventListener('click', openAddFAQModal);
    }
    
    // Form submission
    if (faqForm) {
        faqForm.addEventListener('submit', saveFAQ);
    }
    
    // Close modal when clicking outside
    if (faqModal) {
        faqModal.addEventListener('click', function(e) {
            if (e.target === faqModal) {
                closeFAQModal();
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

// Sort FAQs by specified field
function sortFAQs(field = null) {
    if (field) {
        if (sortField === field) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            sortField = field;
            sortDirection = 'asc';
        }
    }
    
    filteredFAQs.sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];
        
        if (sortField === 'question') {
            aValue = a.question.toLowerCase();
            bValue = b.question.toLowerCase();
        } else if (sortField === 'lastUpdated') {
            aValue = new Date(a.lastUpdated);
            bValue = new Date(b.lastUpdated);
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

// Filter FAQs based on filters
function filterFAQs() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const category = categoryFilter ? categoryFilter.value : 'all';
    
    filteredFAQs = faqsData.filter(faq => {
        // Search filter
        const matchesSearch = 
            faq.question.toLowerCase().includes(searchTerm) ||
            faq.answer.toLowerCase().includes(searchTerm);
        
        // Category filter
        const matchesCategory = category === 'all' || faq.category === category;
        
        return matchesSearch && matchesCategory;
    });
    
    currentPage = 1;
    sortFAQs();
    updateStats();
}

// Get category badge
function getCategoryBadge(category) {
    if (category === 'booking') {
        return `<span class="category-badge category-booking">Booking</span>`;
    } else if (category === 'facilities') {
        return `<span class="category-badge category-facilities">Facilities</span>`;
    } else if (category === 'payment') {
        return `<span class="category-badge category-payment">Payment</span>`;
    } else if (category === 'general') {
        return `<span class="category-badge category-general">General</span>`;
    } else if (category === 'other') {
        return `<span class="category-badge category-other">Other</span>`;
    }
}

// Get status badge
function getStatusBadge(status) {
    if (status === 'active') {
        return `<span class="status-badge status-available">Active</span>`;
    } else if (status === 'pending') {
        return `<span class="status-badge status-occupied">Pending</span>`;
    } else if (status === 'inactive') {
        return `<span class="status-badge status-closed">Inactive</span>`;
    }
}

// Render the table with current data
function renderTable() {
    if (!faqsTableBody) {
        console.error('Table body element not found');
        return;
    }
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredFAQs.length / recordsPerPage);
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = Math.min(startIndex + recordsPerPage, filteredFAQs.length);
    const currentFAQs = filteredFAQs.slice(startIndex, endIndex);
    
    // Update showing records info
    if (showingFrom) showingFrom.textContent = filteredFAQs.length > 0 ? startIndex + 1 : 0;
    if (showingTo) showingTo.textContent = endIndex;
    if (totalRecords) totalRecords.textContent = filteredFAQs.length;
    
    // Clear table body
    faqsTableBody.innerHTML = '';
    
    // Check if there are FAQs to display
    if (currentFAQs.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="5" class="text-center py-8 text-gray-500">
                <i class="fas fa-question-circle text-4xl mb-4 block"></i>
                No FAQs found matching your criteria
            </td>
        `;
        faqsTableBody.appendChild(row);
        return;
    }
    
    // Populate table rows with AOS animations
    currentFAQs.forEach((faq, index) => {
        const row = document.createElement('tr');
        row.setAttribute('data-aos', 'fade-up');
        row.setAttribute('data-aos-delay', (index % 10) * 50);
        
        row.innerHTML = `
            <td class="font-medium">${faq.question}</td>
            <td>${getCategoryBadge(faq.category)}</td>
            <td>${faq.lastUpdated}</td>
            <td>${getStatusBadge(faq.status)}</td>
            <td>
                <div class="action-buttons">
                    <button class="edit-faq btn-primary text-sm" data-id="${faq.id}">
                        <i class="fas fa-edit mr-1"></i> Edit
                    </button>
                    <button class="delete-faq btn-danger text-sm" data-id="${faq.id}">
                        <i class="fas fa-trash mr-1"></i> Delete
                    </button>
                </div>
            </td>
        `;
        faqsTableBody.appendChild(row);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit-faq').forEach(button => {
        button.addEventListener('click', function() {
            const faqId = this.getAttribute('data-id');
            openEditFAQModal(faqId);
        });
    });
    
    document.querySelectorAll('.delete-faq').forEach(button => {
        button.addEventListener('click', function() {
            const faqId = this.getAttribute('data-id');
            deleteFAQ(faqId);
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

// Open add FAQ modal
function openAddFAQModal() {
    if (modalTitle) modalTitle.textContent = 'Add New FAQ';
    if (faqForm) faqForm.reset();
    
    // Show modal
    if (faqModal) faqModal.classList.add('active');
}

// Open edit FAQ modal
function openEditFAQModal(faqId) {
    const faq = faqsData.find(f => f.id === faqId);
    if (!faq) return;
    
    if (modalTitle) modalTitle.textContent = 'Edit FAQ';
    if (faqForm) {
        document.getElementById('faqId').value = faq.id;
        document.getElementById('question').value = faq.question;
        document.getElementById('answer').value = faq.answer;
        document.getElementById('category').value = faq.category;
        document.getElementById('status').value = faq.status;
    }
    
    // Show modal
    if (faqModal) faqModal.classList.add('active');
}

// Close FAQ modal
function closeFAQModal() {
    if (faqModal) {
        faqModal.classList.remove('active');
    }
}

// Save FAQ (add or update)
function saveFAQ(event) {
    event.preventDefault();
    
    // Get form data
    const id = document.getElementById('faqId').value || 'FAQ' + String(faqsData.length + 1).padStart(3, '0');
    const question = document.getElementById('question').value;
    const answer = document.getElementById('answer').value;
    const category = document.getElementById('category').value;
    const status = document.getElementById('status').value;
    const lastUpdated = new Date().toISOString().split('T')[0]; // Current date
    
    // Check if we're editing or adding
    const existingIndex = faqsData.findIndex(f => f.id === id);
    
    if (existingIndex !== -1) {
        // Update existing FAQ
        faqsData[existingIndex] = {
            id,
            question,
            answer,
            category,
            lastUpdated,
            status
        };
    } else {
        // Add new FAQ
        faqsData.push({
            id,
            question,
            answer,
            category,
            lastUpdated,
            status
        });
    }
    
    // Update UI
    filterFAQs();
    closeFAQModal();
    
    // Show success message
    alert(`FAQ ${existingIndex !== -1 ? 'updated' : 'added'} successfully!`);
}

// Delete FAQ
function deleteFAQ(faqId) {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    
    const index = faqsData.findIndex(f => f.id === faqId);
    if (index !== -1) {
        faqsData.splice(index, 1);
        filterFAQs();
        alert('FAQ deleted successfully!');
    }
}

// Update stats cards
function updateStats() {
    const total = filteredFAQs.length;
    const active = filteredFAQs.filter(f => f.status === 'active').length;
    const pending = filteredFAQs.filter(f => f.status === 'pending').length;
    const categories = new Set(filteredFAQs.map(f => f.category)).size;
    
    if (document.getElementById('totalFAQs')) {
        document.getElementById('totalFAQs').textContent = total;
    }
    if (document.getElementById('activeFAQs')) {
        document.getElementById('activeFAQs').textContent = active;
    }
    if (document.getElementById('categoriesCount')) {
        document.getElementById('categoriesCount').textContent = categories;
    }
    if (document.getElementById('pendingFAQs')) {
        document.getElementById('pendingFAQs').textContent = pending;
    }
}