if (localStorage.getItem('theme') === 'dark') {
  document.documentElement.classList.add('dark'); 
}

$('<ul class="custom-theme"><li class="btn-dark-setting">Dark</li></ul>').appendTo($('body'));

$(document).ready(function () {

  if ($('html').hasClass('dark')) {
    $('.btn-dark-setting').addClass('dark').text('Light');
  } else {
    $('.btn-dark-setting').removeClass('dark').text('Dark');
  }

  $('body').on("click", ".btn-dark-setting", function () {
    $(this).toggleClass('dark');

    if ($(this).hasClass('dark')) {
      $(this).text('Light');
      $('html').addClass('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      $(this).text('Dark');
      $('html').removeClass('dark');
      localStorage.setItem('theme', 'light');
    }

    return false;
  });
});
