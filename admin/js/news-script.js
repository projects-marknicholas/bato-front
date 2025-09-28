// Initialize AOS
AOS.init({
    duration: 800,
    easing: "ease-in-out",
    once: true,
});

// Sample news data
const newsData = [
    {
        id: "NEWS001",
        title: "Summer Festival at BatoSpring",
        description: "Join us for our annual summer festival with live music, food stalls, and family activities!",
        image: "https://via.placeholder.com/300x200",
        datePosted: "2025-09-20",
        eventDate: "2025-10-01",
        status: "published"
    },
    {
        id: "NEWS002",
        title: "New Spa Facilities Opening",
        description: "We are excited to announce the opening of our new spa facilities with exclusive treatments.",
        image: "https://via.placeholder.com/300x200",
        datePosted: "2025-09-15",
        eventDate: "",
        status: "published"
    },
    {
        id: "NEWS003",
        title: "Winter Retreat Package",
        description: "Book our winter retreat package for a cozy getaway with special discounts.",
        image: "https://via.placeholder.com/300x200",
        datePosted: "2025-09-10",
        eventDate: "",
        status: "draft"
    },
    {
        id: "NEWS004",
        title: "Yoga Retreat Weekend",
        description: "Join our yoga retreat for a relaxing weekend with expert instructors.",
        image: "https://via.placeholder.com/300x200",
        datePosted: "2025-09-05",
        eventDate: "2025-09-25",
        status: "published"
    },
    {
        id: "NEWS005",
        title: "New Year Celebration Plans",
        description: "Get ready for our spectacular New Year celebration with fireworks and entertainment.",
        image: "https://via.placeholder.com/300x200",
        datePosted: "2025-09-01",
        eventDate: "2025-12-31",
        status: "draft"
    }
];

// Global variables
let currentPage = 1;
const recordsPerPage = 5;
let filteredNews = [];
let sortField = 'title';
let sortDirection = 'asc';

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
    // Initialize data
    filteredNews = [...newsData];
    
    updateStats();
    sortNews();
    renderTable();
    setupEventListeners();
    
    console.log('Page initialized with', newsData.length, 'news posts');
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
    
    // Sorting
    const sortableHeaders = document.querySelectorAll('th[data-sort]');
    if (sortableHeaders.length > 0) {
        sortableHeaders.forEach(th => {
            th.addEventListener('click', function() {
                const field = this.getAttribute('data-sort');
                sortNews(field);
            });
        });
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

// Sort news by specified field
function sortNews(field = null) {
    if (field) {
        if (sortField === field) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            sortField = field;
            sortDirection = 'asc';
        }
    }
    
    filteredNews.sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];
        
        if (sortField === 'title') {
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
        } else if (sortField === 'datePosted') {
            aValue = new Date(a.datePosted);
            bValue = new Date(b.datePosted);
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

// Filter news based on filters
function filterNews() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const status = statusFilter ? statusFilter.value : 'all';
    
    filteredNews = newsData.filter(news => {
        // Search filter
        const matchesSearch = 
            news.title.toLowerCase().includes(searchTerm) ||
            news.description.toLowerCase().includes(searchTerm);
        
        // Status filter
        const matchesStatus = status === 'all' || news.status === status;
        
        return matchesSearch && matchesStatus;
    });
    
    currentPage = 1;
    sortNews();
    updateStats();
}

// Get status badge
function getStatusBadge(status) {
    if (status === 'published') {
        return `<span class="status-badge status-published">Published</span>`;
    } else if (status === 'draft') {
        return `<span class="status-badge status-draft">Draft</span>`;
    }
}

