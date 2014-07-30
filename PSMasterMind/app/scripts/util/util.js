var Util = {
	alignDate: function( date ) {

		return new Date( date.getFullYear( ), date.getMonth( ), date.getDate( ), 0, 0, 0 );
	},

	getTypeaheadStrFilter: function( strs ) {

		return function findMatches( q, cb ) {
			var matches, substringRegex;

			// an array that will be populated with substring matches
			matches = [ ];

			// regex used to determine if a string contains the substring `q`
			substrRegex = new RegExp( q, 'i' );

			// iterate through the pool of strings and for any string that
			// contains the substring `q`, add it to the `matches` array
			$.each( strs, function( i, str ) {
				if( str.value && substrRegex.test( str.value ) || substrRegex.test( str ) ) {
					// the typeahead jQuery plugin expects suggestions to a
					// JavaScript object, refer to typeahead docs for more info
					if( str.value )
						matches.push( str );
					else
						matches.push( {
							value: str
						} );
				}
			} );

			cb( matches );
		};

	}
};
