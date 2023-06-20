// This script manages the visibility of the search bar, login form and navbar
// when different buttons are clicked and also when the window scrolls

// The search bar is toggled when user clicks the search icon
let searchForm = document.querySelector(".search-form");

document.querySelector("#search-btn").onclick = () => {
  // Toggling the visibility of the search form
  searchForm.classList.toggle("show");

  // Ensuring that the login form and the navbar are hidden when search form is active
  loginForm.classList.remove("show");
  navbar.classList.remove("show");
};

// The login form is toggled when user clicks the login button
let loginForm = document.querySelector(".login-form");

document.querySelector("#login-btn").onclick = () => {
  // Toggling the visibility of the login form
  loginForm.classList.toggle("show");

  // Ensuring that the search form and the navbar are hidden when login form is active
  searchForm.classList.remove("show");
  navbar.classList.remove("show");
};

// The navbar is toggled when user clicks the menu button
let navbar = document.querySelector(".navbar");

document.querySelector("#menu-btn").onclick = () => {
  // Toggling the visibility of the navbar
  navbar.classList.toggle("show");

  // Ensuring that the search form and the login form are hidden when navbar is active
  searchForm.classList.remove("show");
  loginForm.classList.remove("show");
};

// The search form, login form and navbar are hidden when window scrolls
window.onscroll = () => {
  searchForm.classList.remove("show");
  loginForm.classList.remove("show");
  navbar.classList.remove("show");
};

// This script initializes the swiper slider with specified configuration.

var swiper = new Swiper(".swiper-slider", {
  // Images will loop from the end to the beginning and vice versa.
  loop: true,

  // The space between each slide
  spaceBetween: 20,

  // Autoplay configuration. The slider will auto-slide after 7.5s and will not stop auto-sliding when user interaction is detected
  autoplay: {
    delay: 7500,
    disableOnInteraction: false,
  },

  // Position of the active slide will be in the center
  centeredSlides: true,

  // Breakpoints. Different number of slides per view depending on the viewport width.
  // For viewports less than 768px wide, only 1 slide will be shown.
  // For viewports between 768px and 1020px wide, 2 slides will be shown.
  // For viewports more than 1020px wide, 3 slides will be shown.
  breakpoints: {
    0: {
      slidesPerView: 1,
    },
    768: {
      slidesPerView: 2,
    },
    1020: {
      slidesPerView: 3,
    },
  },
});
