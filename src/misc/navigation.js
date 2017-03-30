$c(function(){
	
	var delay = 500;
	var hash = null;
	
	var check = function() {
		
		if(hash == null) {
			hash = location.hash;
		}
		else if(location.hash != hash) {
			$(document).trigger("navigation-go", [hash]);
		}
	
		setTimeout(check, delay);
	};
	
	setTimeout(check, delay);
	
});