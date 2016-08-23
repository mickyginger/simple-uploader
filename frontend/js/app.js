var UploadApp = UploadApp || {};

Object.defineProperty(UploadApp, 'isLoggedIn', {
  get: function() {
    return !!window.localStorage.getItem('token');
  }
});

Object.defineProperty(UploadApp, 'user', {
  get: function() {
    var token = window.localStorage.getItem('token');
    if(!token) return null;
    return JSON.parse(atob(token.split('.')[1]));
  }
});

UploadApp.setRequestHeader = function(jqXHR) {
  var token = window.localStorage.getItem('token');
  if(token) jqXHR.setRequestHeader('Authorization', 'Bearer ' + token);
}

UploadApp.loadTemplate = function(template, data) {
  return $.get('/templates/' + template + '.html').done(function(templateHtml) {
    var html = _.template(templateHtml)(data);
    $("main").html(html);
    UploadApp.updateUI();
  });
}

UploadApp.handleForm = function() {
  event.preventDefault();

  var $btn = $(this).find('button');
  $btn.prop('disbled', true);

  var ajaxOpts = {
    url: "http://localhost:3000/api" + $(this).attr('action'),
    method: $(this).attr('method'),
    beforeSend: UploadApp.setRequestHeader
  }

  if($(this).attr('enctype') === "multipart/form-data") {
    ajaxOpts.data = new FormData(this);
    ajaxOpts.contentType = false;
    ajaxOpts.cache = false;
    ajaxOpts.processData = false;
  } else {
    ajaxOpts.data = $(this).serialize();
  }

  $.ajax(ajaxOpts)
    .done(function(data) {
      if(data.token) window.localStorage.setItem('token', data.token);

      if(UploadApp.isLoggedIn) {
        UploadApp.loadTemplate('profile', { user: UploadApp.user });
      } else {
        UploadApp.loadTemplate('login');
      }

      UploadApp.updateUI();
    })
    .fail(function() {
      $btn.removeAttr('disabled');
      UploadApp.logout();
      UploadApp.updateUI();
    });
}

UploadApp.logout = function() {
  event.preventDefault();
  window.localStorage.removeItem('token');
  UploadApp.loadTemplate('login');
}

UploadApp.updateUI = function() {
  if(this.isLoggedIn) {
    $('.logged-out').addClass('hidden');
    $('.logged-in').removeClass('hidden');
  } else {
    $('.logged-out').removeClass('hidden');
    $('.logged-in').addClass('hidden');
  }
}

UploadApp.initEventHandlers = function() {
  $('main').on('submit', 'form', this.handleForm);
  $('main').on('click', '.btn-danger', function() {
    return confirm('Are you sure?');
  });
  $('nav.navbar a.logout').on('click', this.logout);
  $('nav.navbar a[data-template]').on('click', function() {
    event.preventDefault();
    UploadApp.loadTemplate($(this).data('template'), { user: UploadApp.user });
  });
}

UploadApp.init = function() {
  if(this.isLoggedIn) {
    this.loadTemplate('profile', { user: this.user });
  } else {
    this.loadTemplate('login');
  }
  this.initEventHandlers();
}.bind(UploadApp)

$(UploadApp.init);
