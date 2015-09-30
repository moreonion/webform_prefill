(function ($) {

var SessionStorage = function(pfx) {
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

SessionStorage.prototype.getFirst = function(keys) {
  // Get value from all possible keys.
  var value = null;
  for (var i=0; i<keys.length; i++) {
    var key = keys[i];
    value = prefillStore.getItem(key);
    if (value) {
      return value;
    }
  }
  return null;
};

var prefillStore = new SessionStorage('webform_prefill')


var FormValList = function($e, name_attr) {
  this.$e = $e;
  this.name_attr = name_attr || 'name';
  this.name = $e.attr(this.name_attr);
  this.cache_key = this.pfxMap(this.name);
};

FormValList.prototype.getVal = function() {
  var $e = this.$e;
  var type = $e.attr('type');
  if (type == 'checkbox' || type == 'radio') {
    $e = $e.closest('form').find('input:'+type+'['+this.name_attr+'="'+this.name+'"]:checked');
  }
  var val = $e.val() || [];
  return (val.constructor === Array) ? val : [val];
};

FormValList.prototype.getAllByName = function() {
  return this.$e.closest('form')
    .find('['+this.name_attr+'="'+this.name+'"]')
    .filter('input:checkbox, input:radio, select[multiple]');
};

FormValList.prototype.pfxMap = function(x) {
  return 'l:' + x;
}

var FormValSingle = function($e, name_attr) {
  this.$e = $e;
  this.name_attr = name_attr || 'name';
  this.name = $e.attr(this.name_attr);
  this.cache_key = this.pfxMap(this.name);
};

FormValSingle.prototype.getVal = function() {
  return this.$e.val();
};

FormValSingle.prototype.getAllByName = function() {
  return this.$e.closest('form')
    .find('['+this.name_attr+'="'+this.name+'"]')
    .not('input:checkbox, input:radio, select[multiple]');
};

FormValSingle.prototype.pfxMap = function(x) {
  return 's:' + x;
}

Drupal.behaviors.webform_prefill = {};

Drupal.behaviors.webform_prefill.elementFactory = function ($e, name_attr) {
  name_attr = name_attr || 'data-form-key';
  var type = $e.attr('type');
  if (type == 'checkbox' || type == 'radio' || $e.is('select[multiple]')) {
    return new FormValList($e, name_attr);
  }
  return new FormValSingle($e, name_attr);
};

Drupal.behaviors.webform_prefill.formKey = function($e) {
  var name = $e.attr('name');
  if ($e.attr('type') == 'checkbox') {
    name = name.slice(0, -(2 + $e.attr('value').length));
  }
  return name.slice(name.lastIndexOf('[')+1, -1);
};

Drupal.behaviors.webform_prefill._keys = function(name) {
  if (name in this.settings.map) {
    return this.settings.map[name];
  }
  return [name];
};

Drupal.behaviors.webform_prefill.keys = function(val) {
  return $.map(this._keys(val.name), val.pfxMap);
};

Drupal.behaviors.webform_prefill.attach = function(context, settings) {
  if (!prefillStore.browserSupport()) { return; }

  if (typeof this.settings === 'undefined') {
    this.readUrlVars();
    if ('webform_prefill' in Drupal.settings) {
      this.settings = Drupal.settings.webform_prefill;
    }
    else {
      this.settings = {map: {}};
    }
  }

  var self = this;
  var $inputs = $('.webform-client-form', context).find('input, select, textarea');

  $inputs.each(function() {
    var $e = $(this);
    var fk = self.formKey($e);
    if (fk) {
      $e.attr('data-form-key', fk);
    }
  });

  var done = {};
  $inputs.each(function() {
    var e = self.elementFactory($(this));
    if (!(e.cache_key in done)) {
      done[e.cache_key] = true;

      // Get value from all possible keys.
      var value = prefillStore.getFirst(self.keys(e));
      if (value !== null) {
        e.getAllByName().val(value);
      }
    }
  });

  $inputs.on('change', function() {
    var e = self.elementFactory($(this));
    if (!e.name) { return; }
    prefillStore.setItem(e.cache_key, e.getVal());
  });
};

// Collect values from the current location.
Drupal.behaviors.webform_prefill.readUrlVars = function(query, store) {
  query = query || window.location.search.substr(1);
  store = store || prefillStore;
  var vars = {}, key, value, p, hashes;
  hashes = query.split('&');
  for (var i = 0; i < hashes.length; i++) {
    p = hashes[i].indexOf('=');
    key = hashes[i].substring(0, p);
    value = hashes[i].substring(p+1);
    // Only act on p: prefixes.
    if (key.substr(0, 2) == 'p:') {
      key = key.substr(2);
      // Prepare values to be set as list values.
      if (!(key in vars)) {
        vars[key] = [];
      }
      vars[key].push(value);
      // Set string values directly.
      store.setItem('s:' + key, value);
    }
  }
  // Finally set all list values.
  $.each(vars, function(key, value) {
    store.setItem('l:' + key, value);
  });
};

}(jQuery));
