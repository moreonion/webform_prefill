<?php

/**
 * @file
 * Documentation of variables used by this module.
 */

/**
 * Implements hook_variable_info().
 */
function webform_prefill_variable_info($options) {
  $v['webform_prefill_storage'] = [
    'title' => t('Data storage', [], $options),
    'description' => t('Use this storage for storing the pre-fill data.', [], $options),
    'type' => 'options',
    'options' => ['sessionStorage' => 'sessionStorage', 'localStorage' => 'localStorage', 'cookie' => 'cookie'],
    'default' => ['sessionStorage' => 'sessionStorage'],
    'localize' => FALSE,
  ];
  $v['webform_prefill_cookie_domain'] = [
    'title' => t('Cookie domain', [], $options),
    'description' => t('Use this cookie domain for values stored in a cookie.', [], $options),
    'type' => 'string',
    'default' => '',
    'localize' => FALSE,
  ];
  $v['webform_prefill_cookie_max_age'] = [
    'title' => t('Cookie max-age (in seconds)', [], $options),
    'description' => t('Set max-age to expire a cookie after the given time. Use a negative number for no expiration.', [], $options),
    'type' => 'number',
    'default' => -1,
    'localize' => FALSE,
  ];
  $v['webform_prefill_map'] = [
    'title' => t('Form element name mapping', [], $options),
    'description' => t('Map form element names to keys tried when prefilling a form.', [], $options),
    'type' => 'unknown',
    'default' => [
      'first_name' => ['first_name', 'firstname', 'fname'],
      'last_name' => ['last_name', 'lastname', 'lname'],
      'email' => ['email', 'email_address'],
    ],
    'localize' => FALSE,
  ];
  return $v;
}
