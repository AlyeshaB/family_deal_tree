// This script manages the visibility of the search bar, login form, and navbar
// when different buttons are clicked and also when the window scrolls

// The search bar is toggled when the user clicks the search icon
let searchForm = document.querySelector(".search-form");

document.querySelector("#search-btn").onclick = () => {
  // Toggling the visibility of the search form
  searchForm.classList.toggle("show");

  // Ensuring that the login form and the navbar are hidden when the search form is active
  loginForm?.classList.remove("show");
  navbar.classList.remove("show");
};

// The login form is toggled when the user clicks the login button
let loginForm = document.querySelector(".login-form");

if (loginForm) {
  // Only add the event listener if the login form exists
  document.querySelector("#login-btn").onclick = () => {
    // Toggling the visibility of the login form
    loginForm.classList.toggle("show");

    // Ensuring that the search form and the navbar are hidden when the login form is active
    searchForm.classList.remove("show");
    navbar.classList.remove("show");
  };
}

// The navbar is toggled when the user clicks the menu button
let navbar = document.querySelector(".navbar");

document.querySelector("#menu-btn").onclick = () => {
  // Toggling the visibility of the navbar
  navbar.classList.toggle("show");

  // Ensuring that the search form and the login form are hidden when the navbar is active
  searchForm.classList.remove("show");
  loginForm?.classList.remove("show");
};

// The search form, login form, and navbar are hidden when the window scrolls
window.onscroll = () => {
  searchForm.classList.remove("show");
  loginForm?.classList.remove("show");
  navbar.classList.remove("show");
};

let loggedIn;

if (loggedIn) {
  // Remove the user icon
  let userIcon = document.getElementById("login-btn");
  userIcon.parentNode.removeChild(userIcon);
}

// This script initializes the swiper slider with specified configuration.
var swiper = new Swiper(".swiper-slider", {
  // Images will loop from the end to the beginning and vice versa.
  loop: true,

  // The space between each slide
  spaceBetween: 20,

  // Autoplay configuration. The slider will auto-slide after 5.5s and will not stop auto-sliding when user interaction is detected
  autoplay: {
    delay: 5500,
    disableOnInteraction: false,
  },

  // Position of the active slide won't be in the center to avoid seeing parts of other images when on smaller screens
  centeredSlides: false,

  breakpoints: {
    // when window width is >= 320px
    320: {
      slidesPerView: 1,
      spaceBetween: 10,
    },
    // when window width is >= 480px
    480: {
      slidesPerView: 1,
      spaceBetween: 20,
    },
    // when window width is >= 640px
    640: {
      slidesPerView: 2,
      spaceBetween: 30,
    },
    // when window width is >= 768px
    768: {
      slidesPerView: 3,
      spaceBetween: 40,
    },
  },
});
