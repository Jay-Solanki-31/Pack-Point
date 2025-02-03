$('<ul class="custom-theme"><li class="btn-dark-setting">Dark</li></ul>').appendTo($('body'));

$(document).ready(function () {

  if (localStorage.getItem('theme') === 'dark') {
    $('body').addClass('dark');
    $('.btn-dark-setting').addClass('dark').text('Light');
  } else {
    $('body').removeClass('dark');
    $('.btn-dark-setting').removeClass('dark').text('Dark');
  }

  $('body').on("click", ".btn-dark-setting", function () {
    $(this).toggleClass('dark');

    if ($(this).hasClass('dark')) {
      $(this).text('Light');
      $('body').addClass('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      $(this).text('Dark');
      $('body').removeClass('dark');
      localStorage.setItem('theme', 'light');
    }

    return false;
  });
});
