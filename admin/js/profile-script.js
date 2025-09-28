// Initialize AOS
AOS.init({
    duration: 800,
    easing: "ease-in-out",
    once: true,
});

// Sample user data (to be replaced by Google Sign-In data)
let userData = {
    id: "USER001",
    name: "John Doe",
    email: "john.doe@example.com",
    picture: "/placeholder.svg?height=150&width=150",
    role: "admin",
    phone: "",
    address: ""
};

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
    // Simulate Google Sign-In data loading
    loadUserProfile();
    setupEventListeners();
    
    console.log('Profile page initialized');
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

// Load user profile data
function loadUserProfile() {
    // In a real implementation, this would use Google Sign-In API
    // For demo purposes, using sample data
    if (userData) {
        if (profileImage) profileImage.src = userData.picture;
        if (profilePicture) profilePicture.src = userData.picture;
        if (profileName) profileName.textContent = userData.name;
        if (profileEmail) profileEmail.textContent = userData.email;
        if (profileRole) profileRole.textContent = `Role: ${userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}`;
        if (headerName) headerName.textContent = userData.name;
        if (headerRole) headerRole.textContent = userData.role.charAt(0).toUpperCase() + userData.role.slice(1);
        
        if (fullNameInput) fullNameInput.value = userData.name;
        if (emailInput) emailInput.value = userData.email;
        if (phoneInput) phoneInput.value = userData.phone || '';
        if (addressInput) addressInput.value = userData.address || '';
    }
}

// Save profile changes
function saveProfile(event) {
    event.preventDefault();
    
    // Update user data with editable fields
    userData.phone = phoneInput ? phoneInput.value : userData.phone;
    userData.address = addressInput ? addressInput.value : userData.address;
    
    // In a real implementation, save to backend or Google profile
    console.log('Profile updated:', userData);
    
    // Show success message
    alert('Profile updated successfully!');
}

// Reset form to original values
function resetForm() {
    if (fullNameInput) fullNameInput.value = userData.name;
    if (emailInput) emailInput.value = userData.email;
    if (phoneInput) phoneInput.value = userData.phone || '';
    if (addressInput) addressInput.value = userData.address || '';
}

// Simulated Google Sign-In callback (for demo purposes)
function handleGoogleSignIn(response) {
    // In a real implementation, decode the JWT token from response.credential
    // For demo, we'll use the sample data
    userData = {
        id: "USER001",
        name: response.name || "John Doe",
        email: response.email || "john.doe@example.com",
        picture: response.picture || "/placeholder.svg?height=150&width=150",
        role: "admin",
        phone: "",
        address: ""
    };
    loadUserProfile();
}