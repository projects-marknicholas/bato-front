// Simple User Header - Populate name, role, and profile picture
document.addEventListener('DOMContentLoaded', function() {
    // Get user data from localStorage
    const userData = getUserData();
    
    // Update the header with user data
    updateUserHeader(userData);
});

function getUserData() {
    try {
        const userData = localStorage.getItem('user');
        if (userData) {
            return JSON.parse(userData);
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
    
    // Return default data if no user data found
    return {
        first_name: 'Admin',
        last_name: 'User', 
        role: 'Administrator',
        profile: null
    };
}

function updateUserHeader(userData) {
    // Update profile picture
    updateProfilePicture(userData);
    
    // Update name and role
    updateUserInfo(userData);
}

function updateProfilePicture(userData) {
    const profileImg = document.querySelector('.flex.items-center.gap-3 img.w-10.h-10.rounded-full');
    
    if (profileImg && userData.profile) {
        // Use the profile picture from user data
        profileImg.src = userData.profile;
        profileImg.alt = `${userData.first_name || 'Admin'} ${userData.last_name || 'User'}`;
    } else if (profileImg) {
        // Generate initials avatar if no profile picture
        profileImg.src = generateInitialsAvatar(userData);
        profileImg.alt = `${userData.first_name || 'Admin'} ${userData.last_name || 'User'}`;
    }
}

function generateInitialsAvatar(userData) {
    const firstName = userData.first_name || 'Admin';
    const lastName = userData.last_name || 'User';
    const initials = `${firstName[0]}${lastName[0]}`.toUpperCase();
    
    // Create a simple colored avatar with initials
    const canvas = document.createElement('canvas');
    canvas.width = 40;
    canvas.height = 40;
    const ctx = canvas.getContext('2d');
    
    // Background color
    const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#EF4444', '#F59E0B'];
    const colorIndex = (firstName.length + lastName.length) % colors.length;
    ctx.fillStyle = colors[colorIndex];
    ctx.fillRect(0, 0, 40, 40);
    
    // White text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, 20, 20);
    
    return canvas.toDataURL();
}

function updateUserInfo(userData) {
    // Find the user info section
    const userInfoSection = document.querySelector('.flex.items-center.gap-3 .hidden.md\\:block');
    
    if (userInfoSection) {
        // Update name
        const nameElement = userInfoSection.querySelector('.font-semibold.text-gray-800');
        if (nameElement) {
            const fullName = `${userData.first_name || 'Admin'} ${userData.last_name || 'User'}`;
            nameElement.textContent = fullName.trim();
        }
        
        // Update role
        const roleElement = userInfoSection.querySelector('.text-sm.text-gray-600');
        if (roleElement) {
            roleElement.textContent = userData.role || 'Administrator';
        }
    }
}