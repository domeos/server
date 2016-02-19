/*!
 *
 * @description : Used to write some of the basic functions
 *
 * @author : ChandraLee
 * @date : 2015.11.5
 * @version : 0.0.0
 *
 */
Object.extend = function(destination, source) {
	for (var property in source) {
		destination[property] = source[property];
	}
	return destination;
};