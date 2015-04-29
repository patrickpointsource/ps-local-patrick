var Util = {
    alignDate: function (date) {

        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
    },

    formatCurrency: function (n, c, d, t) {
        c = isNaN(c = Math.abs(c)) ? 0 : c, d = d == undefined ? "." : d, t = t == undefined ? "," : t, s = n < 0 ? "-" : "", i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j = ( j = i.length ) > 3 ? j % 3 : 0;

        return s + ( j ? i.substr(0, j) + t : "" ) + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + ( c ? d + Math.abs(n - i).toFixed(c).slice(2) : "" );
    },

    formatFloat: function (d, isString) {
        if (d.toString() != Math.round(d)) {
            var val = (parseFloat(d).toFixed(1));

            val = !isString ? parseFloat(val) : val;
            return val;
        }

        return parseInt(d);
    },

    syncRevProp: function (obj) {
        obj._rev = obj.rev;

        return obj;
    },


    getPersonName: function (person, isSimply, isFirst) {
        var result = '';
        var tmpName;

        if (!person || !person.name)
            return '';


        if (_.isString(person.name)) {
            var tmp = person.name.indexOf(",") == -1 ? person.name.split(/\s+/g) : person.name.split(",");

            tmpName = {
                givenName: tmp[0].trim(),
                familyName: tmp[1].trim(),
                fullName: person.name
            };

        } else if (person.name && _.isObject(person.name) && !person.name.familyName && !person.name.givenName && person.name.fullName) {
            var tmp = person.name.fullName.indexOf(",") == -1 ? person.name.fullName.split(/\s+/g) : person.name.fullName.split(",");

            tmpName = {
                givenName: tmp[0].trim(),
                familyName: tmp[1].trim(),
                fullName: person.name.fullName
            };

        } else
            tmpName = person.name;

        result = isSimply ? (tmpName.givenName + ' ' + tmpName.familyName) : (tmpName.familyName + ', ' + tmpName.givenName);

        if (isFirst)
            result = tmpName.givenName;

        return result;
    },

    getHoursPerMonthFromRate: function (rate) {
        var result = 0;

        if (rate) {
            if (rate.fullyUtilized)
                result = CONSTS.HOURS_PER_MONTH;
            else if (!isNaN(parseInt(rate.hoursPerMth)))
                result = rate.hoursPerMth;
            else if (!isNaN(parseInt(rate.hoursPerWeek)) && parseInt(rate.hoursPerWeek))
                result = Math.round(rate.hoursPerWeek * 4);
        }

        return result;
    },

    getTypeaheadStrFilter: function (strs) {

        return function findMatches(q, cb) {
            var matches, substringRegex;

            // an array that will be populated with substring matches
            matches = [];

            // regex used to determine if a string contains the substring `q`
            substrRegex = new RegExp(q, 'i');

            // iterate through the pool of strings and for any string that
            // contains the substring `q`, add it to the `matches` array
            $.each(strs, function (i, str) {
                if (str.value && substrRegex.test(str.value) || substrRegex.test(str)) {
                    // the typeahead jQuery plugin expects suggestions to a
                    // JavaScript object, refer to typeahead docs for more info
                    if (str.value)
                        matches.push(str);
                    else
                        matches.push({
                            value: str
                        });
                }
            });

            cb(matches);
        };

    },

    fixRestAngularPathMethod: function (configurerFn) {
        if (window.fixUrl) {
            return function (RestangularConfigurer) {
                var tmp = '';
                var oldBase = RestangularConfigurer.urlCreatorFactory.path.prototype.base;

                RestangularConfigurer.urlCreatorFactory.path.prototype.base = function (current) {
                    var res = oldBase.apply(this, [current]);

                    res = res.replace(/[^\:]\/\//gi, function (entry) {
                        return entry.replace("//", "/");
                    });
                    //res = res.replace( "//", "/" );
                    return res;
                };

                if (configurerFn)
                    configurerFn(RestangularConfigurer);
            };
        }

        return function (RestangularConfigurer) {
            if (configurerFn)
                configurerFn(RestangularConfigurer);
        };
    },

    /**
     * Returns "darker" color from passed
     */
    darkColorFrom: function (color, percent) {

        var f = parseInt(color.slice(1), 16), t = percent < 0 ? 0 : 255, p = percent < 0 ? percent * -1 : percent, R = f >> 16, G = f >> 8 & 0x00FF, B = f & 0x0000FF;
        return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);

    },

    hexToRgb: function (hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function (m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },

    /*
     * Returns "diffirence" between passed colors
     */
    getColorDistance: function (c1, c2) {
        var i;
        var d = 0;
        var v1 = Util.hexToRgb(c1);
        var v2 = Util.hexToRgb(c2);

        v1 = [v1.r, v1.g, v1.b];
        v2 = [v2.r, v2.g, v2.b];

        for (i = 0; i < v1.length; i++) {
            d += (v1[i] - v2[i]) * (v1[i] - v2[i]);
        }

        return Math.sqrt(d);
    }
};
