var Util = {
	alignDate: function( date ) {

		return new Date( date.getFullYear( ), date.getMonth( ), date.getDate( ), 0, 0, 0 );
	},

	formatCurrency: function( n, c, d, t ) {
		c = isNaN( c = Math.abs( c ) ) ? 0 : c, d = d == undefined ? "." : d, t = t == undefined ? "," : t, s = n < 0 ? "-" : "", i = parseInt( n = Math.abs( +n || 0 ).toFixed( c ) ) + "", j = ( j = i.length ) > 3 ? j % 3 : 0;

		return s + ( j ? i.substr( 0, j ) + t : "" ) + i.substr( j ).replace( /(\d{3})(?=\d)/g, "$1" + t ) + ( c ? d + Math.abs( n - i ).toFixed( c ).slice( 2 ) : "" );
	},
	
	formatFloat: function(d, isString) {
		if (d.toString() != Math.round(d)) {
			var val = (parseFloat(d).toFixed(1));
			
			val = !isString? parseFloat(val): val;
			return val;
		}
		
		return parseInt(d);
	},
	
	getPersonName: function(person, isSimply, isFirst) {
		var result = '';
		var tmpName;
		
		if (!person || !person.name)
			return '';
		
		
		if (_.isString(person.name)) {
		     var tmp = person.name.split(/\s+/g);
		     
		     tmpName = {
		         givenName: tmp[0],
		         familyName: tmp[1],
		         fullName: person.name
		     };
		     
		 } else if (person.name && _.isObject(person.name) && !person.name.familyName && !person.name.givenName && person.name.fullName) {
		     var tmp = person.name.fullName.split(/\s+/g);
		     
		     tmpName = {
		         givenName: tmp[0],
		         familyName: tmp[1],
		         fullName: person.name.fullName
		     };
		     
		 } else
			 tmpName = person.name;
			 
		result = isSimply ? (tmpName.givenName + ' ' + tmpName.familyName): (tmpName.familyName + ', ' + tmpName.givenName);
		
		if (isFirst)
			result = tmpName.givenName;
		
		return result;
	},

	getHoursPerMonthFromRate: function( rate ) {
		var result = 0;

		if( rate.fullyUtilized )
			result = CONSTS.HOURS_PER_MONTH;
		else if( !isNaN( parseInt( rate.hoursPerMth ) ) )
			result = rate.hoursPerMth;
		else if( !isNaN( parseInt( rate.hoursPerWeek ) ) && parseInt( rate.hoursPerWeek ) )
			result = Math.round( rate.hoursPerWeek * 4 );

		return result;
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

	},

	fixRestAngularPathMethod: function( configurerFn ) {
		if( window.fixUrl ) {
			return function( RestangularConfigurer ) {
				var tmp = '';
				var oldBase = RestangularConfigurer.urlCreatorFactory.path.prototype.base;

				RestangularConfigurer.urlCreatorFactory.path.prototype.base = function( current ) {
					var res = oldBase.apply( this, [ current ] );

					res = res.replace( /[^\:]\/\//gi, function( entry ) {
						return entry.replace( "//", "/" );
					} );
					//res = res.replace( "//", "/" );
					return res;
				};

				if( configurerFn )
					configurerFn( RestangularConfigurer );
			};
		}

		return function( RestangularConfigurer ) {
			if( configurerFn )
				configurerFn( RestangularConfigurer );
		};
	}
};
