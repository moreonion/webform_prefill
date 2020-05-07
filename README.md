This module makes it possible to prefill [webforms](https://www.drupal.org/project/webform).

## Features

* Remember values entered in the current browsing sessions.
* Values are stored in the browser using localStore, sessionStore and/or
  cookies.
* Prefill values can be added by using URLs formed in a specific way.

## Installation

Install all the dependencies then activate the module. This should be enough to
get the basic prefill functionality.

### Javascript libraries

* [jquery.formprefill](https://www.npmjs.com/package/jquery.formprefill)

### Drupal modules

* [libraries](https://www.drupal.org/project/libraries) for loading the JS
  libraries.
* [variable](https://www.drupal.org/project/variable) to handle the config
  variables.
* [webform 4](https://www.drupal.org/project/webform)

The modules needs PHP≥5.4.

## Usage

The module will prefill all webform form elements as soon as it is enabled.

### Use CSS classes for excluding/including parts of your forms.

You can use the classes `.webform-prefill-exclude` and `.webform-prefill-include`
to blacklist or whitelist parts of your forms. By default the whole form is
whitelisted.

You can use a weform component’s wrapper classes to exclude or include
components easily.

### Use URL fragments to add values to the prefill store

You can add prefill values to the store by adding a special URL fragment to your
links. For example:

1. You enter the page the page using the URL `https://example.com#p:name=Alice`.
2. Later in this session you navigate to a webform.
3. The webform contains a textfield component with the form key `name` which is
   prefilled with the value “Alice”.

You can still use fragments for something else by separating the prefill 
part (`p:…`) using from the rest of the fragment using a semi-colon `;`. That
means if you enter the website using `https://example.com?#anchor;p:name=Alice`
the prefill value is removed from the URL after the JavaScript is done and you
see the page as if you had entered `https://example.com?#anchor` instead.


## Browser compatibility

The JavaScript in this module is compatible with IE 11. However the required polyfills are not bundled. If you want to support these browsers you’ll neet to load an appropriate polyfill. For example you can use [polyfill.io](https://polyfill.io).

(At least) the following features need polyfilling:

- Promises
