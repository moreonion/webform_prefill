/**
 * @file
 * Initialize jquery.formPrefill.
 */

(function ($) {

Drupal.behaviors.webform_prefill = {
  attach: function (context, settings) {

    if (!$.isFunction($.fn.formPrefill)) {
      return;
    }

    var settings = Drupal.settings.webform_prefill || {
      map: {},
      storage: ['sessionStorage'],
      cookieDomain: ''
    };

    $('form.webform-client-form', context)
    .formPrefill({
      prefix: 'webform_prefill',
      map: settings.map,
      exclude: '.webform-prefill-exclude',
      include: '.webform-prefill-include',
      stringPrefix: 's',
      listPrefix: 'l',
      useSessionStore: settings.storage.indexOf('sessionStorage') > -1,
      useLocalStore: settings.storage.indexOf('localStorage') > -1,
      useCookies: settings.storage.indexOf('cookie') > -1,
      cookieDomain: settings.cookieDomain,
      cookieMaxAge: settings.cookieMaxAge < 0 ? Infinity : settings.cookieMaxAge,
    });
  }
};

}(jQuery));
