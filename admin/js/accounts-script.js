// Initialize AOS
AOS.init({
    duration: 800,
    easing: "ease-in-out",
    once: true,
});

// Sample accounts data
const accountsData = [
    {
        id: "ACC001",
        name: "John Doe",
        email: "john.doe@example.com",
        role: "admin",
        status: "active",
        lastLogin: "2025-09-24"
    },
    {
        id: "ACC002",
        name: "Jane Smith",
        email: "jane.smith@example.com",
        role: "guest",
        status: "active",
        lastLogin: "2025-09-23"
    },
    {
        id: "ACC003",
        name: "Mike Johnson",
        email: "mike.j@example.com",
        role: "guest",
        status: "suspended",
        lastLogin: "2025-09-20"
    },
    {
        id: "ACC004",
        name: "Sarah Williams",
        email: "sarah.w@example.com",
        role: "admin",
        status: "active",
        lastLogin: "2025-09-22"
    },
    {
        id: "ACC005",
        name: "David Brown",
        email: "david.b@example.com",
        role: "guest",
        status: "banned",
        lastLogin: "2025-09-15"
    },
    {
        id: "ACC006",
        name: "Emily Davis",
        email: "emily.d@example.com",
        role: "guest",
        status: "active",
        lastLogin: "2025-09-24"
    }
];

// Global variables
let currentPage = 1;
const recordsPerPage = 5;
let filteredAccounts = [];
let sortField = 'name';
let sortDirection = 'asc';

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
    // Initialize data
    filteredAccounts = [...accountsData];
    
    updateStats();
    sortAccounts();
    renderTable();
    setupEventListeners();
    
    console.log('Page initialized with', accountsData.length, 'accounts');
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
    
    // Sorting
    const sortableHeaders = document.querySelectorAll('th[data-sort]');
    if (sortableHeaders.length > 0) {
        sortableHeaders.forEach(th => {
            th.addEventListener('click', function() {
                const field = this.getAttribute('data-sort');
                sortAccounts(field);
            });
        });
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

// Sort accounts by specified field
function sortAccounts(field = null) {
    if (field) {
        if (sortField === field) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            sortField = field;
            sortDirection = 'asc';
        }
    }
    
    filteredAccounts.sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];
        
        if (sortField === 'name' || sortField === 'email' || sortField === 'role') {
            aValue = a[sortField].toLowerCase();
            bValue = b[sortField].toLowerCase();
        } else if (sortField === 'lastLogin') {
            aValue = new Date(a.lastLogin);
            bValue = new Date(b.lastLogin);
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

// Filter accounts based on filters
function filterAccounts() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const role = roleFilter ? roleFilter.value : 'all';
    const status = statusFilter ? statusFilter.value : 'all';
    
    filteredAccounts = accountsData.filter(account => {
        // Search filter
        const matchesSearch = 
            account.name.toLowerCase().includes(searchTerm) ||
            account.email.toLowerCase().includes(searchTerm);
        
        // Role filter
        const matchesRole = role === 'all' || account.role === role;
        
        // Status filter
        const matchesStatus = status === 'all' || account.status === status;
        
        return matchesSearch && matchesRole && matchesStatus;
    });
    
    currentPage = 1;
    sortAccounts();
    updateStats();
}

// Get role badge
function getRoleBadge(role) {
    if (role === 'admin') {
        return `<span class="role-badge role-admin">Admin</span>`;
    } else if (role === 'guest') {
        return `<span class="role-badge role-guest">Guest</span>`;
    }
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
}

// Render the table with current data
function renderTable() {
    if (!accountsTableBody) {
        console.error('Table body element not found');
        return;
    }
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredAccounts.length / recordsPerPage);
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = Math.min(startIndex + recordsPerPage, filteredAccounts.length);
    const currentAccounts = filteredAccounts.slice(startIndex, endIndex);
    
    // Update showing records info
    if (showingFrom) showingFrom.textContent = filteredAccounts.length > 0 ? startIndex + 1 : 0;
    if (showingTo) showingTo.textContent = endIndex;
    if (totalRecords) totalRecords.textContent = filteredAccounts.length;
    
    // Clear table body
    accountsTableBody.innerHTML = '';
    
    // Check if there are accounts to display
    if (currentAccounts.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="6" class="text-center py-8 text-gray-500">
                <i class="fas fa-users text-4xl mb-4 block"></i>
                No accounts found matching your criteria
            </td>
        `;
        accountsTableBody.appendChild(row);
        return;
    }
    
    // Populate table rows with AOS animations
    currentAccounts.forEach((account, index) => {
        const row = document.createElement('tr');
        row.setAttribute('data-aos', 'fade-up');
        row.setAttribute('data-aos-delay', (index % 10) * 50);
        
        row.innerHTML = `
            <td class="font-medium">${account.name}</td>
            <td>${account.email}</td>
            <td>${getRoleBadge(account.role)}</td>
            <td>${getStatusBadge(account.status)}</td>
            <td>${account.lastLogin}</td>
            <td>
                <div class="action-buttons">
                    <button class="manage-account btn-primary text-sm" data-id="${account.id}">
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
            const accountId = this.getAttribute('data-id');
            openManageAccountModal(accountId);
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

// Open manage account modal
function openManageAccountModal(accountId) {
    const account = accountsData.find(a => a.id === accountId);
    if (!account) return;
    
    if (modalTitle) modalTitle.textContent = 'Manage Account';
    if (accountForm) {
        document.getElementById('accountId').value = account.id;
        document.getElementById('name').value = account.name;
        document.getElementById('email').value = account.email;
        document.getElementById('role').value = account.role;
        document.getElementById('status').value = account.status;
    }
    
    // Show modal
    if (accountModal) accountModal.classList.add('active');
}

// Close account modal
function closeAccountModal() {
    if (accountModal) {
        accountModal.classList.remove('active');
    }
}

// Save account changes
function saveAccount(event) {
    event.preventDefault();
    
    // Get form data
    const id = document.getElementById('accountId').value;
    const role = document.getElementById('role').value;
    const status = document.getElementById('status').value;
    
    // Update account
    const index = accountsData.findIndex(a => a.id === id);
    if (index !== -1) {
        accountsData[index].role = role;
        accountsData[index].status = status;
        
        // Update UI
        filterAccounts();
        closeAccountModal();
        
        // Show success message
        alert('Account updated successfully!');
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