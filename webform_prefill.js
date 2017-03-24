(function ($) {

Drupal.behaviors.webform_prefill = {
  attach: function(context, settings) {

    var settings = Drupal.settings.webform_prefill;

    $('form.webform-client-form:not([data-webform-prefill-processed])', context)
    .attr('data-webform-prefill-processed', 'true')
    .formPrefill({
      prefix: 'webform_prefill',
      map: settings.map,
      exclude: '.webform-prefill-exclude',
      include: '.webform-prefill-include',
      stringPrefix: 's',
      listPrefix: 'l',
      useSessionStore: true,
      useCookies: settings.cookieDomain ? true : false,
      cookieDomain: settings.cookieDomain
    });
  }
};

}(jQuery));
