// Bookings & Reservations JavaScript
document.addEventListener("DOMContentLoaded", () => {
  // Sample booking data
  const bookingsData = [
    {
      id: "BK001",
      type: "room",
      name: "Deluxe Room",
      checkIn: "2024-01-15",
      checkOut: "2024-01-17",
      guests: 2,
      status: "confirmed",
      price: 5000,
      image: "/public/luxury-resort-room-with-modern-amenities.jpg",
      category: "upcoming",
    },
    {
      id: "BK002",
      type: "cottage",
      name: "Family Cottage",
      checkIn: "2024-01-20",
      checkOut: "2024-01-22",
      guests: 4,
      status: "pending",
      price: 7000,
      image: "/public/family-cottage-with-traditional-filipino-design.jpg",
      category: "upcoming",
    },
    {
      id: "BK003",
      type: "day-tour",
      name: "Day Tour Package",
      checkIn: "2024-01-25",
      checkOut: "2024-01-25",
      guests: 6,
      status: "confirmed",
      price: 1200,
      image: "/public/natural-spring-pool-with-clear-blue-water.jpg",
      category: "upcoming",
    },
    {
      id: "BK004",
      type: "hut",
      name: "Bamboo Hut",
      checkIn: "2023-12-10",
      checkOut: "2023-12-12",
      guests: 2,
      status: "completed",
      price: 3600,
      image: "/public/traditional-bamboo-hut-in-tropical-setting.jpg",
      category: "previous",
    },
    {
      id: "BK005",
      type: "room",
      name: "Deluxe Room",
      checkIn: "2023-11-15",
      checkOut: "2023-11-17",
      guests: 3,
      status: "completed",
      price: 5000,
      image: "/public/luxury-resort-room-with-modern-amenities.jpg",
      category: "previous",
    },
    {
      id: "BK006",
      type: "cottage",
      name: "Family Cottage",
      checkIn: "2023-10-20",
      checkOut: "2023-10-23",
      guests: 5,
      status: "completed",
      price: 10500,
      image: "/public/family-cottage-with-traditional-filipino-design.jpg",
      category: "completed",
    },
  ]

  let currentTab = "upcoming"
  let currentPage = 1
  const itemsPerPage = 5
  let filteredBookings = []

  // Initialize
  init()

  function init() {
    setupEventListeners()
    filterBookings()
    renderBookings()
    updatePagination()
  }

  function setupEventListeners() {
    // Tab switching
    document.querySelectorAll(".tab-button").forEach((button) => {
      button.addEventListener("click", function () {
        const tab = this.dataset.tab
        switchTab(tab)
      })
    })

    // Search and filters
    document.getElementById("searchInput").addEventListener("input", debounce(filterBookings, 300))
    document.getElementById("statusFilter").addEventListener("change", filterBookings)
    document.getElementById("typeFilter").addEventListener("change", filterBookings)
    document.getElementById("dateFilter").addEventListener("change", filterBookings)
    document.getElementById("clearFilters").addEventListener("click", clearFilters)

    // Pagination
    document.getElementById("prevPage").addEventListener("click", () => changePage(currentPage - 1))
    document.getElementById("nextPage").addEventListener("click", () => changePage(currentPage + 1))

    // Modal
    document.getElementById("closeBookingModal").addEventListener("click", closeBookingModal)
    document.getElementById("bookingModal").addEventListener("click", function (e) {
      if (e.target === this) closeBookingModal()
    })
  }

  function switchTab(tab) {
    currentTab = tab
    currentPage = 1

    // Update active tab
    document.querySelectorAll(".tab-button").forEach((btn) => btn.classList.remove("active"))
    document.querySelector(`[data-tab="${tab}"]`).classList.add("active")

    filterBookings()
    renderBookings()
    updatePagination()
  }

  function filterBookings() {
    const searchTerm = document.getElementById("searchInput").value.toLowerCase()
    const statusFilter = document.getElementById("statusFilter").value
    const typeFilter = document.getElementById("typeFilter").value
    const dateFilter = document.getElementById("dateFilter").value

    filteredBookings = bookingsData.filter((booking) => {
      // Tab filter
      if (currentTab === "upcoming" && booking.category !== "upcoming") return false
      if (currentTab === "previous" && booking.category !== "previous") return false
      if (currentTab === "completed" && booking.category !== "completed") return false

      // Search filter
      if (
        searchTerm &&
        !booking.name.toLowerCase().includes(searchTerm) &&
        !booking.id.toLowerCase().includes(searchTerm)
      )
        return false

      // Status filter
      if (statusFilter && booking.status !== statusFilter) return false

      // Type filter
      if (typeFilter && booking.type !== typeFilter) return false

      // Date filter
      if (dateFilter && booking.checkIn !== dateFilter) return false

      return true
    })

    currentPage = 1
    renderBookings()
    updatePagination()
  }

  function clearFilters() {
    document.getElementById("searchInput").value = ""
    document.getElementById("statusFilter").value = ""
    document.getElementById("typeFilter").value = ""
    document.getElementById("dateFilter").value = ""
    filterBookings()
  }

  function renderBookings() {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const bookingsToShow = filteredBookings.slice(startIndex, endIndex)

    const bookingsList = document.getElementById("bookingsList")

    if (bookingsToShow.length === 0) {
      bookingsList.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-calendar-times text-4xl text-gray-300 mb-4"></i>
                    <h3 class="text-lg font-semibold text-gray-600 mb-2">No bookings found</h3>
                    <p class="text-gray-500">Try adjusting your filters or search terms</p>
                </div>
            `
      return
    }

    bookingsList.innerHTML = bookingsToShow
      .map(
        (booking) => `
            <div class="booking-card bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer" 
                 onclick="openBookingModal('${booking.id}')">
                <div class="flex flex-col lg:flex-row gap-6">
                    <div class="lg:w-48 h-32 lg:h-auto">
                        <img src="${booking.image}" alt="${booking.name}" 
                             class="w-full h-full object-cover rounded-lg">
                    </div>
                    
                    <div class="flex-1">
                        <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4">
                            <div>
                                <h3 class="text-xl font-bold text-gray-800 mb-2">${booking.name}</h3>
                                <p class="text-gray-600 mb-2">Booking ID: ${booking.id}</p>
                                <div class="flex items-center gap-4 text-sm text-gray-600">
                                    <span><i class="fas fa-calendar mr-1"></i>${formatDate(booking.checkIn)}</span>
                                    ${booking.checkOut !== booking.checkIn ? `<span>to ${formatDate(booking.checkOut)}</span>` : ""}
                                    <span><i class="fas fa-users mr-1"></i>${booking.guests} guests</span>
                                </div>
                            </div>
                            
                            <div class="text-right mt-4 lg:mt-0">
                                <div class="text-2xl font-bold text-green-600 mb-2">₱${booking.price.toLocaleString()}</div>
                                <span class="status-badge status-${booking.status}">${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span>
                            </div>
                        </div>
                        
                        <div class="flex flex-col sm:flex-row gap-3">
                            <button class="btn-primary flex-1 sm:flex-none" onclick="event.stopPropagation(); viewBookingDetails('${booking.id}')">
                                View Details
                            </button>
                            ${
                              booking.status === "confirmed"
                                ? `
                                <button class="btn-secondary flex-1 sm:flex-none" onclick="event.stopPropagation(); modifyBooking('${booking.id}')">
                                    Modify
                                </button>
                                <button class="text-red-600 hover:text-red-800 px-4 py-2" onclick="event.stopPropagation(); cancelBooking('${booking.id}')">
                                    Cancel
                                </button>
                            `
                                : ""
                            }
                            ${
                              booking.status === "completed"
                                ? `
                                <button class="btn-secondary flex-1 sm:flex-none" onclick="event.stopPropagation(); rebookStay('${booking.id}')">
                                    Book Again
                                </button>
                                <button class="text-blue-600 hover:text-blue-800 px-4 py-2" onclick="event.stopPropagation(); leaveReview('${booking.id}')">
                                    Leave Review
                                </button>
                            `
                                : ""
                            }
                        </div>
                    </div>
                </div>
            </div>
        `,
      )
      .join("")
  }

  function updatePagination() {
    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage + 1
    const endIndex = Math.min(currentPage * itemsPerPage, filteredBookings.length)

    // Update showing text
    document.getElementById("showingStart").textContent = filteredBookings.length > 0 ? startIndex : 0
    document.getElementById("showingEnd").textContent = endIndex
    document.getElementById("totalBookings").textContent = filteredBookings.length

    // Update pagination buttons
    document.getElementById("prevPage").disabled = currentPage === 1
    document.getElementById("nextPage").disabled = currentPage === totalPages || totalPages === 0

    // Update page numbers
    const pageNumbers = document.getElementById("pageNumbers")
    pageNumbers.innerHTML = ""

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.appendChild(createPageButton(i))
      }
    } else {
      // Complex pagination logic for many pages
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pageNumbers.appendChild(createPageButton(i))
        }
        pageNumbers.appendChild(createEllipsis())
        pageNumbers.appendChild(createPageButton(totalPages))
      } else if (currentPage >= totalPages - 3) {
        pageNumbers.appendChild(createPageButton(1))
        pageNumbers.appendChild(createEllipsis())
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.appendChild(createPageButton(i))
        }
      } else {
        pageNumbers.appendChild(createPageButton(1))
        pageNumbers.appendChild(createEllipsis())
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.appendChild(createPageButton(i))
        }
        pageNumbers.appendChild(createEllipsis())
        pageNumbers.appendChild(createPageButton(totalPages))
      }
    }
  }

  function createPageButton(pageNum) {
    const button = document.createElement("button")
    button.textContent = pageNum
    button.className = `px-3 py-2 text-sm rounded-lg transition-colors ${
      pageNum === currentPage ? "bg-green-500 text-white" : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
    }`
    button.addEventListener("click", () => changePage(pageNum))
    return button
  }

  function createEllipsis() {
    const span = document.createElement("span")
    span.textContent = "..."
    span.className = "px-2 py-2 text-gray-400"
    return span
  }

  function changePage(page) {
    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage)
    if (page >= 1 && page <= totalPages) {
      currentPage = page
      renderBookings()
      updatePagination()
    }
  }

  function openBookingModal(bookingId) {
    const booking = bookingsData.find((b) => b.id === bookingId)
    if (!booking) return

    const modalContent = document.getElementById("bookingModalContent")
    modalContent.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <img src="${booking.image}" alt="${booking.name}" class="w-full h-48 object-cover rounded-lg mb-4">
                    <h3 class="text-xl font-bold text-gray-800 mb-2">${booking.name}</h3>
                    <p class="text-gray-600 mb-4">Booking ID: ${booking.id}</p>
                </div>
                
                <div>
                    <div class="space-y-4">
                        <div>
                            <label class="text-sm font-semibold text-gray-600">Check-in Date</label>
                            <p class="text-gray-800">${formatDate(booking.checkIn)}</p>
                        </div>
                        
                        <div>
                            <label class="text-sm font-semibold text-gray-600">Check-out Date</label>
                            <p class="text-gray-800">${formatDate(booking.checkOut)}</p>
                        </div>
                        
                        <div>
                            <label class="text-sm font-semibold text-gray-600">Guests</label>
                            <p class="text-gray-800">${booking.guests} guests</p>
                        </div>
                        
                        <div>
                            <label class="text-sm font-semibold text-gray-600">Status</label>
                            <p><span class="status-badge status-${booking.status}">${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</span></p>
                        </div>
                        
                        <div>
                            <label class="text-sm font-semibold text-gray-600">Total Amount</label>
                            <p class="text-2xl font-bold text-green-600">₱${booking.price.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        `

    document.getElementById("bookingModal").classList.add("active")
  }

  function closeBookingModal() {
    document.getElementById("bookingModal").classList.remove("active")
  }

  // Utility functions
  function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  // Action functions (placeholders)
  window.viewBookingDetails = (bookingId) => {
    openBookingModal(bookingId)
  }

  window.modifyBooking = (bookingId) => {
    console.log("[v0] Modify booking:", bookingId)
    // Implement modify booking logic
  }

  window.cancelBooking = (bookingId) => {
    console.log("[v0] Cancel booking:", bookingId)
    if (confirm("Are you sure you want to cancel this booking?")) {
      // Implement cancel booking logic
    }
  }

  window.rebookStay = (bookingId) => {
    console.log("[v0] Rebook stay:", bookingId)
    // Implement rebook logic
  }

  window.leaveReview = (bookingId) => {
    console.log("[v0] Leave review for booking:", bookingId)
    // Implement review logic
  }

  console.log("[v0] Bookings system initialized successfully")
})
