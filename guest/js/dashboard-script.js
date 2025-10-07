// Dashboard JavaScript
document.addEventListener("DOMContentLoaded", () => {
  // Import AOS and Leaflet
  const AOS = window.AOS
  const L = window.L

  // Initialize AOS
  AOS.init({
    duration: 800,
    easing: "ease-in-out",
    once: true,
  })

  // Sidebar Toggle
  const sidebarToggle = document.getElementById("sidebarToggle")
  const sidebar = document.getElementById("sidebar")
  const sidebarOverlay = document.getElementById("sidebarOverlay")
  const mainContent = document.querySelector(".main-content")

  function toggleSidebar() {
    sidebar.classList.toggle("active")
    sidebarOverlay.classList.toggle("active")
  }

  sidebarToggle?.addEventListener("click", toggleSidebar)
  sidebarOverlay?.addEventListener("click", toggleSidebar)

  // Initialize Map
  const map = L.map("dashboardMap").setView([14.086, 121.1475], 16)

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map)

  // Resort Facilities Data
  const facilities = [
    {
      id: 1,
      name: "Deluxe Room",
      lat: 14.0862,
      lng: 121.1477,
      image: "/luxury-resort-room-with-modern-amenities.jpg",
      description: "Spacious deluxe room with modern amenities, air conditioning, and beautiful garden view.",
      price: "₱2,500/night",
    },
    {
      id: 2,
      name: "Family Cottage",
      lat: 14.0858,
      lng: 121.1473,
      image: "/family-cottage-with-traditional-filipino-design.jpg",
      description: "Perfect for families, featuring multiple beds and a private terrace overlooking the springs.",
      price: "₱3,500/night",
    },
    {
      id: 3,
      name: "Bamboo Hut",
      lat: 14.0864,
      lng: 121.1479,
      image: "/traditional-bamboo-hut-in-tropical-setting.jpg",
      description: "Authentic bamboo hut experience with natural ventilation and rustic charm.",
      price: "₱1,800/night",
    },
    {
      id: 4,
      name: "Natural Spring Pool",
      lat: 14.086,
      lng: 121.1475,
      image: "/natural-spring-pool-with-clear-blue-water.jpg",
      description: "Crystal clear natural spring pool with therapeutic mineral water.",
      price: "Day Tour: ₱200",
    },
    {
      id: 5,
      name: "Dining Area",
      lat: 14.0856,
      lng: 121.1471,
      image: "/outdoor-dining-area-with-filipino-cuisine.jpg",
      description: "Open-air dining area serving authentic Filipino cuisine and fresh seafood.",
      price: "Tables available",
    },
    {
      id: 6,
      name: "Conference Hall",
      lat: 14.0866,
      lng: 121.1481,
      image: "/modern-conference-hall-for-events.jpg",
      description: "Fully equipped conference hall perfect for corporate events and celebrations.",
      price: "₱5,000/day",
    },
  ]

  // Add markers to map
  facilities.forEach((facility) => {
    const marker = L.marker([facility.lat, facility.lng]).addTo(map)

    const popupContent = `
            <div class="custom-popup">
                <img src="${facility.image}" alt="${facility.name}">
                <h4>${facility.name}</h4>
                <p>${facility.description}</p>
                <div class="price">${facility.price}</div>
                <button onclick="openFacilityModal(${facility.id})">View Details</button>
            </div>
        `

    marker.bindPopup(popupContent, {
      maxWidth: 250,
      className: "custom-popup-wrapper",
    })
  })

  // Facility Modal
  window.openFacilityModal = (facilityId) => {
    const facility = facilities.find((f) => f.id === facilityId)
    if (!facility) return

    document.getElementById("facilityTitle").textContent = facility.name
    document.getElementById("facilityImage").src = facility.image
    document.getElementById("facilityDescription").textContent = facility.description
    document.getElementById("facilityPrice").textContent = facility.price

    document.getElementById("facilityModal").classList.add("active")
  }

  // Close Modal
  document.getElementById("closeFacilityModal")?.addEventListener("click", () => {
    document.getElementById("facilityModal").classList.remove("active")
  })

  // Close modal when clicking outside
  document.getElementById("facilityModal")?.addEventListener("click", function (e) {
    if (e.target === this) {
      this.classList.remove("active")
    }
  })

  // Quick Actions
  document.querySelectorAll(".quick-action-card button").forEach((button) => {
    button.addEventListener("click", function () {
      const action = this.textContent.trim()

      switch (action) {
        case "Book Now":
          window.location.href = "bookings.html"
          break
        case "View History":
          window.location.href = "bookings.html?tab=history"
          break
        case "Contact Support":
          window.location.href = "help.html"
          break
      }
    })
  })

  // Fullscreen Map
  document.querySelector(".btn-primary").addEventListener("click", () => {
    const mapContainer = document.getElementById("dashboardMap")
    if (mapContainer.requestFullscreen) {
      mapContainer.requestFullscreen()
    } else if (mapContainer.webkitRequestFullscreen) {
      mapContainer.webkitRequestFullscreen()
    } else if (mapContainer.msRequestFullscreen) {
      mapContainer.msRequestFullscreen()
    }
  })

  console.log("[v0] Dashboard initialized successfully")
})
