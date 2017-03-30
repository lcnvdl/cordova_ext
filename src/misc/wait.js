/**
 *	Waits until a condition.
 *
 *	@param {Function} condition - Condition for the loop.
 *	@param {Number} [delay=50] - Delay between condition checks.
 *	@callback callback
 */
function waitUntil(condition, callback, delay) {
	
	delay = delay || 50;
	
	if(!condition()) {
		setTimeout(function(){waitUntil(condition, callback, delay);}, delay);
	}
	else {
		callback();
	}
	
}

/**
 *	Waits while a condition.
 *
 *	@param {Function} condition - Condition for the loop.
 *	@param {Number} [delay=50] - Delay between condition checks.
 *	@callback callback
 */
function waitWhile(condition, callback, delay) {
	
	delay = delay || 50;
	
	if(condition()) {
		setTimeout(function(){waitWhile(condition, callback, delay);}, delay);
	}
	else {
		callback();
	}
	
}