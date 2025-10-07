// Initialize AOS
AOS.init({
    duration: 800,
    easing: "ease-in-out",
    once: true,
});

// API Configuration
const API_BASE_URL = window.CONFIG.API_BASE_URL;
const ENDPOINT_URL = window.CONFIG.ENDPOINTS.ADMIN_RESOURCES;

// Global variables
let currentPage = 1;
const recordsPerPage = 10;
let allResources = [];
let filteredResources = [];
let map, marker;

// DOM Elements
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const searchInput = document.getElementById('searchInput');
const typeFilter = document.getElementById('typeFilter');
const statusFilter = document.getElementById('statusFilter');
const resourcesTableBody = document.getElementById('resourcesTableBody');
const pagination = document.getElementById('pagination');
const showingFrom = document.getElementById('showingFrom');
const showingTo = document.getElementById('showingTo');
const totalRecords = document.getElementById('totalRecords');
const resourceModal = document.getElementById('resourceModal');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const addResourceBtn = document.getElementById('addResourceBtn');
const resourceForm = document.getElementById('resourceForm');
const modalTitle = document.getElementById('modalTitle');
const imagePreview = document.getElementById('imagePreview');
const imageUrlInput = document.getElementById('imageUrlInput');
const addImageBtn = document.getElementById('addImageBtn');

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
        searchInput.addEventListener('input', filterResources);
    }
    if (typeFilter) {
        typeFilter.addEventListener('change', filterResources);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', filterResources);
    }
    
    // Modal
    if (closeModal) {
        closeModal.addEventListener('click', closeResourceModal);
    }
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeResourceModal);
    }
    
    // Add resource button
    if (addResourceBtn) {
        addResourceBtn.addEventListener('click', openAddResourceModal);
    }
    
    // Form submission
    if (resourceForm) {
        resourceForm.addEventListener('submit', saveResource);
    }
    
    // Add image button
    if (addImageBtn) {
        addImageBtn.addEventListener('click', addImageFromUrl);
    }
    
    // Enter key for image URL input
    if (imageUrlInput) {
        imageUrlInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addImageFromUrl();
            }
        });
    }
    
    // Close modal when clicking outside
    if (resourceModal) {
        resourceModal.addEventListener('click', function(e) {
            if (e.target === resourceModal) {
                closeResourceModal();
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
        await loadResources();
        initializeMap();
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showError('Failed to load resources data');
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

// Load resources from backend
async function loadResources() {
    try {
        showLoadingState('Loading resources...');
        
        // Build query parameters
        const params = new URLSearchParams();
        params.append('page', currentPage);
        params.append('limit', recordsPerPage);
        
        if (searchInput && searchInput.value) {
            params.append('search', searchInput.value);
        }
        
        if (typeFilter && typeFilter.value && typeFilter.value !== 'all') {
            params.append('resource_type', typeFilter.value);
        }
        
        if (statusFilter && statusFilter.value && statusFilter.value !== 'all') {
            params.append('status', statusFilter.value);
        }
        
        const data = await makeApiRequest(`${ENDPOINT_URL}?${params.toString()}`);
        
        if (data && data.success) {
            allResources = data.data || [];
            filteredResources = [...allResources];
            
            updateStats();
            renderTable(data.pagination);
        } else {
            throw new Error('Failed to load resources data');
        }
    } catch (error) {
        console.error('Error loading resources:', error);
        showError('Failed to load resources: ' + error.message);
        
        // Show empty state
        allResources = [];
        filteredResources = [];
        updateStats();
        renderTable();
    } finally {
        hideLoadingState();
    }
}

// Filter resources based on filters
function filterResources() {
    currentPage = 1;
    loadResources();
}

// Get status badge
function getStatusBadge(status) {
    if (status === 'available') {
        return `<span class="status-badge status-available">Available</span>`;
    } else if (status === 'occupied') {
        return `<span class="status-badge status-occupied">Occupied</span>`;
    } else if (status === 'reserved') {
        return `<span class="status-badge status-reserved">Reserved</span>`;
    } else if (status === 'closed') {
        return `<span class="status-badge status-closed">Closed</span>`;
    }
    return `<span class="status-badge">${status}</span>`;
}

// Get type badge
function getTypeBadge(type) {
    const types = {
        'room': { class: 'type-room', label: 'Room' },
        'cottage': { class: 'type-cottage', label: 'Cottage' },
        'hut': { class: 'type-hut', label: 'Hut' },
        'villa': { class: 'type-villa', label: 'Villa' },
        'table': { class: 'type-table', label: 'Table' },
        'pool': { class: 'type-pool', label: 'Pool' }
    };
    
    const typeInfo = types[type.toLowerCase()] || { class: 'type-other', label: type };
    return `<span class="type-badge ${typeInfo.class}">${typeInfo.label}</span>`;
}

// Format currency for display
function formatCurrency(amount) {
    return `₱${parseFloat(amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
    if (!resourcesTableBody) {
        console.error('Table body element not found');
        return;
    }
    
    // Clear table body
    resourcesTableBody.innerHTML = '';
    
    // Check if there are resources to display
    if (!filteredResources || filteredResources.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="7" class="text-center py-8 text-gray-500">
                <i class="fas fa-building text-4xl mb-4 block"></i>
                No resources found
            </td>
        `;
        resourcesTableBody.appendChild(row);
        
        // Update showing records info
        updateShowingInfo(0, paginationData);
        return;
    }
    
    // Populate table rows
    filteredResources.forEach((resource, index) => {
        const row = document.createElement('tr');
        const resourceId = resource.resource_id;
        const name = resource.resource_name || '';
        const type = resource.resource_type || '';
        const capacity = resource.capacity || 0;
        const dayRate = resource.day_rate || 0;
        const nightRate = resource.night_rate || 0;
        const status = resource.status || 'available';
        
        row.innerHTML = `
            <td class="font-medium">${name}</td>
            <td>${getTypeBadge(type)}</td>
            <td>${capacity} persons</td>
            <td class="font-semibold">${formatCurrency(dayRate)}</td>
            <td class="font-semibold">${formatCurrency(nightRate)}</td>
            <td>${getStatusBadge(status)}</td>
            <td>
                <div class="action-buttons">
                    <button class="edit-resource btn-primary text-sm" data-id="${resourceId}">
                        <i class="fas fa-edit mr-1"></i> Edit
                    </button>
                </div>
            </td>
        `;
        resourcesTableBody.appendChild(row);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit-resource').forEach(button => {
        button.addEventListener('click', function() {
            const resourceId = this.getAttribute('data-id');
            openEditResourceModal(resourceId);
        });
    });
    
    document.querySelectorAll('.change-status').forEach(button => {
        button.addEventListener('click', function() {
            const resourceId = this.getAttribute('data-id');
            changeResourceStatus(resourceId);
        });
    });
    
    // Update showing info and pagination
    updateShowingInfo(filteredResources.length, paginationData);
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
            loadResources();
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
            loadResources();
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
            loadResources();
        }
    });
    pagination.appendChild(nextButton);
}

