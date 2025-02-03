// Append the theme toggle button to the body
$('<ul class="custom-theme"><li class="btn-dark-setting">Dark</li></ul>').appendTo($('body'));

$(document).ready(function () {

  // Check localStorage for a saved theme and update the page accordingly
  if (localStorage.getItem('theme') === 'dark') {
    $('body').addClass('dark');
    $('.btn-dark-setting').addClass('dark').text('Light');
  } else {
    // Ensure the light theme is active if no dark mode is saved
    $('body').removeClass('dark');
    $('.btn-dark-setting').removeClass('dark').text('Dark');
  }

  // Toggle dark/light mode on button click
  $('body').on("click", ".btn-dark-setting", function () {
    $(this).toggleClass('dark');

    if ($(this).hasClass('dark')) {
      // Switch to dark mode
      $(this).text('Light');
      $('body').addClass('dark');
      // Save the dark mode setting
      localStorage.setItem('theme', 'dark');
    } else {
      // Switch to light mode
      $(this).text('Dark');
      $('body').removeClass('dark');
      // Save the light mode setting
      localStorage.setItem('theme', 'light');
    }

    return false;
  });
});
