(function() {
	
	var _lastPage = "";
	var _lastPageDom = null;
	var _container = null;
	var _method = "";
	
	var getPage = function(name) {
		if(!name || name == "")
			return null;
		
		return $("[data-page='"+name+"']");
	};
	
	var Navigator = {
		
		initialize: function(container, method) {
			
			_container = container;
			
			if(typeof _container === 'string') {
				if(_container[0] != "#")
					_container = "#"+_container;
				
				_container = $(_container);
			}
			
			_method = method;
			
		},
		
		go: function(page) {
			
			if(_lastPage === page)
				return;
			
			this.hideCurrent(function(){
				
				this.show(page, function(pageDom){
					_lastPage = page;
					_lastPageDom = pageDom;
				});
				
			});
			
			
		},
		
		show: function(page, callback) {
			
			var pageDom = getPage(page);
			if(!pageDom)  {
				callback(null);
			}
			
			if(_method === "clone") {
				throw "Not implemented";
			}
			else if(_method === "show-hide") {
				pageDom.hide("fade", 500, function(){
					callback(pageDom);
				});
			}
			else if(_method === "move") {
				throw "Not implemented";
			}
			
		},
		
		hideCurrent: function(callback) {
			
			if(_method === "clone") {
				throw "Not implemented";
			}
			else if(_method === "show-hide") {
				_lastPageDom.hide("fade", 500, callback);
			}
			else if(_method === "move") {
				throw "Not implemented";
			}
			
		}
		
	};
	
})();