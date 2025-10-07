// Initialize AOS
AOS.init({
    duration: 800,
    easing: "ease-in-out",
    once: true,
});

// API Configuration
const API_BASE_URL = window.CONFIG.API_BASE_URL;
const ENDPOINT_URL = window.CONFIG.ENDPOINTS.ADMIN_HELP;

// Global variables
let currentPage = 1;
const recordsPerPage = 10;
let allFAQs = [];
let filteredFAQs = [];

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
        searchInput.addEventListener('input', filterFAQs);
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterFAQs);
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

// Initialize application
async function initializeApp() {
    if (!checkAuthentication()) {
        return;
    }
    
    try {
        await loadFAQs();
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showError('Failed to load FAQs data');
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

// Load FAQs from backend
async function loadFAQs() {
    try {
        showLoadingState('Loading FAQs...');
        
        // Build query parameters
        const params = new URLSearchParams();
        params.append('page', currentPage);
        params.append('limit', recordsPerPage);
        
        if (searchInput && searchInput.value) {
            params.append('search', searchInput.value);
        }
        
        if (categoryFilter && categoryFilter.value && categoryFilter.value !== 'all') {
            params.append('category', categoryFilter.value);
        }
        
        const data = await makeApiRequest(`${ENDPOINT_URL}?${params.toString()}`);
        
        if (data && data.success) {
            allFAQs = data.data || [];
            filteredFAQs = [...allFAQs];
            
            updateStats();
            renderTable(data.pagination);
        } else {
            throw new Error('Failed to load FAQs data');
        }
    } catch (error) {
        console.error('Error loading FAQs:', error);
        showError('Failed to load FAQs: ' + error.message);
        
        // Show empty state
        allFAQs = [];
        filteredFAQs = [];
        updateStats();
        renderTable();
    } finally {
        hideLoadingState();
    }
}

// Filter FAQs based on filters
function filterFAQs() {
    currentPage = 1;
    loadFAQs();
}

// Get category badge
function getCategoryBadge(category) {
    const categories = {
        'booking': { class: 'category-booking', label: 'Booking' },
        'facilities': { class: 'category-facilities', label: 'Facilities' },
        'payment': { class: 'category-payment', label: 'Payment' },
        'general': { class: 'category-general', label: 'General' },
        'other': { class: 'category-other', label: 'Other' }
    };
    
    const cat = categories[category] || { class: 'category-other', label: category };
    return `<span class="category-badge ${cat.class}">${cat.label}</span>`;
}

// Get status badge
function getStatusBadge(status) {
    if (status === 'active') {
        return `<span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 shadow-sm">
                    <span class="w-2 h-2 rounded-full bg-green-600/90 block"></span>
                    Active
                </span>`;
    } else if (status === 'archive') {
        return `<span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 shadow-sm">
                    <span class="w-2 h-2 rounded-full bg-blue-600/90 block"></span>
                    Archived
                </span>`;
    }
    return `<span class="status-badge">${status}</span>`;
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Truncate text for display
function truncateText(text, maxLength = 100) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Render the table with current data
function renderTable(paginationData = null) {
    if (!faqsTableBody) {
        console.error('Table body element not found');
        return;
    }
    
    // Clear table body
    faqsTableBody.innerHTML = '';
    
    // Check if there are FAQs to display
    if (!filteredFAQs || filteredFAQs.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="5" class="text-center py-8 text-gray-500">
                <i class="fas fa-question-circle text-4xl mb-4 block"></i>
                No FAQs found
            </td>
        `;
        faqsTableBody.appendChild(row);
        
        // Update showing records info
        updateShowingInfo(0, paginationData);
        return;
    }
    
    // Populate table rows
    filteredFAQs.forEach((faq, index) => {
        const row = document.createElement('tr');
        const question = faq.question || '';
        const answer = faq.answer || '';
        const category = faq.category || 'other';
        const status = faq.status || 'active';
        const updatedAt = faq.updated_at || faq.created_at;
        const faqId = faq.faq_id || '';
        
        row.innerHTML = `
            <td class="font-medium">
                <div>
                    <div class="font-medium text-gray-900">${truncateText(question, 80)}</div>
                    <div class="text-sm text-gray-500 mt-1">${truncateText(answer, 60)}</div>
                </div>
            </td>
            <td>${getCategoryBadge(category)}</td>
            <td>${formatDate(updatedAt)}</td>
            <td>${getStatusBadge(status)}</td>
            <td>
                <div class="action-buttons">
                    <button class="edit-faq btn-primary text-sm" data-id="${faqId}">
                        <i class="fas fa-edit mr-1"></i> Edit
                    </button>
                    <button class="delete-faq btn-danger text-sm" data-id="${faqId}">
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
    
    // Update showing info and pagination
    updateShowingInfo(filteredFAQs.length, paginationData);
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
            loadFAQs();
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
            loadFAQs();
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
            loadFAQs();
        }
    });
    pagination.appendChild(nextButton);
}

// Open add FAQ modal
function openAddFAQModal() {
    if (modalTitle) modalTitle.textContent = 'Add New FAQ';
    if (faqForm) faqForm.reset();
    
    // Clear FAQ ID for new FAQ
    document.getElementById('faqId').value = '';
    
    // Show modal
    if (faqModal) faqModal.classList.add('active');
}

// Open edit FAQ modal
async function openEditFAQModal(faqId) {
    try {
        showLoadingState('Loading FAQ...');
        
        // Find FAQ in current data
        const faq = allFAQs.find(f => f.faq_id === faqId);
        if (!faq) {
            throw new Error('FAQ not found');
        }
        
        if (modalTitle) modalTitle.textContent = 'Edit FAQ';
        if (faqForm) {
            document.getElementById('faqId').value = faq.faq_id;
            document.getElementById('question').value = faq.question;
            document.getElementById('answer').value = faq.answer;
            document.getElementById('category').value = faq.category;
            document.getElementById('status').value = faq.status;
        }
        
        // Show modal
        if (faqModal) faqModal.classList.add('active');
    } catch (error) {
        console.error('Error opening edit modal:', error);
        showError('Failed to load FAQ: ' + error.message);
    } finally {
        hideLoadingState();
    }
}

// Close FAQ modal
function closeFAQModal() {
    if (faqModal) {
        faqModal.classList.remove('active');
    }
}

// Save FAQ (add or update)
async function saveFAQ(event) {
    event.preventDefault();
    
    try {
        showLoadingState('Saving FAQ...');
        
        // Get form data
        const faqId = document.getElementById('faqId').value;
        const question = document.getElementById('question').value;
        const answer = document.getElementById('answer').value;
        const category = document.getElementById('category').value;
        const status = document.getElementById('status').value;
        
        const faqData = {
            question: question.trim(),
            answer: answer.trim(),
            category: category,
            status: status
        };
        
        let data;
        
        if (faqId) {
            // Update existing FAQ
            faqData.faq_id = faqId;
            data = await makeApiRequest(ENDPOINT_URL, {
                method: 'PUT',
                body: faqData
            });
        } else {
            // Create new FAQ
            data = await makeApiRequest(ENDPOINT_URL, {
                method: 'POST',
                body: faqData
            });
        }
        
        if (data && data.success) {
            showSuccess(`FAQ ${faqId ? 'updated' : 'created'} successfully!`);
            closeFAQModal();
            await loadFAQs(); // Reload FAQs list
        } else {
            throw new Error('Failed to save FAQ');
        }
    } catch (error) {
        console.error('Error saving FAQ:', error);
        showError('Failed to save FAQ: ' + error.message);
    } finally {
        hideLoadingState();
    }
}

// Delete FAQ
async function deleteFAQ(faqId) {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    });
    
    if (!result.isConfirmed) return;
    
    try {
        showLoadingState('Deleting FAQ...');
        
        const data = await makeApiRequest(ENDPOINT_URL, {
            method: 'DELETE',
            body: { faq_id: faqId }
        });
        
        if (data && data.success) {
            showSuccess('FAQ deleted successfully!');
            await loadFAQs(); // Reload FAQs list
        } else {
            throw new Error('Failed to delete FAQ');
        }
    } catch (error) {
        console.error('Error deleting FAQ:', error);
        showError('Failed to delete FAQ: ' + error.message);
    } finally {
        hideLoadingState();
    }
}

// Update stats cards
function updateStats() {
    const total = filteredFAQs.length;
    const active = filteredFAQs.filter(f => f.status === 'active').length;
    const archived = filteredFAQs.filter(f => f.status === 'archive').length;
    
    // Get unique categories count
    const categories = [...new Set(filteredFAQs.map(f => f.category))];
    const categoriesCount = categories.length;
    
    if (document.getElementById('totalFAQs')) {
        document.getElementById('totalFAQs').textContent = total;
    }
    if (document.getElementById('activeFAQs')) {
        document.getElementById('activeFAQs').textContent = active;
    }
    if (document.getElementById('categoriesCount')) {
        document.getElementById('categoriesCount').textContent = categoriesCount;
    }
    if (document.getElementById('pendingFAQs')) {
        document.getElementById('pendingFAQs').textContent = archived;
    }
}

// UI Helper Functions
function showLoadingState(message = 'Loading...') {
    const submitBtn = faqForm?.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + message;
    }
}

function hideLoadingState() {
    const submitBtn = faqForm?.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Save FAQ';
    }
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