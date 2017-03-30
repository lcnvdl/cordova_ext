function waitUntil(condition, callback, delay) {
	
	delay = delay || 50;
	
	if(!condition()) {
		setTimeout(function(){waitUntil(condition, callback, delay);}, delay);
	}
	else {
		callback();
	}
	
}

function waitWhile(condition, callback, delay) {
	
	delay = delay || 50;
	
	if(condition()) {
		setTimeout(function(){waitWhile(condition, callback, delay);}, delay);
	}
	else {
		callback();
	}
	
}