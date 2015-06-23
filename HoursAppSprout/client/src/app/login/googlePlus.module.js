(function() {
	'use strict';

	angular.module('googlePlus', [])
	    .config(GooglePlusConfig)
	    .run(GooglePlusRun);

	GooglePlusConfig.$inject = [];

	function GooglePlusConfig () {

	}

	GooglePlusRun.$inject = [];

	function GooglePlusRun() {
		var po = document.createElement('script');
		po.type = 'text/javascript';
		po.async = true;
		po.defer = true;
		po.src = 'https://apis.google.com/js/client:platform.js?onload=init';
		var s = document.getElementsByTagName('script')[0];
		s.parentNode.insertBefore(po, s);
	}
})();