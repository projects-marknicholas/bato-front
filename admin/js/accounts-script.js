// Initialize AOS
AOS.init({
    duration: 800,
    easing: "ease-in-out",
    once: true,
});

// API Configuration
const API_BASE_URL = window.CONFIG.API_BASE_URL;
const ENDPOINT_URL = window.CONFIG.ENDPOINTS.ADMIN_ACCOUNTS;

// Global variables
let currentPage = 1;
const recordsPerPage = 10;
let allAccounts = [];
let filteredAccounts = [];

// DOM Elements
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const searchInput = document.getElementById('searchInput');
const roleFilter = document.getElementById('roleFilter');
const statusFilter = document.getElementById('statusFilter');
const accountsTableBody = document.getElementById('accountsTableBody');
const pagination = document.getElementById('pagination');
const showingFrom = document.getElementById('showingFrom');
const showingTo = document.getElementById('showingTo');
const totalRecords = document.getElementById('totalRecords');
const accountModal = document.getElementById('accountModal');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const accountForm = document.getElementById('accountForm');
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
        searchInput.addEventListener('input', filterAccounts);
    }
    if (roleFilter) {
        roleFilter.addEventListener('change', filterAccounts);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', filterAccounts);
    }
    
    // Modal
    if (closeModal) {
        closeModal.addEventListener('click', closeAccountModal);
    }
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeAccountModal);
    }
    
    // Form submission
    if (accountForm) {
        accountForm.addEventListener('submit', saveAccount);
    }
    
    // Close modal when clicking outside
    if (accountModal) {
        accountModal.addEventListener('click', function(e) {
            if (e.target === accountModal) {
                closeAccountModal();
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
        await loadAccounts();
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showError('Failed to load accounts data');
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

// Load accounts from backend
async function loadAccounts() {
    try {
        showLoadingState('Loading accounts...');
        
        // Build query parameters
        const params = new URLSearchParams();
        params.append('page', currentPage);
        params.append('limit', recordsPerPage);
        
        if (searchInput && searchInput.value) {
            params.append('search', searchInput.value);
        }
        
        if (roleFilter && roleFilter.value && roleFilter.value !== 'all') {
            params.append('role', roleFilter.value);
        }
        
        if (statusFilter && statusFilter.value && statusFilter.value !== 'all') {
            params.append('status', statusFilter.value);
        }
        
        const data = await makeApiRequest(`${ENDPOINT_URL}?${params.toString()}`);
        
        if (data && data.success) {
            allAccounts = data.data || [];
            filteredAccounts = [...allAccounts];
            
            updateStats();
            renderTable(data.pagination);
        } else {
            throw new Error('Failed to load accounts data');
        }
    } catch (error) {
        console.error('Error loading accounts:', error);
        showError('Failed to load accounts: ' + error.message);
        
        // Show empty state
        allAccounts = [];
        filteredAccounts = [];
        updateStats();
        renderTable();
    } finally {
        hideLoadingState();
    }
}

// Filter accounts based on filters
function filterAccounts() {
    currentPage = 1;
    loadAccounts();
}

// Get full name from first and last name
function getFullName(account) {
    const firstName = account.first_name || '';
    const lastName = account.last_name || '';
    return `${firstName} ${lastName}`.trim() || 'Unknown User';
}

// Get role badge
function getRoleBadge(role) {
    if (role === 'admin') {
        return `<span class="role-badge role-admin">Admin</span>`;
    } else if (role === 'guest') {
        return `<span class="role-badge role-guest">Guest</span>`;
    }
    return `<span class="role-badge">${role}</span>`;
}

// Get status badge
function getStatusBadge(status) {
    if (status === 'active') {
        return `<span class="status-badge status-active">Active</span>`;
    } else if (status === 'suspended') {
        return `<span class="status-badge status-suspended">Suspended</span>`;
    } else if (status === 'banned') {
        return `<span class="status-badge status-banned">Banned</span>`;
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

// Format phone number for display
function formatPhoneNumber(phone) {
    if (!phone) return '-';
    return phone;
}

// Format address for display
function formatAddress(address) {
    if (!address) return '-';
    return address.length > 30 ? address.substring(0, 30) + '...' : address;
}

// Render the table with current data
function renderTable(paginationData = null) {
    if (!accountsTableBody) {
        console.error('Table body element not found');
        return;
    }
    
    // Clear table body
    accountsTableBody.innerHTML = '';
    
    // Check if there are accounts to display
    if (!filteredAccounts || filteredAccounts.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="6" class="text-center py-8 text-gray-500">
                <i class="fas fa-users text-4xl mb-4 block"></i>
                No accounts found
            </td>
        `;
        accountsTableBody.appendChild(row);
        
        // Update showing records info
        updateShowingInfo(0, paginationData);
        return;
    }
    
    // Populate table rows
    filteredAccounts.forEach((account, index) => {
        const row = document.createElement('tr');
        const fullName = getFullName(account);
        const email = account.email_address || 'No email';
        const role = account.role || 'guest';
        const status = account.status || 'active';
        const lastLogin = account.last_login || account.updated_at;
        const userId = account.user_id; // Get the user_id from account data
        
        row.innerHTML = `
            <td class="font-medium">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center overflow-hidden">
                        ${account.profile ? 
                            `<img src="${account.profile}" alt="${fullName}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.parentNode.innerHTML='<i class=\\'fas fa-user text-white text-sm\\'></i>';" />` :
                            `<i class="fas fa-user text-white text-sm"></i>`
                        }
                    </div>
                    <div>
                        <div class="font-medium text-gray-900">${fullName}</div>
                        <div class="text-sm text-gray-500">${formatPhoneNumber(account.phone_number)}</div>
                    </div>
                </div>
            </td>
            <td>${email}</td>
            <td>${getRoleBadge(role)}</td>
            <td>${getStatusBadge(status)}</td>
            <td>${formatDate(lastLogin)}</td>
            <td>
                <div class="action-buttons">
                    <button class="manage-account btn-primary text-sm" data-user-id="${userId}" data-email="${email}">
                        <i class="fas fa-user-cog mr-1"></i> Manage
                    </button>
                </div>
            </td>
        `;
        accountsTableBody.appendChild(row);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.manage-account').forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            const email = this.getAttribute('data-email');
            openManageAccountModal(userId, email);
        });
    });
    
    // Update showing info and pagination
    updateShowingInfo(paginationData);
    renderPagination(paginationData);
    
    // Reinitialize AOS for new elements
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
}

// Update showing records info
function updateShowingInfo(paginationData) {
    if (!paginationData) {
        if (showingFrom) showingFrom.textContent = '0';
        if (showingTo) showingTo.textContent = '0';
        if (totalRecords) totalRecords.textContent = '0';
        return;
    }
    
    const startIndex = (paginationData.current_page - 1) * paginationData.per_page + 1;
    const endIndex = Math.min(startIndex + filteredAccounts.length - 1, paginationData.total_items);
    
    if (showingFrom) showingFrom.textContent = filteredAccounts.length > 0 ? startIndex : '0';
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
            loadAccounts();
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
            loadAccounts();
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
            loadAccounts();
        }
    });
    pagination.appendChild(nextButton);
}

// Open manage account modal
function openManageAccountModal(userId, email) {
    try {
        // Find account in current data using user_id
        const account = allAccounts.find(a => a.user_id === userId);
        if (!account) {
            throw new Error('Account not found');
        }
        
        if (modalTitle) modalTitle.textContent = 'Manage Account';
        if (accountForm) {
            document.getElementById('accountId').value = userId; // Store user_id, not email
            document.getElementById('name').value = getFullName(account);
            document.getElementById('email').value = account.email_address;
            document.getElementById('role').value = account.role || 'guest';
            document.getElementById('status').value = account.status || 'active';
        }
        
        // Show modal
        if (accountModal) accountModal.classList.add('active');
    } catch (error) {
        console.error('Error opening manage modal:', error);
        showError('Failed to load account: ' + error.message);
    }
}

// Close account modal
function closeAccountModal() {
    if (accountModal) {
        accountModal.classList.remove('active');
    }
}

// Save account changes
async function saveAccount(event) {
    event.preventDefault();
    
    try {
        showLoadingState('Saving changes...');
        
        // Get form data - accountId now contains the user_id
        const userId = document.getElementById('accountId').value;
        const role = document.getElementById('role').value;
        const status = document.getElementById('status').value;
        
        const accountData = {
            user_id: userId, // Use the actual user_id from the account data
            role: role,
            status: status
        };
        
        const data = await makeApiRequest(ENDPOINT_URL, {
            method: 'PUT',
            body: accountData
        });
        
        if (data && data.success) {
            showSuccess('Account updated successfully!');
            closeAccountModal();
            await loadAccounts(); // Reload accounts list
        } else {
            throw new Error('Failed to update account');
        }
    } catch (error) {
        console.error('Error updating account:', error);
        showError('Failed to update account: ' + error.message);
    } finally {
        hideLoadingState();
    }
}

// Update stats cards
function updateStats() {
    const total = filteredAccounts.length;
    const active = filteredAccounts.filter(a => a.status === 'active').length;
    const restricted = filteredAccounts.filter(a => a.status === 'suspended' || a.status === 'banned').length;
    
    if (document.getElementById('totalAccounts')) {
        document.getElementById('totalAccounts').textContent = total;
    }
    if (document.getElementById('activeAccounts')) {
        document.getElementById('activeAccounts').textContent = active;
    }
    if (document.getElementById('restrictedAccounts')) {
        document.getElementById('restrictedAccounts').textContent = restricted;
    }
}

// UI Helper Functions
function showLoadingState(message = 'Loading...') {
    const submitBtn = accountForm?.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + message;
    }
}

function hideLoadingState() {
    const submitBtn = accountForm?.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Save Changes';
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