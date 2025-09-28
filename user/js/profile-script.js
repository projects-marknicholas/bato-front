// Profile Settings JavaScript
document.addEventListener("DOMContentLoaded", () => {
  let addressMap
  let addressMarker
  let selectedCoordinates = null
  const L = window.L // Declare the L variable

  // Initialize
  init()

  function init() {
    setupEventListeners()
    loadUserData()
  }

  function setupEventListeners() {
    // Tab switching
    document.querySelectorAll(".profile-tab").forEach((tab) => {
      tab.addEventListener("click", function () {
        const tabName = this.dataset.tab
        switchTab(tabName)
      })
    })

    // Form submissions
    document.getElementById("personalForm").addEventListener("submit", handlePersonalFormSubmit)
    document.getElementById("contactForm").addEventListener("submit", handleContactFormSubmit)
    document.getElementById("preferencesForm").addEventListener("submit", handlePreferencesFormSubmit)

    // Address map modal
    document.getElementById("mapAddressBtn").addEventListener("click", openAddressModal)
    document.getElementById("closeAddressModal").addEventListener("click", closeAddressModal)
    document.getElementById("cancelAddressSelection").addEventListener("click", closeAddressModal)
    document.getElementById("confirmAddressSelection").addEventListener("click", confirmAddressSelection)
    document.getElementById("searchAddressBtn").addEventListener("click", searchAddress)
    document.getElementById("addressSearch").addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault()
        searchAddress()
      }
    })

    // Modal overlay click
    document.getElementById("addressMapModal").addEventListener("click", function (e) {
      if (e.target === this) closeAddressModal()
    })
  }

  function loadUserData() {
    // Simulate loading user data from Google Sign-in
    const userData = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@gmail.com",
      profileImage: "/placeholder.svg?height=120&width=120",
      phoneNumber: "+63 917 123 4567",
      city: "San Pablo City",
      province: "Laguna",
      postalCode: "4000",
      country: "philippines",
    }

    // Populate form fields
    document.getElementById("firstName").value = userData.firstName
    document.getElementById("lastName").value = userData.lastName
    document.getElementById("email").value = userData.email
    document.getElementById("profileImage").src = userData.profileImage
    document.getElementById("profileName").textContent = `${userData.firstName} ${userData.lastName}`
    document.getElementById("profileEmail").textContent = userData.email
    document.getElementById("phoneNumber").value = userData.phoneNumber
    document.getElementById("city").value = userData.city
    document.getElementById("province").value = userData.province
    document.getElementById("postalCode").value = userData.postalCode
    document.getElementById("country").value = userData.country

    console.log("[v0] User data loaded successfully")
  }

  function switchTab(tabName) {
    // Update active tab
    document.querySelectorAll(".profile-tab").forEach((tab) => tab.classList.remove("active"))
    document.querySelector(`[data-tab="${tabName}"]`).classList.add("active")

    // Show corresponding content
    document.querySelectorAll(".tab-content").forEach((content) => content.classList.remove("active"))
    document.getElementById(`${tabName}Tab`).classList.add("active")
  }

  function handlePersonalFormSubmit(e) {
    e.preventDefault()

    const formData = {
      birthDate: document.getElementById("birthDate").value,
      gender: document.getElementById("gender").value,
      nationality: document.getElementById("nationality").value,
    }

    console.log("[v0] Personal information updated:", formData)
    showSuccessMessage("Personal information updated successfully!")
  }

  function handleContactFormSubmit(e) {
    e.preventDefault()

    const formData = {
      phoneNumber: document.getElementById("phoneNumber").value,
      altPhone: document.getElementById("altPhone").value,
      completeAddress: document.getElementById("completeAddress").value,
      city: document.getElementById("city").value,
      province: document.getElementById("province").value,
      postalCode: document.getElementById("postalCode").value,
      country: document.getElementById("country").value,
      coordinates: selectedCoordinates,
    }

    console.log("[v0] Contact details updated:", formData)
    showSuccessMessage("Contact details updated successfully!")
  }

  function handlePreferencesFormSubmit(e) {
    e.preventDefault()

    const formData = {
      emailNotifications: document.getElementById("emailNotifications").checked,
      smsNotifications: document.getElementById("smsNotifications").checked,
      marketingNotifications: document.getElementById("marketingNotifications").checked,
      language: document.getElementById("language").value,
      currency: document.getElementById("currency").value,
      preferredRoom: document.getElementById("preferredRoom").value,
      groupSize: document.getElementById("groupSize").value,
      dataCollection: document.getElementById("dataCollection").checked,
    }

    console.log("[v0] Preferences updated:", formData)
    showSuccessMessage("Preferences updated successfully!")
  }

  function openAddressModal() {
    document.getElementById("addressMapModal").classList.add("active")

    // Initialize map if not already done
    if (!addressMap) {
      setTimeout(() => {
        initializeAddressMap()
      }, 100)
    }
  }

  function closeAddressModal() {
    document.getElementById("addressMapModal").classList.remove("active")
  }

  function initializeAddressMap() {
    // Default to San Pablo City, Laguna
    const defaultLat = 14.086
    const defaultLng = 121.1475

    addressMap = L.map("addressMap").setView([defaultLat, defaultLng], 13)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(addressMap)

    // Add draggable marker
    addressMarker = L.marker([defaultLat, defaultLng], {
      draggable: true,
    }).addTo(addressMap)

    // Update address when marker is moved
    addressMarker.on("dragend", (e) => {
      const position = e.target.getLatLng()
      selectedCoordinates = {
        lat: position.lat,
        lng: position.lng,
      }
      reverseGeocode(position.lat, position.lng)
    })

    // Add click event to map
    addressMap.on("click", (e) => {
      const lat = e.latlng.lat
      const lng = e.latlng.lng

      addressMarker.setLatLng([lat, lng])
      selectedCoordinates = { lat, lng }
      reverseGeocode(lat, lng)
    })

    console.log("[v0] Address map initialized")
  }

  function searchAddress() {
    const query = document.getElementById("addressSearch").value.trim()
    if (!query) return

    // Simple geocoding simulation (in real app, use proper geocoding service)
    console.log("[v0] Searching for address:", query)

    // For demo, just show a message
    showSuccessMessage(`Searching for "${query}"... (This would use a real geocoding service)`)
  }

  function reverseGeocode(lat, lng) {
    // Simulate reverse geocoding (in real app, use proper service)
    const simulatedAddress = `${lat.toFixed(4)}, ${lng.toFixed(4)} - San Pablo City, Laguna, Philippines`
    document.getElementById("selectedAddress").textContent = simulatedAddress

    console.log("[v0] Reverse geocoded address:", simulatedAddress)
  }

  function confirmAddressSelection() {
    if (!selectedCoordinates) {
      alert("Please select a location on the map first.")
      return
    }

    const selectedAddress = document.getElementById("selectedAddress").textContent
    document.getElementById("completeAddress").value = selectedAddress

    closeAddressModal()
    showSuccessMessage("Address location selected successfully!")
  }

  function showSuccessMessage(message) {
    // Create temporary success message
    const successDiv = document.createElement("div")
    successDiv.className = "fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50"
    successDiv.innerHTML = `
            <div class="flex items-center gap-2">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `

    document.body.appendChild(successDiv)

    // Remove after 3 seconds
    setTimeout(() => {
      successDiv.remove()
    }, 3000)
  }

  console.log("[v0] Profile settings initialized successfully")
})
