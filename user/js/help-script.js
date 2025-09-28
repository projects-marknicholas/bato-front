// Help & Support JavaScript
document.addEventListener("DOMContentLoaded", () => {
  // FAQ Data
  const faqData = [
    {
      id: 1,
      category: "booking",
      question: "How do I make a reservation?",
      answer:
        'You can make a reservation by signing in to your account and clicking the "New Booking" button on your dashboard. Select your preferred dates, accommodation type, and number of guests. You can also call us directly at +63 49 562 1234.',
      popular: true,
    },
    {
      id: 2,
      category: "booking",
      question: "Can I modify or cancel my booking?",
      answer:
        "Yes, you can modify or cancel your booking up to 24 hours before your check-in date. Go to your Bookings & Reservations page and select the booking you want to change. Cancellation fees may apply depending on your booking type.",
      popular: true,
    },
    {
      id: 3,
      category: "payment",
      question: "What payment methods do you accept?",
      answer:
        "We accept major credit cards (Visa, MasterCard, American Express), debit cards, bank transfers, and cash payments. Online payments are processed securely through our payment gateway.",
      popular: true,
    },
    {
      id: 4,
      category: "amenities",
      question: "What amenities are included in my stay?",
      answer:
        "All accommodations include access to our natural spring pools, WiFi, parking, and basic toiletries. Deluxe rooms and cottages also include air conditioning, mini-fridge, and complimentary breakfast. Check your specific booking for detailed amenities.",
      popular: false,
    },
    {
      id: 5,
      category: "policies",
      question: "What is your check-in and check-out policy?",
      answer:
        "Check-in time is 2:00 PM and check-out is 12:00 PM. Early check-in and late check-out may be available upon request and subject to availability. Additional charges may apply.",
      popular: true,
    },
    {
      id: 6,
      category: "amenities",
      question: "Are pets allowed at the resort?",
      answer:
        "We welcome well-behaved pets in designated pet-friendly accommodations. A pet fee of ₱500 per night applies. Please inform us during booking if you'll be bringing pets.",
      popular: false,
    },
    {
      id: 7,
      category: "booking",
      question: "Do you offer group discounts?",
      answer:
        "Yes, we offer special rates for groups of 10 or more people. Contact our reservations team at +63 49 562 1234 or email groups@batospring.com for customized group packages.",
      popular: false,
    },
    {
      id: 8,
      category: "payment",
      question: "When is payment due for my booking?",
      answer:
        "A 50% deposit is required to secure your booking, with the remaining balance due upon check-in. For bookings made within 7 days of arrival, full payment is required at the time of booking.",
      popular: false,
    },
    {
      id: 9,
      category: "amenities",
      question: "Is WiFi available throughout the resort?",
      answer:
        'Yes, complimentary WiFi is available in all accommodations and common areas. The network name is "BatoSpring-Guest" and the password will be provided upon check-in.',
      popular: false,
    },
    {
      id: 10,
      category: "policies",
      question: "What is your refund policy?",
      answer:
        "Cancellations made 7+ days before arrival receive a full refund minus processing fees. Cancellations within 7 days are subject to a 50% cancellation fee. No-shows are non-refundable.",
      popular: false,
    },
    {
      id: 11,
      category: "account",
      question: "How do I reset my password?",
      answer:
        "Since we use Google Sign-in, you can reset your password through your Google account settings. If you're having trouble accessing your account, contact our support team for assistance.",
      popular: false,
    },
    {
      id: 12,
      category: "account",
      question: "Can I update my profile information?",
      answer:
        "Yes, you can update your profile information in the Profile Settings page. Some information from Google Sign-in cannot be changed directly and must be updated in your Google account.",
      popular: false,
    },
    {
      id: 13,
      category: "amenities",
      question: "What dining options are available?",
      answer:
        "Our open-air restaurant serves authentic Filipino cuisine, fresh seafood, and international dishes. We also offer room service for selected items. Operating hours are 6:00 AM to 10:00 PM.",
      popular: true,
    },
    {
      id: 14,
      category: "policies",
      question: "Do you have a dress code?",
      answer:
        "We maintain a casual, family-friendly atmosphere. Swimwear is appropriate for pool areas, but please cover up when dining or in common areas. We ask that guests dress modestly and respectfully.",
      popular: false,
    },
    {
      id: 15,
      category: "booking",
      question: "Can I extend my stay?",
      answer:
        "Extensions are subject to availability. Contact the front desk or your account manager as early as possible to request an extension. Additional nights will be charged at the current rate.",
      popular: false,
    },
  ]

  let currentCategory = "all"
  let filteredFAQs = faqData

  // Initialize
  init()

  function init() {
    setupEventListeners()
    renderFAQs()
  }

  function setupEventListeners() {
    // FAQ Search
    document.getElementById("faqSearch").addEventListener("input", debounce(searchFAQs, 300))

    // Category tabs
    document.querySelectorAll(".faq-category-tab").forEach((tab) => {
      tab.addEventListener("click", function () {
        const category = this.dataset.category
        switchCategory(category)
      })
    })

    // Help form
    document.getElementById("helpForm").addEventListener("submit", handleFormSubmit)

    // Success modal
    document.getElementById("closeSuccessModal").addEventListener("click", closeSuccessModal)
    document.getElementById("successModal").addEventListener("click", function (e) {
      if (e.target === this) closeSuccessModal()
    })
  }

  function searchFAQs() {
    const searchTerm = document.getElementById("faqSearch").value.toLowerCase()

    if (searchTerm.trim() === "") {
      filteredFAQs = currentCategory === "all" ? faqData : faqData.filter((faq) => faq.category === currentCategory)
    } else {
      const baseData = currentCategory === "all" ? faqData : faqData.filter((faq) => faq.category === currentCategory)
      filteredFAQs = baseData.filter(
        (faq) => faq.question.toLowerCase().includes(searchTerm) || faq.answer.toLowerCase().includes(searchTerm),
      )
    }

    renderFAQs()
  }

  function switchCategory(category) {
    currentCategory = category

    // Update active tab
    document.querySelectorAll(".faq-category-tab").forEach((tab) => tab.classList.remove("active"))
    document.querySelector(`[data-category="${category}"]`).classList.add("active")

    // Clear search
    document.getElementById("faqSearch").value = ""

    // Filter FAQs
    filteredFAQs = category === "all" ? faqData : faqData.filter((faq) => faq.category === category)
    renderFAQs()
  }

  function renderFAQs() {
    const faqList = document.getElementById("faqList")

    if (filteredFAQs.length === 0) {
      faqList.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-search text-4xl text-gray-300 mb-4"></i>
                    <h3 class="text-lg font-semibold text-gray-600 mb-2">No results found</h3>
                    <p class="text-gray-500">Try adjusting your search terms or browse different categories</p>
                </div>
            `
      return
    }

    // Sort by popular first, then alphabetically
    const sortedFAQs = [...filteredFAQs].sort((a, b) => {
      if (a.popular && !b.popular) return -1
      if (!a.popular && b.popular) return 1
      return a.question.localeCompare(b.question)
    })

    faqList.innerHTML = sortedFAQs
      .map(
        (faq) => `
            <div class="faq-item bg-white rounded-2xl shadow-sm">
                <button class="faq-question w-full text-left p-6 flex items-center justify-between hover:bg-gray-50 transition-colors" 
                        onclick="toggleFAQ(${faq.id})">
                    <div class="flex items-center gap-3">
                        <span class="text-lg font-semibold text-gray-800">${faq.question}</span>
                        ${faq.popular ? '<span class="popular-badge">Popular</span>' : ""}
                    </div>
                    <i class="fas fa-chevron-down text-gray-400 transition-transform" id="icon-${faq.id}"></i>
                </button>
                <div class="faq-answer hidden p-6 pt-0" id="answer-${faq.id}">
                    <p class="text-gray-600 leading-relaxed">${faq.answer}</p>
                    <div class="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                        <button class="text-sm text-green-600 hover:text-green-800 transition-colors" 
                                onclick="rateFAQ(${faq.id}, 'helpful')">
                            <i class="fas fa-thumbs-up mr-1"></i>Helpful
                        </button>
                        <button class="text-sm text-gray-500 hover:text-gray-700 transition-colors" 
                                onclick="rateFAQ(${faq.id}, 'not-helpful')">
                            <i class="fas fa-thumbs-down mr-1"></i>Not Helpful
                        </button>
                        <button class="text-sm text-blue-600 hover:text-blue-800 transition-colors ml-auto" 
                                onclick="contactAboutFAQ(${faq.id})">
                            <i class="fas fa-envelope mr-1"></i>Still Need Help?
                        </button>
                    </div>
                </div>
            </div>
        `,
      )
      .join("")
  }

  function handleFormSubmit(e) {
    e.preventDefault()

    // Get form data
    const formData = {
      fullName: document.getElementById("fullName").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      category: document.getElementById("category").value,
      priority: document.getElementById("priority").value,
      bookingRef: document.getElementById("bookingRef").value,
      message: document.getElementById("message").value,
      consent: document.getElementById("consent").checked,
    }

    // Validate consent
    if (!formData.consent) {
      alert("Please agree to the processing of your personal data to continue.")
      return
    }

    // Simulate form submission
    console.log("[v0] Help form submitted:", formData)

    // Show success modal
    document.getElementById("successModal").classList.add("active")

    // Reset form
    document.getElementById("helpForm").reset()
  }

  function closeSuccessModal() {
    document.getElementById("successModal").classList.remove("active")
  }

  // Global functions for FAQ interactions
  window.toggleFAQ = (faqId) => {
    const answer = document.getElementById(`answer-${faqId}`)
    const icon = document.getElementById(`icon-${faqId}`)

    if (answer.classList.contains("hidden")) {
      // Close all other FAQs
      document.querySelectorAll(".faq-answer").forEach((el) => {
        el.classList.add("hidden")
      })
      document.querySelectorAll(".faq-question i").forEach((el) => {
        el.classList.remove("rotate-180")
      })

      // Open this FAQ
      answer.classList.remove("hidden")
      icon.classList.add("rotate-180")
    } else {
      // Close this FAQ
      answer.classList.add("hidden")
      icon.classList.remove("rotate-180")
    }
  }

  window.rateFAQ = (faqId, rating) => {
    console.log("[v0] FAQ rated:", faqId, rating)

    // Show feedback
    const message = rating === "helpful" ? "Thank you for your feedback!" : "We'll work on improving this answer."

    // Create temporary feedback message
    const feedback = document.createElement("div")
    feedback.className = "text-sm text-green-600 mt-2"
    feedback.textContent = message

    const answerDiv = document.getElementById(`answer-${faqId}`)
    answerDiv.appendChild(feedback)

    // Remove feedback after 3 seconds
    setTimeout(() => {
      feedback.remove()
    }, 3000)
  }

  window.contactAboutFAQ = (faqId) => {
    const faq = faqData.find((f) => f.id === faqId)
    if (faq) {
      // Pre-fill the contact form
      document.getElementById("category").value = faq.category
      document.getElementById("message").value = `I need more help with: "${faq.question}"\n\n`

      // Scroll to contact form
      document.getElementById("helpForm").scrollIntoView({ behavior: "smooth" })
    }
  }

  // Utility function
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

  console.log("[v0] Help system initialized successfully")
})
