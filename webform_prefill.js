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


var FormValList = function($e) {
  this.$e = $e;
  this.name = $e.attr('name');
  this.cache_key = this.pfxMapFn()(this.name);
};

FormValList.prototype.getVal = function() {
  var $e = this.$e;
  var type = $e.attr('type');
  if (type == 'checkbox' || type == 'radio') {
    $e = $e.closest('form').find('input:'+type+'[name="'+$e.attr('name')+'"]:checked');
  }
  var val = $e.val() || [];
  return (val.constructor === Array) ? val : [val];
};

FormValList.prototype.getAllByName = function() {
  return this.$e.closest('form')
    .find('[name="'+this.$e.attr('name')+'"]')
    .filter('input:checkbox, input:radio, select[multiple]');
};

FormValList.prototype.pfxMapFn = function() {
  return function(x) { return 'l:' + x; };
}

var FormValSingle = function($e) {
  this.$e = $e;
  this.name = $e.attr('name');
  this.cache_key = this.pfxMapFn()(this.name);
};

FormValSingle.prototype.getVal = function() {
  return this.$e.val();
};

FormValSingle.prototype.getAllByName = function() {
  return this.$e.closest('form')
    .find('[name="'+this.$e.attr('name')+'"]')
    .not('input:checkbox, input:radio, select[multiple]');
};

FormValSingle.prototype.pfxMapFn = function() {
  return function(x) { return 's:' + x; };
}

Drupal.behaviors.webform_prefill = {};

Drupal.behaviors.webform_prefill.elementFactory = function ($e) {
  var type = $e.attr('type');
  if (type == 'checkbox' || type == 'radio' || $e.is('select[multiple]')) {
    return new FormValList($e);
  }
  return new FormValSingle($e);
};

Drupal.behaviors.webform_prefill._keys = function(name) {
  if (name in this.settings.map) {
    return this.settings.map[name];
  }
  return [name];
};

Drupal.behaviors.webform_prefill.keys = function(val) {
  var keys = this._keys(val.name);
  return $.map(keys, val.pfxMapFn());
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
  if (!prefillStore.browserSupport()) { return; }

  var self = this;
  var $forms = $('.webform-client-form', context);

  var done = {};
  $forms.find('input, select, textarea').each(function() {
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

  $forms.find('input, select, textarea').on('change', function() {
    var e = self.elementFactory($(this));
    if (!e.name) { return; }
    prefillStore.setItem(e.cache_key, e.getVal());
  });
};

}(jQuery));