// Render the table with current data
function renderTable() {
    if (!newsTableBody) {
        console.error('Table body element not found');
        return;
    }
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredNews.length / recordsPerPage);
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = Math.min(startIndex + recordsPerPage, filteredNews.length);
    const currentNews = filteredNews.slice(startIndex, endIndex);
    
    // Update showing records info
    if (showingFrom) showingFrom.textContent = filteredNews.length > 0 ? startIndex + 1 : 0;
    if (showingTo) showingTo.textContent = endIndex;
    if (totalRecords) totalRecords.textContent = filteredNews.length;
    
    // Clear table body
    newsTableBody.innerHTML = '';
    
    // Check if there are news posts to display
    if (currentNews.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="4" class="text-center py-8 text-gray-500">
                <i class="fas fa-newspaper text-4xl mb-4 block"></i>
                No news posts found matching your criteria
            </td>
        `;
        newsTableBody.appendChild(row);
        return;
    }
    
    // Populate table rows with AOS animations
    currentNews.forEach((news, index) => {
        const row = document.createElement('tr');
        row.setAttribute('data-aos', 'fade-up');
        row.setAttribute('data-aos-delay', (index % 10) * 50);
        
        row.innerHTML = `
            <td class="font-medium">${news.title}</td>
            <td>${news.datePosted}</td>
            <td>${getStatusBadge(news.status)}</td>
            <td>
                <div class="action-buttons">
                    <button class="edit-news btn-primary text-sm" data-id="${news.id}">
                        <i class="fas fa-edit mr-1"></i> Edit
                    </button>
                    <button class="delete-news btn-danger text-sm" data-id="${news.id}">
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

// Open add news modal
function openAddNewsModal() {
    if (modalTitle) modalTitle.textContent = 'Add New Post';
    if (newsForm) newsForm.reset();
    if (imagePreview) {
        imagePreview.classList.add('hidden');
        imagePreview.src = '';
    }
    
    // Show modal
    if (newsModal) newsModal.classList.add('active');
}

// Open edit news modal
function openEditNewsModal(newsId) {
    const news = newsData.find(n => n.id === newsId);
    if (!news) return;
    
    if (modalTitle) modalTitle.textContent = 'Edit Post';
    if (newsForm) {
        document.getElementById('newsId').value = news.id;
        document.getElementById('title').value = news.title;
        document.getElementById('description').value = news.description;
        document.getElementById('image').value = news.image;
        document.getElementById('eventDate').value = news.eventDate;
        document.getElementById('status').value = news.status;
        
        if (news.image) {
            imagePreview.src = news.image;
            imagePreview.classList.remove('hidden');
        } else {
            imagePreview.classList.add('hidden');
        }
    }
    
    // Show modal
    if (newsModal) newsModal.classList.add('active');
}

// Close news modal
function closeNewsModal() {
    if (newsModal) {
        newsModal.classList.remove('active');
    }
}

// Save news (add or update)
function saveNews(event) {
    event.preventDefault();
    
    // Get form data
    const id = document.getElementById('newsId').value || 'NEWS' + String(newsData.length + 1).padStart(3, '0');
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const image = document.getElementById('image').value;
    const eventDate = document.getElementById('eventDate').value;
    const status = document.getElementById('status').value;
    const datePosted = new Date().toISOString().split('T')[0]; // Current date
    
    // Check if we're editing or adding
    const existingIndex = newsData.findIndex(n => n.id === id);
    
    if (existingIndex !== -1) {
        // Update existing news
        newsData[existingIndex] = {
            id,
            title,
            description,
            image,
            datePosted: newsData[existingIndex].datePosted, // Keep original date
            eventDate,
            status
        };
    } else {
        // Add new news
        newsData.push({
            id,
            title,
            description,
            image,
            datePosted,
            eventDate,
            status
        });
    }
    
    // Update UI
    filterNews();
    closeNewsModal();
    
    // Show success message
    alert(`News post ${existingIndex !== -1 ? 'updated' : 'added'} successfully!`);
}

// Delete news
function deleteNews(newsId) {
    if (!confirm('Are you sure you want to delete this news post?')) return;
    
    const index = newsData.findIndex(n => n.id === newsId);
    if (index !== -1) {
        newsData.splice(index, 1);
        filterNews();
        alert('News post deleted successfully!');
    }
}

// Update stats cards
function updateStats() {
    const total = filteredNews.length;
    const published = filteredNews.filter(n => n.status === 'published').length;
    const draft = filteredNews.filter(n => n.status === 'draft').length;
    
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