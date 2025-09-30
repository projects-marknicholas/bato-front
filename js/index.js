// Google Start
function handleCredentialResponse(response) {
  const idToken = response.credential;

  fetch(`${window.CONFIG.API_BASE_URL}${window.CONFIG.ENDPOINTS.GOOGLE_CALLBACK}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ google_token: idToken })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      localStorage.setItem("user", JSON.stringify(data.user));
      alert("Google login successful!");
    } else {
      alert("Google login failed: " + (data.error || "Unknown error"));
    }
  })
  .catch(err => console.error("Error:", err));
}
// Google End

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()
    const target = document.querySelector(this.getAttribute("href"))
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  })
})

// Navbar scroll effect
window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar")
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled")
  } else {
    navbar.classList.remove("scrolled")
  }
})

// Mobile menu toggle
function toggleMobileMenu() {
  const mobileMenu = document.getElementById("mobileMenu")
  mobileMenu.classList.toggle("hidden")
}

function handleBookingClick() {
  alert("Please sign in with Google first to make a booking. This ensures secure reservations and account management.")
  signInWithGoogle()
}

document.addEventListener("DOMContentLoaded", () => {
  const AOS = window.AOS // Declare the AOS variable
  AOS.init({
    duration: 1000,
    once: true,
    offset: 100,
    easing: "ease-out-cubic",
  })
})

// Initialize OpenStreetMap
function initMap() {
  // BatoSpring Resort coordinates (approximate based on San Pablo City)
  const lat = 14.0273
  const lng = 121.3881

  const map = window.L.map("map").setView([lat, lng], 15)

  // Add OpenStreetMap tiles
  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map)

  // Custom marker icon
  const customIcon = window.L.divIcon({
    html: `
            <div style="
                background: linear-gradient(135deg, #16a34a, #22c55e);
                width: 30px;
                height: 30px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                border: 3px solid white;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            ">
                <div style="
                    width: 12px;
                    height: 12px;
                    background: white;
                    border-radius: 50%;
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(45deg);
                "></div>
            </div>
        `,
    className: "custom-marker",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  })

  // Add marker
  window.L.marker([lat, lng], { icon: customIcon })
    .addTo(map)
    .bindPopup(`
            <div style="text-align: center; padding: 10px;">
                <h3 style="margin: 0 0 8px 0; color: #16a34a; font-weight: bold;">BatoSpring Resort</h3>
                <p style="margin: 0; color: #666; font-size: 14px;">A hidden jewel in San Pablo City</p>
                <a href="https://www.google.com/maps/place/Bato+Springs+Resort/@14.0273034,121.3832207,1108m/data=!3m2!1e3!4b1!4m9!3m8!1s0x33bd5cca48b5afc9:0x3520dd3adf4b0dbb!5m2!4m1!1i2!8m2!3d14.0272982!4d121.3880916!16s%2Fg%2F11dzdh27y4?hl=en&entry=ttu&g_ep=EgoyMDI1MDkyMi4wIKXMDSoASAFQAw%3D%3D" 
                   target="_blank" 
                   style="color: #16a34a; text-decoration: none; font-size: 12px;">
                    View on Google Maps →
                </a>
            </div>
        `)
    .openPopup()
}

// Initialize map when page loads
document.addEventListener("DOMContentLoaded", () => {
  // Small delay to ensure the map container is properly rendered
  if (document.getElementById("map")) {
    setTimeout(initMap, 100)
  }
})

document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contactForm")
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault()
      alert(
        "Thank you for your message! We'll get back to you within 24 hours. This form is for support and feedback only - for bookings, please sign in first.",
      )
    })
  }
})

// Add some interactive hover effects
document.addEventListener("DOMContentLoaded", () => {
  // Add click animation to buttons
  const buttons = document.querySelectorAll(".btn-primary, .btn-secondary")
  buttons.forEach((button) => {
    button.addEventListener("click", function (e) {
      // Create ripple effect
      const ripple = document.createElement("span")
      const rect = this.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = e.clientX - rect.left - size / 2
      const y = e.clientY - rect.top - size / 2

      ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `

      this.style.position = "relative"
      this.style.overflow = "hidden"
      this.appendChild(ripple)

      setTimeout(() => {
        ripple.remove()
      }, 600)
    })
  })
})

// Add CSS for ripple animation
const style = document.createElement("style")
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`
document.head.appendChild(style)

// Lazy loading for images
document.addEventListener("DOMContentLoaded", () => {
  const images = document.querySelectorAll('img[src*="placeholder.svg"]')

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target
        img.style.opacity = "0"
        img.style.transition = "opacity 0.3s ease"

        setTimeout(() => {
          img.style.opacity = "1"
        }, 100)

        observer.unobserve(img)
      }
    })
  })

  images.forEach((img) => imageObserver.observe(img))
})
