(function ($) {

var SessionStorage = function(pfx) {
  if (!this.browserSupport()) {
    return false;
  }
  this.pfx = pfx;
};

SessionStorage.prototype.browserSupport = function() {
  // this is taken from modernizr.
  var mod = 'modernizr';
  try {
    localStorage.setItem(mod, mod);
    localStorage.removeItem(mod);
    return true;
  } catch(e) {
    return false;
  }
};

SessionStorage.prototype.setItem = function(key, value) {
  return sessionStorage.setItem(this.pfx + ':' + key, JSON.stringify(value));
};

SessionStorage.prototype.getItem = function(key) {
  try {
    var v = sessionStorage.getItem(this.pfx + ':' + key);
    if (v !== null) {
      v = JSON.parse(v);
    }
    return v;
  }
  catch(e) {
    return null;
  }
};

var prefillStore = new SessionStorage('webform_prefill')


Drupal.behaviors.webform_prefill = {};

Drupal.behaviors.webform_prefill.keys = function(name) {
  if (name in this.settings.map) {
    return this.settings.map[name];
  }
  return [name];
};

Drupal.behaviors.webform_prefill.attach = function(context, settings) {
  if (typeof this.settings === 'undefined') {
    if ('webform_prefill' in Drupal.settings) {
      this.settings = Drupal.settings.webform_prefill;
    }
    else {
      this.settings = {map: {}};
    }
  }
  if (!prefillStore) { return; }

  var self = this;
  var $forms = $('.webform-client-form', context);

  $forms.find('input[type=checkbox]:checked').each(function(e) {
    var v = $(this).val();
    var name = $e.attr('name');
    if(name) { return; }
    prefillStore.setItem(name, v);
  });

  var done = {};
  $forms.find('input, select, textarea').each(function(e) {
    var $e = $(this);
    var name = $e.attr('name');
    if (!name) { return; }

    if (!(name in done)) {
      done[name] = true;

      // Get value from all possible keys.
      var keys = self.keys(name);
      var value = null;
      for (var i=0; i<keys.length; i++) {
        var key = keys[i];
        value = prefillStore.getItem(key);
        break;
      }

      if (value !== null) {
        if (typeof value === 'object') {
          // Convert objects to lists suitable for $.val().
          var values = [];
          for (key in value) {
            if (value[key]) {
              values.push(key);
            }
          }
          value = values;
        }
        // Set value on all elements with the same name.
        var $eAll = $e.closest('form').find('[name="' + $e.attr('name') + '"]');
        $eAll.val(value);
      }
    }
  });

  $forms.find('input, select, textarea').on('change', function(e) {
    var v = $(this).val();
    var name = $(this).attr('name');
    if (!name) { return; }
    if ($(this).attr('type') === 'checkbox') {
      var old = prefillStore.getItem(name) || {};
      old[v] = $(this).is(':checked');
      v = old;
    }
    prefillStore.setItem(name, v);
  });
};

}(jQuery));
