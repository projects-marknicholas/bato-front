// Initialize AOS
AOS.init({
    duration: 800,
    easing: "ease-in-out",
    once: true,
});

// API Configuration
const API_BASE_URL = window.CONFIG.API_BASE_URL;
const ENDPOINT_URL = window.CONFIG.ENDPOINTS.ADMIN_NEWS;

// Global variables
let currentPage = 1;
const recordsPerPage = 10;
let allNews = [];

// DOM Elements
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const newsTableBody = document.getElementById('newsTableBody');
const pagination = document.getElementById('pagination');
const showingFrom = document.getElementById('showingFrom');
const showingTo = document.getElementById('showingTo');
const totalRecords = document.getElementById('totalRecords');
const newsModal = document.getElementById('newsModal');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const addNewsBtn = document.getElementById('addNewsBtn');
const newsForm = document.getElementById('newsForm');
const modalTitle = document.getElementById('modalTitle');
const imageInput = document.getElementById('image');
const imagePreview = document.getElementById('imagePreview');

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
        searchInput.addEventListener('input', filterNews);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', filterNews);
    }
    
    // Modal
    if (closeModal) {
        closeModal.addEventListener('click', closeNewsModal);
    }
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeNewsModal);
    }
    
    // Add News button
    if (addNewsBtn) {
        addNewsBtn.addEventListener('click', openAddNewsModal);
    }
    
    // Form submission
    if (newsForm) {
        newsForm.addEventListener('submit', saveNews);
    }
    
    // Close modal when clicking outside
    if (newsModal) {
        newsModal.addEventListener('click', function(e) {
            if (e.target === newsModal) {
                closeNewsModal();
            }
        });
    }
    
    // Image preview
    if (imageInput && imagePreview) {
        imageInput.addEventListener('input', function() {
            if (this.value) {
                imagePreview.src = this.value;
                imagePreview.classList.remove('hidden');
            } else {
                imagePreview.classList.add('hidden');
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
        await loadNews();
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showError('Failed to load news data');
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
        
        // Log the raw response for debugging
        const responseText = await response.text();
        
        if (response.status === 401) {
            localStorage.removeItem('user');
            window.location.href = '../index.html';
            return;
        }

        if (response.status === 429) {
            throw new Error('Rate limit exceeded. Please try again later.');
        }

        if (!response.ok) {
            // Try to parse as JSON, but fall back to text if it fails
            let errorData;
            try {
                errorData = JSON.parse(responseText);
            } catch {
                errorData = { error: responseText || 'Unknown error' };
            }
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        // Parse the successful response
        return JSON.parse(responseText);
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Network error: Unable to connect to server');
        }
        throw error;
    }
}

// Load news from backend
async function loadNews() {
    try {
        showLoadingState('Loading news...');
        
        // Build query parameters
        const params = new URLSearchParams();
        params.append('page', currentPage);
        params.append('limit', recordsPerPage);
        
        if (searchInput && searchInput.value) {
            params.append('search', searchInput.value);
        }
        
        if (statusFilter && statusFilter.value && statusFilter.value !== 'all') {
            params.append('status', statusFilter.value);
        }
        
        const data = await makeApiRequest(`${ENDPOINT_URL}?${params.toString()}`);
        
        if (data && data.success) {
            allNews = data.data || [];
            
            updateStats();
            renderTable(data.pagination);
        } else {
            throw new Error('Failed to load news data');
        }
    } catch (error) {
        console.error('Error loading news:', error);
        showError('Failed to load news: ' + error.message);
        
        // Show empty state
        allNews = [];
        updateStats();
        renderTable();
    } finally {
        hideLoadingState();
    }
}

// Filter news based on filters
function filterNews() {
    currentPage = 1;
    loadNews();
}

// Get status badge
function getStatusBadge(status) {
    if (status === 'published') {
        return `<span class="status-badge status-published">Published</span>`;
    } else if (status === 'draft') {
        return `<span class="status-badge status-draft">Draft</span>`;
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

// Render the table with current data
function renderTable(paginationData = null) {
    if (!newsTableBody) {
        console.error('Table body element not found');
        return;
    }
    
    // Clear table body
    newsTableBody.innerHTML = '';
    
    // Check if there are news posts to display
    if (!allNews || allNews.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="4" class="text-center py-8 text-gray-500">
                <i class="fas fa-newspaper text-4xl mb-4 block"></i>
                No news posts found
            </td>
        `;
        newsTableBody.appendChild(row);
        
        // Update showing records info
        updateShowingInfo(0, 0, paginationData);
        return;
    }
    
    // Populate table rows
    allNews.forEach((news, index) => {
        const row = document.createElement('tr');
        const newsId = news.news_id;
        const title = news.title || '';
        const description = news.description || '';
        const imageUrl = news.image_url || '';
        const createdAt = news.created_at || '';
        const status = news.status || '';
        
        row.innerHTML = `
            <td class="font-medium">
                <div class="flex items-center gap-3">
                    ${imageUrl ? `
                        <img src="${imageUrl}" alt="${title}" class="w-10 h-10 rounded object-cover">
                    ` : `
                        <div class="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                            <i class="fas fa-newspaper text-gray-500"></i>
                        </div>
                    `}
                    <div>
                        <div class="font-medium text-gray-900">${title}</div>
                        <div class="text-sm text-gray-500 truncate max-w-xs">${description}</div>
                    </div>
                </div>
            </td>
            <td>${formatDate(createdAt)}</td>
            <td>${getStatusBadge(status)}</td>
            <td>
                <div class="action-buttons">
                    <button class="edit-news btn-primary text-sm" data-id="${newsId}">
                        <i class="fas fa-edit mr-1"></i> Edit
                    </button>
                    <button class="delete-news btn-danger text-sm" data-id="${newsId}">
                        <i class="fas fa-trash mr-1"></i> Delete
                    </button>
                </div>
            </td>
        `;
        newsTableBody.appendChild(row);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit-news').forEach(button => {
        button.addEventListener('click', function() {
            const newsId = this.getAttribute('data-id');
            openEditNewsModal(newsId);
        });
    });
    
    document.querySelectorAll('.delete-news').forEach(button => {
        button.addEventListener('click', function() {
            const newsId = this.getAttribute('data-id');
            deleteNews(newsId);
        });
    });
    
    // Update showing info and pagination
    updateShowingInfo(allNews.length, paginationData);
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
            loadNews();
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
            loadNews();
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
            loadNews();
        }
    });
    pagination.appendChild(nextButton);
}

// Open add news modal
function openAddNewsModal() {
    if (modalTitle) modalTitle.textContent = 'Add New Post';
    if (newsForm) newsForm.reset();
    if (imagePreview) {
        imagePreview.classList.add('hidden');
        imagePreview.src = '';
    }
    
    // Clear news ID for new post
    document.getElementById('newsId').value = '';
    
    // Show modal
    if (newsModal) newsModal.classList.add('active');
}

// Open edit news modal
async function openEditNewsModal(newsId) {
    try {
        showLoadingState('Loading news...');
        
        // Find news in current data
        const news = allNews.find(n => n.news_id === newsId);
        if (!news) {
            throw new Error('News not found');
        }
        
        if (modalTitle) modalTitle.textContent = 'Edit Post';
        if (newsForm) {
            document.getElementById('newsId').value = news.news_id;
            document.getElementById('title').value = news.title;
            document.getElementById('description').value = news.description;
            document.getElementById('image').value = news.image_url || '';
            
            // Format event_date for date input (YYYY-MM-DD)
            if (news.event_date) {
                const eventDate = new Date(news.event_date);
                document.getElementById('eventDate').value = eventDate.toISOString().split('T')[0];
            } else {
                document.getElementById('eventDate').value = '';
            }
            
            document.getElementById('status').value = news.status;
            
            if (news.image_url) {
                imagePreview.src = news.image_url;
                imagePreview.classList.remove('hidden');
            } else {
                imagePreview.classList.add('hidden');
            }
        }
        
        // Show modal
        if (newsModal) newsModal.classList.add('active');
    } catch (error) {
        console.error('Error opening edit modal:', error);
        showError('Failed to load news: ' + error.message);
    } finally {
        hideLoadingState();
    }
}

// Close news modal
function closeNewsModal() {
    if (newsModal) {
        newsModal.classList.remove('active');
    }
}

// Save news (add or update)
async function saveNews(event) {
    event.preventDefault();
    
    try {
        showLoadingState('Saving news...');
        
        // Get form data
        const newsId = document.getElementById('newsId').value;
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const image_url = document.getElementById('image').value;
        const event_date = document.getElementById('eventDate').value;
        const status = document.getElementById('status').value;
        
        const newsData = {
            title: title.trim(),
            description: description.trim(),
            image_url: image_url.trim(),
            event_date: event_date || null,
            status: status
        };
        
        let data;
        
        if (newsId) {
            // Update existing news
            newsData.news_id = newsId;
            data = await makeApiRequest(ENDPOINT_URL, {
                method: 'PUT',
                body: newsData
            });
        } else {
            // Create new news
            data = await makeApiRequest(ENDPOINT_URL, {
                method: 'POST',
                body: newsData
            });
        }
        
        if (data && data.success) {
            showSuccess(`News post ${newsId ? 'updated' : 'created'} successfully!`);
            closeNewsModal();
            await loadNews(); // Reload news list
        } else {
            throw new Error('Failed to save news');
        }
    } catch (error) {
        console.error('Error saving news:', error);
        showError('Failed to save news: ' + error.message);
    } finally {
        hideLoadingState();
    }
}

// Delete news
async function deleteNews(newsId) {
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
        showLoadingState('Deleting news...');
        
        const data = await makeApiRequest(ENDPOINT_URL, {
            method: 'DELETE',
            body: { news_id: newsId }
        });
        
        if (data && data.success) {
            showSuccess('News deleted successfully!');
            await loadNews(); // Reload news list
        } else {
            throw new Error('Failed to delete news');
        }
    } catch (error) {
        console.error('Error deleting news:', error);
        showError('Failed to delete news: ' + error.message);
    } finally {
        hideLoadingState();
    }
}

// Update stats cards
function updateStats() {
    const total = allNews.length;
    const published = allNews.filter(n => n.status === 'published').length;
    const draft = allNews.filter(n => n.status === 'draft').length;
    
    if (document.getElementById('totalPosts')) {
        document.getElementById('totalPosts').textContent = total;
    }
    if (document.getElementById('publishedPosts')) {
        document.getElementById('publishedPosts').textContent = published;
    }
    if (document.getElementById('draftPosts')) {
        document.getElementById('draftPosts').textContent = draft;
    }
}

// UI Helper Functions
function showLoadingState(message = 'Loading...') {
    const submitBtn = newsForm?.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + message;
    }
}

function hideLoadingState() {
    const submitBtn = newsForm?.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Save Post';
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