// Initialize AOS
AOS.init({
  duration: 800,
  easing: "ease-in-out",
  once: true,
});

// Sample resources data
const resourcesData = [
  {
      id: "R001",
      name: "Deluxe Room",
      type: "room",
      capacity: 2,
      dayRate: 2500,
      nightRate: 3500,
      status: "available",
      description: "A comfortable deluxe room with modern amenities",
      images: ["/placeholder.svg?height=300&width=400", "/placeholder.svg?height=300&width=400"],
      equipment: ["King-size bed", "Modern bathroom", "Air conditioning", "WiFi", "TV"],
      latitude: 14.1132,
      longitude: 121.3734
  },
  {
      id: "R002",
      name: "Family Cottage",
      type: "cottage",
      capacity: 6,
      dayRate: 5000,
      nightRate: 7000,
      status: "occupied",
      description: "Spacious cottage perfect for family gatherings",
      images: ["/placeholder.svg?height=300&width=400"],
      equipment: ["3 bedrooms", "Living area", "Kitchenette", "Porch", "Garden view"],
      latitude: 14.1135,
      longitude: 121.3730
  },
  {
      id: "R003",
      name: "Bamboo Hut",
      type: "hut",
      capacity: 4,
      dayRate: 1800,
      nightRate: 2500,
      status: "reserved",
      description: "Traditional bamboo hut with natural ventilation",
      images: ["/placeholder.svg?height=300&width=400", "/placeholder.svg?height=300&width=400"],
      equipment: ["Bamboo furniture", "Mosquito net", "Fan", "Private area"],
      latitude: 14.1130,
      longitude: 121.3738
  },
  {
      id: "R004",
      name: "Pool Villa",
      type: "villa",
      capacity: 8,
      dayRate: 12000,
      nightRate: 15000,
      status: "available",
      description: "Luxurious villa with private pool and premium amenities",
      images: ["/placeholder.svg?height=300&width=400"],
      equipment: ["Private pool", "4 bedrooms", "Living room", "Kitchen", "Jacuzzi"],
      latitude: 14.1138,
      longitude: 121.3732
  },
  {
      id: "R005",
      name: "Picnic Table 1",
      type: "table",
      capacity: 6,
      dayRate: 500,
      nightRate: 800,
      status: "available",
      description: "Standard picnic table near the garden area",
      images: ["/placeholder.svg?height=300&width=400"],
      equipment: ["Table", "Bench", "Grill area", "Shade"],
      latitude: 14.1133,
      longitude: 121.3736
  },
  {
      id: "R006",
      name: "Infinity Pool",
      type: "pool",
      capacity: 20,
      dayRate: 2000,
      nightRate: 3000,
      status: "closed",
      description: "Stunning infinity pool with mountain view",
      images: ["/placeholder.svg?height=300&width=400", "/placeholder.svg?height=300&width=400"],
      equipment: ["Infinity edge", "Lounge chairs", "Pool bar", "Changing rooms"],
      latitude: 14.1136,
      longitude: 121.3731
  }
];

