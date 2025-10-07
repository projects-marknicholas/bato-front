// Initialize AOS
AOS.init({
    duration: 800,
    easing: "ease-in-out",
    once: true,
});

// API Configuration
const API_BASE_URL = window.CONFIG.API_BASE_URL;
const ENDPOINT_URL = window.CONFIG.ENDPOINTS.GUEST_PROFILE;
let userData = null;

// DOM Elements
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const profileForm = document.getElementById('profileForm');
const cancelBtn = document.getElementById('cancelBtn');
const profileImage = document.getElementById('profileImage');
const profilePicture = document.getElementById('profilePicture');
const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');
const profileRole = document.getElementById('profileRole');
const headerName = document.getElementById('headerName');
const headerRole = document.getElementById('headerRole');
const fullNameInput = document.getElementById('fullName');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const addressInput = document.getElementById('address');

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
    
    // Form submission
    if (profileForm) {
        profileForm.addEventListener('submit', saveProfile);
    }
    
    // Cancel button
    if (cancelBtn) {
        cancelBtn.addEventListener('click', resetForm);
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
        await loadUserProfile();
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showError('Failed to load profile data');
    }
}

// Check if user is authenticated
function checkAuthentication() {
    const apiKey = getApiKey();
    const csrfToken = getCsrfToken();
    
    if (!apiKey || !csrfToken) {
        // Redirect to login if not authenticated
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

// Get complete user data from localStorage
function getUserData() {
    try {
        const userData = localStorage.getItem('user');
        if (userData) {
            return JSON.parse(userData);
        }
    } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
    }
    return null;
}

// Update user data in localStorage
function updateUserData(updatedFields) {
    try {
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            const updatedUser = { ...user, ...updatedFields };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            return updatedUser;
        }
    } catch (error) {
        console.error('Error updating user data in localStorage:', error);
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
            // Unauthorized - redirect to login
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

// Load user profile from backend
async function loadUserProfile() {
    try {
        showLoadingState();
        
        const data = await makeApiRequest(ENDPOINT_URL);
        
        if (data && data.success) {
            userData = data.data;
            updateUIWithProfileData();
        } else {
            throw new Error('Failed to load profile data');
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showError('Failed to load profile data: ' + error.message);
    }
}

// Update UI with profile data
function updateUIWithProfileData() {
    if (!userData) return;

    // Update profile image - use the profile URL from Google
    const profilePic = userData.profile || "/placeholder.svg?height=150&width=150";
    if (profileImage) profileImage.src = profilePic;
    if (profilePicture) profilePicture.src = profilePic;

    // Update text content
    const fullName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'No Name';
    if (profileName) profileName.textContent = fullName;
    if (profileEmail) profileEmail.textContent = userData.email_address || 'No email';
    if (profileRole) profileRole.textContent = `Role: ${(userData.role || 'user').charAt(0).toUpperCase() + (userData.role || 'user').slice(1)}`;
    if (headerName) headerName.textContent = fullName;
    if (headerRole) headerRole.textContent = (userData.role || 'user').charAt(0).toUpperCase() + (userData.role || 'user').slice(1);
    
    // Update form inputs
    if (fullNameInput) fullNameInput.value = fullName;
    if (emailInput) emailInput.value = userData.email_address || '';
    if (phoneInput) phoneInput.value = userData.phone_number || '';
    if (addressInput) addressInput.value = userData.address || '';

    hideLoadingState();
}

// Save profile changes
async function saveProfile(event) {
    event.preventDefault();
    
    try {
        showLoadingState('Saving changes...');
        
        const updates = {};
        
        // Only include fields that have changed and are allowed
        if (phoneInput && phoneInput.value !== (userData.phone_number || '')) {
            updates.phone_number = phoneInput.value.trim();
        }
        
        if (addressInput && addressInput.value !== (userData.address || '')) {
            updates.address = addressInput.value.trim();
        }
        
        // Split full name into first and last name if changed
        if (fullNameInput && fullNameInput.value !== `${userData.first_name || ''} ${userData.last_name || ''}`.trim()) {
            const names = fullNameInput.value.trim().split(' ');
            updates.first_name = names[0] || '';
            updates.last_name = names.slice(1).join(' ') || '';
        }

        if (Object.keys(updates).length === 0) {
            hideLoadingState();
            showSuccess('No changes to save');
            return;
        }

        // Use PUT method as defined in your backend route
        const data = await makeApiRequest(ENDPOINT_URL, {
            method: 'PUT', // Changed from POST to PUT
            body: updates
        });

        if (data && data.success) {
            // Update local userData with the response
            userData = { ...userData, ...data.data };
            
            // Also update localStorage with the new data
            updateUserData(data.data);
            
            updateUIWithProfileData();
            showSuccess('Profile updated successfully!');
        } else {
            throw new Error('Failed to update profile');
        }
    } catch (error) {
        console.error('Error saving profile:', error);
        showError('Failed to update profile: ' + error.message);
    } finally {
        hideLoadingState();
    }
}

// Reset form to original values
function resetForm() {
    if (!userData) return;
    
    const fullName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
    if (fullNameInput) fullNameInput.value = fullName;
    if (emailInput) emailInput.value = userData.email_address || '';
    if (phoneInput) phoneInput.value = userData.phone_number || '';
    if (addressInput) addressInput.value = userData.address || '';
}

// UI Helper Functions
function showLoadingState(message = 'Loading...') {
    // Example: show a loading spinner in the submit button
    const submitBtn = profileForm.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + message;
    }
}

function hideLoadingState() {
    // Hide loading spinner
    const submitBtn = profileForm.querySelector('button[type="submit"]');
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

function showConfirm(message) {
    return Swal.fire({
        icon: 'question',
        title: 'Are you sure?',
        text: message,
        showCancelButton: true,
        confirmButtonText: 'Yes, continue',
        cancelButtonText: 'Cancel',
        reverseButtons: true
    });
}

// Handle page visibility change to refresh data when tab becomes active
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && userData) {
        loadUserProfile();
    }
});