$c(function() {
	
	var load = function(e, id) {
		var p = e.data(typeof id === 'undefined' ? "autoload" : ("autoload-"+id)),
			mode = e.data("mode"),
			style = e.data("style") || "",
			_class = e.data("class") || "";
			
		$.ajax({
			url: p,
			type: "GET",
			cache: false,
			async: false
		}).done(function(html){
			e.html(html);
			
			if(mode === "replace") {
				var c = e.children().insertBefore(e);
				e.remove();
				e = c;
			}
			
			if(e.attr("style") != "") {
				style = e.attr("style")+";"+style;
			}
			e.attr("style", style).addClass("class", _class);
		}).fail(function(a,b,c){
			alert("Error: "+c);
			console.log([a,b,c]);
		});
	};
	
	var autoload = function() {
		
		var again = false;
		
		$("[data-autoload]").each(function(){
			var e = $(this);
			if(e.data("autoloaded"))
				return;
			e.data("autoloaded", true);
			load(e);
		});
		
		if(Cordova.isMobile()) {
			$("[data-autoload-mobile]").each(function(){
				var e = $(this);
				if(e.data("autoloaded"))
					return;
				e.data("autoloaded", true);
				load(e, "mobile");
				again = true;
			});
		}
		else {
			$("[data-autoload-browser]").each(function(){
				var e = $(this);
				if(e.data("autoloaded"))
					return;
				e.data("autoloaded", true);
				load(e, "browser");
				again = true;
			});		
		}
		
		if(again)
			setTimeout(autoload, 50);
		else
			$(document).trigger("template-load");
	};
	
	autoload();
	
});