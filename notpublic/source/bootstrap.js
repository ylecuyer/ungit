/*
 * Import the Bootstrap components individually.
 */

import $ from 'jquery';
global.jQuery = $; // this is for old backward compatability of bootrap modules

require('bootstrap-sass/assets/javascripts/bootstrap/dropdown');
require('bootstrap-sass/assets/javascripts/bootstrap/modal');
require('bootstrap-sass/assets/javascripts/bootstrap/tooltip');