// Global variables
let currentPage = 1;
const recordsPerPage = 5;
let filteredResources = [];
let sortField = 'name';
let sortDirection = 'asc';
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
const resourceImages = document.getElementById('resourceImages');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  // Initialize data
  filteredResources = [...resourcesData];
  
  updateStats();
  sortResources();
  renderTable();
  setupEventListeners();
  initializeMap();
  
  console.log('Page initialized with', resourcesData.length, 'resources');
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
  
  // Sorting
  const sortableHeaders = document.querySelectorAll('th[data-sort]');
  if (sortableHeaders.length > 0) {
      sortableHeaders.forEach(th => {
          th.addEventListener('click', function() {
              const field = this.getAttribute('data-sort');
              sortResources(field);
          });
      });
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
  
  // Image preview
  if (resourceImages) {
      resourceImages.addEventListener('change', handleImageUpload);
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

// Sort resources by specified field
function sortResources(field = null) {
  if (field) {
      if (sortField === field) {
          // Toggle direction if same field
          sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
          // New field, default to ascending
          sortField = field;
          sortDirection = 'asc';
      }
  }
  
  filteredResources.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'name') {
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
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

// Filter resources based on filters
function filterResources() {
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
  const type = typeFilter ? typeFilter.value : 'all';
  const status = statusFilter ? statusFilter.value : 'all';
  
  filteredResources = resourcesData.filter(resource => {
      // Search filter
      const matchesSearch = 
          resource.name.toLowerCase().includes(searchTerm) ||
          resource.description.toLowerCase().includes(searchTerm);
      
      // Type filter
      const matchesType = type === 'all' || resource.type === type;
      
      // Status filter
      const matchesStatus = status === 'all' || resource.status === status;
      
      return matchesSearch && matchesType && matchesStatus;
  });
  
  currentPage = 1;
  sortResources();
  updateStats();
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
}

// Get type badge
function getTypeBadge(type) {
  if (type === 'room') {
      return `<span class="type-badge type-room">Room</span>`;
  } else if (type === 'cottage') {
      return `<span class="type-badge type-cottage">Cottage</span>`;
  } else if (type === 'hut') {
      return `<span class="type-badge type-hut">Hut</span>`;
  } else if (type === 'villa') {
      return `<span class="type-badge type-villa">Villa</span>`;
  } else if (type === 'table') {
      return `<span class="type-badge type-table">Table</span>`;
  } else if (type === 'pool') {
      return `<span class="type-badge type-pool">Pool</span>`;
  }
}

// Render the table with current data
function renderTable() {
  if (!resourcesTableBody) {
      console.error('Table body element not found');
      return;
  }
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredResources.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = Math.min(startIndex + recordsPerPage, filteredResources.length);
  const currentResources = filteredResources.slice(startIndex, endIndex);
  
  // Update showing records info
  if (showingFrom) showingFrom.textContent = filteredResources.length > 0 ? startIndex + 1 : 0;
  if (showingTo) showingTo.textContent = endIndex;
  if (totalRecords) totalRecords.textContent = filteredResources.length;
  
  // Clear table body
  resourcesTableBody.innerHTML = '';
  
  // Check if there are resources to display
  if (currentResources.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = `
          <td colspan="7" class="text-center py-8 text-gray-500">
              <i class="fas fa-building text-4xl mb-4 block"></i>
              No resources found matching your criteria
          </td>
      `;
      resourcesTableBody.appendChild(row);
      return;
  }
  
  // Populate table rows with AOS animations
  currentResources.forEach((resource, index) => {
      const row = document.createElement('tr');
      row.setAttribute('data-aos', 'fade-up');
      row.setAttribute('data-aos-delay', (index % 10) * 50);
      
      row.innerHTML = `
          <td class="font-medium">${resource.name}</td>
          <td>${getTypeBadge(resource.type)}</td>
          <td>${resource.capacity} persons</td>
          <td class="font-semibold">₱${resource.dayRate.toLocaleString()}</td>
          <td class="font-semibold">₱${resource.nightRate.toLocaleString()}</td>
          <td>${getStatusBadge(resource.status)}</td>
          <td>
              <div class="action-buttons">
                  <button class="edit-resource btn-primary text-sm" data-id="${resource.id}">
                      <i class="fas fa-edit mr-1"></i> Edit
                  </button>
                  <button class="change-status btn-secondary text-sm" data-id="${resource.id}">
                      <i class="fas fa-sync mr-1"></i> Status
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
  if (imagePreview) imagePreview.innerHTML = '';
  
  // Reset map to default position
  const defaultLat = 14.1134;
  const defaultLng = 121.3735;
  map.setView([defaultLat, defaultLng], 16);
  marker.setLatLng([defaultLat, defaultLng]);
  document.getElementById('latitude').value = defaultLat;
  document.getElementById('longitude').value = defaultLng;
  
  // Reset equipment list
  const equipmentList = document.getElementById('equipmentList');
  equipmentList.innerHTML = '<div class="equipment-item"><input type="text" class="form-input" placeholder="Add equipment or amenity"><button type="button" class="remove-equipment" onclick="removeEquipment(this)"><i class="fas fa-times"></i></button></div>';
  
  // Show modal
  if (resourceModal) resourceModal.classList.add('active');
}

// Open edit resource modal
function openEditResourceModal(resourceId) {
  const resource = resourcesData.find(r => r.id === resourceId);
  if (!resource) return;
  
  if (modalTitle) modalTitle.textContent = 'Edit Resource';
  if (resourceForm) {
      document.getElementById('resourceId').value = resource.id;
      document.getElementById('resourceName').value = resource.name;
      document.getElementById('resourceType').value = resource.type;
      document.getElementById('capacity').value = resource.capacity;
      document.getElementById('status').value = resource.status;
      document.getElementById('dayRate').value = resource.dayRate;
      document.getElementById('nightRate').value = resource.nightRate;
      document.getElementById('description').value = resource.description;
      document.getElementById('latitude').value = resource.latitude;
      document.getElementById('longitude').value = resource.longitude;
  }
  
  // Update map position
  map.setView([resource.latitude, resource.longitude], 16);
  marker.setLatLng([resource.latitude, resource.longitude]);
  
  // Update image preview
  if (imagePreview) {
      imagePreview.innerHTML = '';
      resource.images.forEach(image => {
          const imgElement = document.createElement('div');
          imgElement.className = 'image-preview-item';
          imgElement.innerHTML = `
              <img src="${image}" alt="Preview">
              <button type="button" class="remove-image" onclick="removePreviewImage(this)">
                  <i class="fas fa-times"></i>
              </button>
          `;
          imagePreview.appendChild(imgElement);
      });
  }
  
  // Update equipment list
  const equipmentList = document.getElementById('equipmentList');
  equipmentList.innerHTML = '';
  resource.equipment.forEach(equipment => {
      addEquipment(equipment);
  });
  
  // Show modal
  if (resourceModal) resourceModal.classList.add('active');
}

// Close resource modal
function closeResourceModal() {
  if (resourceModal) {
      resourceModal.classList.remove('active');
  }
}

// Handle image upload
function handleImageUpload(event) {
  const files = event.target.files;
  if (!imagePreview) return;
  
  for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      
      reader.onload = function(e) {
          const imgElement = document.createElement('div');
          imgElement.className = 'image-preview-item';
          imgElement.innerHTML = `
              <img src="${e.target.result}" alt="Preview">
              <button type="button" class="remove-image" onclick="removePreviewImage(this)">
                  <i class="fas fa-times"></i>
              </button>
          `;
          imagePreview.appendChild(imgElement);
      }
      
      reader.readAsDataURL(file);
  }
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
      <input type="text" class="form-input" placeholder="Add equipment or amenity" value="${value}">
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
function saveResource(event) {
  event.preventDefault();
  
  // Get form data
  const id = document.getElementById('resourceId').value || 'R' + String(resourcesData.length + 1).padStart(3, '0');
  const name = document.getElementById('resourceName').value;
  const type = document.getElementById('resourceType').value;
  const capacity = parseInt(document.getElementById('capacity').value);
  const status = document.getElementById('status').value;
  const dayRate = parseFloat(document.getElementById('dayRate').value);
  const nightRate = parseFloat(document.getElementById('nightRate').value);
  const description = document.getElementById('description').value;
  const latitude = parseFloat(document.getElementById('latitude').value);
  const longitude = parseFloat(document.getElementById('longitude').value);
  
  // Get equipment
  const equipment = [];
  document.querySelectorAll('#equipmentList input').forEach(input => {
      if (input.value.trim() !== '') {
          equipment.push(input.value.trim());
      }
  });
  
  // Get images (in a real app, you would upload these to a server)
  const images = [];
  document.querySelectorAll('#imagePreview img').forEach(img => {
      images.push(img.src);
  });
  
  // Check if we're editing or adding
  const existingIndex = resourcesData.findIndex(r => r.id === id);
  
  if (existingIndex !== -1) {
      // Update existing resource
      resourcesData[existingIndex] = {
          id,
          name,
          type,
          capacity,
          dayRate,
          nightRate,
          status,
          description,
          images: images.length > 0 ? images : resourcesData[existingIndex].images,
          equipment,
          latitude,
          longitude
      };
  } else {
      // Add new resource
      resourcesData.push({
          id,
          name,
          type,
          capacity,
          dayRate,
          nightRate,
          status,
          description,
          images: images.length > 0 ? images : ['/placeholder.svg?height=300&width=400'],
          equipment,
          latitude,
          longitude
      });
  }
  
  // Update UI
  filterResources();
  closeResourceModal();
  
  // Show success message
  alert(`Resource ${existingIndex !== -1 ? 'updated' : 'added'} successfully!`);
}

// Change resource status
function changeResourceStatus(resourceId) {
  const resource = resourcesData.find(r => r.id === resourceId);
  if (!resource) return;
  
  // Cycle through statuses
  const statuses = ['available', 'occupied', 'reserved', 'closed'];
  const currentIndex = statuses.indexOf(resource.status);
  const nextIndex = (currentIndex + 1) % statuses.length;
  resource.status = statuses[nextIndex];
  
  // Update UI
  filterResources();
  
  // Show status change message
  alert(`Resource status changed to ${resource.status}`);
}

// Update stats cards
function updateStats() {
  const total = filteredResources.length;
  const available = filteredResources.filter(r => r.status === 'available').length;
  const occupied = filteredResources.filter(r => r.status === 'occupied').length;
  const maintenance = filteredResources.filter(r => r.status === 'closed').length;
  
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
      document.getElementById('maintenanceResources').textContent = maintenance;
  }
}