// Initialize map
function initializeMap() {
    // Default coordinates for Bato Spring Resort (approximate)
    const defaultLat = 14.1134;
    const defaultLng = 121.3735;
    
    // Initialize map
    map = L.map('resourceMap').setView([defaultLat, defaultLng], 16);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Add default marker
    marker = L.marker([defaultLat, defaultLng], {draggable: true}).addTo(map);
    
    // Update coordinates when marker is dragged
    marker.on('dragend', function(event) {
        const position = marker.getLatLng();
        document.getElementById('latitude').value = position.lat;
        document.getElementById('longitude').value = position.lng;
    });
    
    // Set initial coordinates
    document.getElementById('latitude').value = defaultLat;
    document.getElementById('longitude').value = defaultLng;
}

// Open add resource modal
function openAddResourceModal() {
    if (modalTitle) modalTitle.textContent = 'Add New Resource';
    if (resourceForm) resourceForm.reset();
    document.getElementById('resourceId').value = '';
    document.getElementById('resourceName').value = '';
    document.getElementById('resourceType').selectedIndex = 0;
    document.getElementById('capacity').value = '';
    document.getElementById('status').selectedIndex = 0;
    document.getElementById('dayRate').value = '';
    document.getElementById('nightRate').value = '';
    document.getElementById('description').value = '';
    if (imagePreview) imagePreview.innerHTML = '';
    if (imageUrlInput) imageUrlInput.value = '';
    
    // Reset map to default position
    const defaultLat = 14.1134;
    const defaultLng = 121.3735;
    if (map && marker) {
        map.setView([defaultLat, defaultLng], 16);
        marker.setLatLng([defaultLat, defaultLng]);
        document.getElementById('latitude').value = defaultLat;
        document.getElementById('longitude').value = defaultLng;
    }
    
    // Reset amenities list
    const amenitiesList = document.getElementById('equipmentList');
    amenitiesList.innerHTML = '<div class="equipment-item"><input type="text" class="form-input" placeholder="Add amenity"><button type="button" class="remove-equipment" onclick="removeEquipment(this)"><i class="fas fa-times"></i></button></div>';
    
    // Show modal
    if (resourceModal) resourceModal.classList.add('active');
}

