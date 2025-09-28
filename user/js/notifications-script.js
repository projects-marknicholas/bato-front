// Notifications JavaScript
document.addEventListener("DOMContentLoaded", () => {
  // Sample notifications data
  const notificationsData = [
    {
      id: "N001",
      type: "bookings",
      title: "Booking Confirmed",
      message: "Your booking for Deluxe Room (BK001) has been confirmed for January 15-17, 2024.",
      timestamp: "2024-01-10T10:30:00Z",
      read: false,
      priority: "high",
      icon: "fas fa-check-circle",
      color: "green",
    },
    {
      id: "N002",
      type: "announcements",
      title: "New Amenities Available",
      message: "We're excited to announce new spa services and a fitness center now available for all guests.",
      timestamp: "2024-01-09T14:15:00Z",
      read: false,
      priority: "medium",
      icon: "fas fa-bullhorn",
      color: "blue",
    },
    {
      id: "N003",
      type: "events",
      title: "Summer Festival 2024",
      message: "Join us for our annual Summer Festival featuring live music, local food, and cultural performances.",
      timestamp: "2024-01-08T09:00:00Z",
      read: true,
      priority: "medium",
      icon: "fas fa-calendar-alt",
      color: "purple",
    },
    {
      id: "N004",
      type: "bookings",
      title: "Payment Reminder",
      message:
        "Payment for your upcoming booking (BK002) is due in 3 days. Please complete payment to secure your reservation.",
      timestamp: "2024-01-07T16:45:00Z",
      read: false,
      priority: "high",
      icon: "fas fa-credit-card",
      color: "orange",
    },
    {
      id: "N005",
      type: "events",
      title: "Yoga Classes Starting Soon",
      message: "Morning yoga classes will begin next week. Sign up at the front desk or through your account.",
      timestamp: "2024-01-06T08:30:00Z",
      read: false,
      priority: "low",
      icon: "fas fa-leaf",
      color: "green",
    },
    {
      id: "N006",
      type: "bookings",
      title: "Check-in Reminder",
      message: "Your check-in for Family Cottage is tomorrow at 2:00 PM. We look forward to welcoming you!",
      timestamp: "2024-01-05T12:00:00Z",
      read: true,
      priority: "medium",
      icon: "fas fa-door-open",
      color: "blue",
    },
    {
      id: "N007",
      type: "announcements",
      title: "Maintenance Schedule",
      message: "The main pool will be closed for maintenance on January 20-21. Alternative pools remain available.",
      timestamp: "2024-01-04T11:15:00Z",
      read: false,
      priority: "medium",
      icon: "fas fa-tools",
      color: "yellow",
    },
    {
      id: "N008",
      type: "events",
      title: "Cooking Class Available",
      message: "Learn to cook traditional Filipino dishes with our head chef. Limited spots available.",
      timestamp: "2024-01-03T15:20:00Z",
      read: true,
      priority: "low",
      icon: "fas fa-utensils",
      color: "red",
    },
  ]

  let currentFilter = "all"
  let displayedNotifications = 6 // Initially show 6 notifications

  // Initialize
  init()

  function init() {
    setupEventListeners()
    updateCounts()
    renderNotifications()
    updateNotificationBadge()
  }

  function setupEventListeners() {
    // Filter tabs
    document.querySelectorAll(".notification-tab").forEach((tab) => {
      tab.addEventListener("click", function () {
        const filter = this.dataset.filter
        switchFilter(filter)
      })
    })

    // Mark all read
    document.getElementById("markAllRead").addEventListener("click", markAllAsRead)

    // Load more
    document.getElementById("loadMore").addEventListener("click", loadMoreNotifications)

    // Modal
    document.getElementById("closeNotificationModal").addEventListener("click", closeNotificationModal)
    document.getElementById("notificationModal").addEventListener("click", function (e) {
      if (e.target === this) closeNotificationModal()
    })
  }

  function switchFilter(filter) {
    currentFilter = filter
    displayedNotifications = 6 // Reset to initial count

    // Update active tab
    document.querySelectorAll(".notification-tab").forEach((tab) => tab.classList.remove("active"))
    document.querySelector(`[data-filter="${filter}"]`).classList.add("active")

    renderNotifications()
  }

  function getFilteredNotifications() {
    let filtered = notificationsData

    switch (currentFilter) {
      case "unread":
        filtered = notificationsData.filter((n) => !n.read)
        break
      case "bookings":
        filtered = notificationsData.filter((n) => n.type === "bookings")
        break
      case "announcements":
        filtered = notificationsData.filter((n) => n.type === "announcements")
        break
      case "events":
        filtered = notificationsData.filter((n) => n.type === "events")
        break
      default:
        filtered = notificationsData
    }

    // Sort by timestamp (newest first)
    return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }

  function renderNotifications() {
    const filteredNotifications = getFilteredNotifications()
    const notificationsToShow = filteredNotifications.slice(0, displayedNotifications)
    const notificationsList = document.getElementById("notificationsList")
    const emptyState = document.getElementById("emptyState")
    const loadMoreBtn = document.getElementById("loadMore")

    if (notificationsToShow.length === 0) {
      notificationsList.innerHTML = ""
      emptyState.classList.remove("hidden")
      loadMoreBtn.style.display = "none"
      return
    }

    emptyState.classList.add("hidden")

    notificationsList.innerHTML = notificationsToShow
      .map(
        (notification) => `
            <div class="notification-card ${notification.read ? "read" : "unread"}" 
                 onclick="openNotificationModal('${notification.id}')" 
                 data-id="${notification.id}">
                <div class="flex items-start gap-4">
                    <div class="notification-icon ${notification.color}">
                        <i class="${notification.icon}"></i>
                    </div>
                    
                    <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between mb-2">
                            <h3 class="notification-title">${notification.title}</h3>
                            <div class="flex items-center gap-2">
                                ${notification.priority === "high" ? '<span class="priority-badge high">High</span>' : ""}
                                <span class="notification-time">${formatTimeAgo(notification.timestamp)}</span>
                                ${!notification.read ? '<div class="unread-dot"></div>' : ""}
                            </div>
                        </div>
                        
                        <p class="notification-message">${notification.message}</p>
                        
                        <div class="notification-actions">
                            <button class="action-btn" onclick="event.stopPropagation(); markAsRead('${notification.id}')">
                                <i class="fas fa-check mr-1"></i>
                                ${notification.read ? "Mark Unread" : "Mark Read"}
                            </button>
                            <button class="action-btn" onclick="event.stopPropagation(); deleteNotification('${notification.id}')">
                                <i class="fas fa-trash mr-1"></i>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `,
      )
      .join("")

    // Show/hide load more button
    loadMoreBtn.style.display = filteredNotifications.length > displayedNotifications ? "block" : "none"
  }

  function updateCounts() {
    const allCount = notificationsData.length
    const unreadCount = notificationsData.filter((n) => !n.read).length
    const bookingsCount = notificationsData.filter((n) => n.type === "bookings").length
    const announcementsCount = notificationsData.filter((n) => n.type === "announcements").length
    const eventsCount = notificationsData.filter((n) => n.type === "events").length

    document.getElementById("allCount").textContent = allCount
    document.getElementById("unreadCount").textContent = unreadCount
    document.getElementById("bookingsCount").textContent = bookingsCount
    document.getElementById("announcementsCount").textContent = announcementsCount
    document.getElementById("eventsCount").textContent = eventsCount
  }

  function updateNotificationBadge() {
    const unreadCount = notificationsData.filter((n) => !n.read).length
    const badge = document.getElementById("notificationBadge")

    if (unreadCount > 0) {
      badge.style.display = "block"
    } else {
      badge.style.display = "none"
    }
  }

  function loadMoreNotifications() {
    displayedNotifications += 6
    renderNotifications()
  }

  function markAsRead(notificationId) {
    const notification = notificationsData.find((n) => n.id === notificationId)
    if (notification) {
      notification.read = !notification.read
      updateCounts()
      renderNotifications()
      updateNotificationBadge()
    }
  }

  function markAllAsRead() {
    notificationsData.forEach((notification) => {
      notification.read = true
    })
    updateCounts()
    renderNotifications()
    updateNotificationBadge()
  }

  function deleteNotification(notificationId) {
    if (confirm("Are you sure you want to delete this notification?")) {
      const index = notificationsData.findIndex((n) => n.id === notificationId)
      if (index > -1) {
        notificationsData.splice(index, 1)
        updateCounts()
        renderNotifications()
        updateNotificationBadge()
      }
    }
  }

  function openNotificationModal(notificationId) {
    const notification = notificationsData.find((n) => n.id === notificationId)
    if (!notification) return

    // Mark as read when opened
    if (!notification.read) {
      notification.read = true
      updateCounts()
      renderNotifications()
      updateNotificationBadge()
    }

    const modalContent = document.getElementById("notificationModalContent")
    modalContent.innerHTML = `
            <div class="notification-detail">
                <div class="flex items-center gap-3 mb-4">
                    <div class="notification-icon ${notification.color} large">
                        <i class="${notification.icon}"></i>
                    </div>
                    <div>
                        <h3 class="text-xl font-bold text-gray-800">${notification.title}</h3>
                        <p class="text-sm text-gray-600">${formatFullDate(notification.timestamp)}</p>
                    </div>
                </div>
                
                <div class="notification-content">
                    <p class="text-gray-700 leading-relaxed mb-6">${notification.message}</p>
                    
                    ${getNotificationActions(notification)}
                </div>
            </div>
        `

    document.getElementById("notificationModal").classList.add("active")
  }

  function getNotificationActions(notification) {
    switch (notification.type) {
      case "bookings":
        return `
                    <div class="flex gap-3">
                        <button class="btn-primary" onclick="window.location.href='bookings.html'">
                            View Bookings
                        </button>
                        <button class="btn-secondary" onclick="closeNotificationModal()">
                            Close
                        </button>
                    </div>
                `
      case "events":
        return `
                    <div class="flex gap-3">
                        <button class="btn-primary" onclick="alert('Event registration coming soon!')">
                            Register for Event
                        </button>
                        <button class="btn-secondary" onclick="closeNotificationModal()">
                            Close
                        </button>
                    </div>
                `
      default:
        return `
                    <div class="flex gap-3">
                        <button class="btn-secondary" onclick="closeNotificationModal()">
                            Close
                        </button>
                    </div>
                `
    }
  }

  function closeNotificationModal() {
    document.getElementById("notificationModal").classList.remove("active")
  }

  // Utility functions
  function formatTimeAgo(timestamp) {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInSeconds = Math.floor((now - time) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`

    return time.toLocaleDateString()
  }

  function formatFullDate(timestamp) {
    const date = new Date(timestamp)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  console.log("[v0] Notifications system initialized successfully")
})