// Open edit resource modal
async function openEditResourceModal(resourceId) {
    try {
        showLoadingState('Loading resource...');
        
        // Find resource in current data
        const resource = allResources.find(r => r.resource_id === resourceId);
        if (!resource) {
            throw new Error('Resource not found');
        }
        
        if (modalTitle) modalTitle.textContent = 'Edit Resource';
        if (resourceForm) {
            document.getElementById('resourceId').value = resource.resource_id;
            document.getElementById('resourceName').value = resource.resource_name;
            document.getElementById('resourceType').value = resource.resource_type.toLowerCase();
            document.getElementById('capacity').value = resource.capacity;
            document.getElementById('status').value = resource.status;
            document.getElementById('dayRate').value = resource.day_rate;
            document.getElementById('nightRate').value = resource.night_rate;
            document.getElementById('description').value = resource.description;
            document.getElementById('latitude').value = resource.latitude;
            document.getElementById('longitude').value = resource.longitude;
        }
        
        // Update map position
        if (map && marker) {
            const lat = parseFloat(resource.latitude) || 14.1134;
            const lng = parseFloat(resource.longitude) || 121.3735;
            map.setView([lat, lng], 16);
            marker.setLatLng([lat, lng]);
        }
        
        // Update image preview
        if (imagePreview) {
            imagePreview.innerHTML = '';
            if (resource.images && resource.images.length > 0) {
                resource.images.forEach(image => {
                    addImageToPreview(image);
                });
            }
        }
        
        // Update amenities list
        const amenitiesList = document.getElementById('equipmentList');
        amenitiesList.innerHTML = '';
        if (resource.ammenities && resource.ammenities.length > 0) {
            resource.ammenities.forEach(amenity => {
                addEquipment(amenity);
            });
        } else {
            addEquipment();
        }
        
        // Show modal
        if (resourceModal) resourceModal.classList.add('active');
    } catch (error) {
        console.error('Error opening edit modal:', error);
        showError('Failed to load resource: ' + error.message);
    } finally {
        hideLoadingState();
    }
}

// Close resource modal
function closeResourceModal() {
    if (resourceModal) {
        resourceModal.classList.remove('active');
    }
}

// Add image from URL
function addImageFromUrl() {
    const url = imageUrlInput ? imageUrlInput.value.trim() : '';
    
    if (!url) {
        showError('Please enter an image URL');
        return;
    }
    
    // Basic URL validation
    try {
        new URL(url);
    } catch (e) {
        showError('Please enter a valid URL');
        return;
    }
    
    addImageToPreview(url);
    
    // Clear the input
    if (imageUrlInput) {
        imageUrlInput.value = '';
    }
}

// Add image to preview
function addImageToPreview(imageUrl) {
    if (!imagePreview) return;
    
    const imgElement = document.createElement('div');
    imgElement.className = 'image-preview-item';
    imgElement.innerHTML = `
        <img src="${imageUrl}" alt="Preview" onerror="this.style.display='none'">
        <button type="button" class="remove-image" onclick="removePreviewImage(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    imagePreview.appendChild(imgElement);
}

// Remove preview image
function removePreviewImage(button) {
    button.parentElement.remove();
}

// Add equipment field
function addEquipment(value = '') {
    const equipmentList = document.getElementById('equipmentList');
    const equipmentItem = document.createElement('div');
    equipmentItem.className = 'equipment-item';
    equipmentItem.innerHTML = `
        <input type="text" class="form-input" placeholder="Add amenity" value="${value}">
        <button type="button" class="remove-equipment" onclick="removeEquipment(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    equipmentList.appendChild(equipmentItem);
}

// Remove equipment field
function removeEquipment(button) {
    // Don't remove if it's the last item
    if (document.querySelectorAll('.equipment-item').length > 1) {
        button.parentElement.remove();
    }
}

// Save resource (add or update)
async function saveResource(event) {
    event.preventDefault();
    
    try {
        showLoadingState('Saving resource...');
        
        // Get form data
        const resourceId = document.getElementById('resourceId').value;
        const resourceName = document.getElementById('resourceName').value;
        const resourceType = document.getElementById('resourceType').value;
        const capacity = parseInt(document.getElementById('capacity').value);
        const status = document.getElementById('status').value;
        const dayRate = parseFloat(document.getElementById('dayRate').value);
        const nightRate = parseFloat(document.getElementById('nightRate').value);
        const description = document.getElementById('description').value;
        const latitude = parseFloat(document.getElementById('latitude').value);
        const longitude = parseFloat(document.getElementById('longitude').value);
        
        // Get amenities
        const amenities = [];
        document.querySelectorAll('#equipmentList input').forEach(input => {
            if (input.value.trim() !== '') {
                amenities.push(input.value.trim());
            }
        });
        
        // Get images from preview
        const images = [];
        document.querySelectorAll('#imagePreview img').forEach(img => {
            images.push(img.src);
        });
        
        const resourceData = {
            resource_name: resourceName.trim(),
            resource_type: resourceType,
            capacity: capacity,
            status: status,
            day_rate: dayRate,
            night_rate: nightRate,
            description: description.trim(),
            latitude: latitude,
            longitude: longitude,
            images: images,
            ammenities: amenities
        };
        
        let data;
        
        if (resourceId) {
            // Update existing resource
            resourceData.resource_id = resourceId;
            data = await makeApiRequest(ENDPOINT_URL, {
                method: 'PUT',
                body: resourceData
            });
        } else {
            // Create new resource
            data = await makeApiRequest(ENDPOINT_URL, {
                method: 'POST',
                body: resourceData
            });
        }
        
        if (data && data.success) {
            showSuccess(`Resource ${resourceId ? 'updated' : 'created'} successfully!`);
            closeResourceModal();
            await loadResources(); // Reload resources list
        } else {
            throw new Error('Failed to save resource');
        }
    } catch (error) {
        console.error('Error saving resource:', error);
        showError('Failed to save resource: ' + error.message);
    } finally {
        hideLoadingState();
    }
}

// Change resource status
async function changeResourceStatus(resourceId) {
    const resource = allResources.find(r => r.resource_id === resourceId);
    if (!resource) return;
    
    // Cycle through statuses
    const statuses = ['available', 'occupied', 'reserved', 'closed'];
    const currentIndex = statuses.indexOf(resource.status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    const newStatus = statuses[nextIndex];
    
    try {
        showLoadingState('Updating status...');
        
        const data = await makeApiRequest(ENDPOINT_URL, {
            method: 'PUT',
            body: {
                resource_id: resourceId,
                status: newStatus
            }
        });
        
        if (data && data.success) {
            showSuccess(`Resource status changed to ${newStatus}`);
            await loadResources(); // Reload resources list
        } else {
            throw new Error('Failed to update status');
        }
    } catch (error) {
        console.error('Error updating status:', error);
        showError('Failed to update status: ' + error.message);
    } finally {
        hideLoadingState();
    }
}

// Update stats cards
function updateStats() {
    const total = filteredResources.length;
    const available = filteredResources.filter(r => r.status === 'available').length;
    const occupied = filteredResources.filter(r => r.status === 'occupied').length;
    const closed = filteredResources.filter(r => r.status === 'closed').length;
    
    if (document.getElementById('totalResources')) {
        document.getElementById('totalResources').textContent = total;
    }
    if (document.getElementById('availableResources')) {
        document.getElementById('availableResources').textContent = available;
    }
    if (document.getElementById('occupiedResources')) {
        document.getElementById('occupiedResources').textContent = occupied;
    }
    if (document.getElementById('maintenanceResources')) {
        document.getElementById('maintenanceResources').textContent = closed;
    }
}

// UI Helper Functions
function showLoadingState(message = 'Loading...') {
    const submitBtn = resourceForm?.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + message;
    }
}

function hideLoadingState() {
    const submitBtn = resourceForm?.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Save Resource';
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