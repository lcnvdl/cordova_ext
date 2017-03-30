var Facebook = function() {
	
	var fb = (typeof FB !== 'undefined') ? FB : facebookConnectPlugin;
	if(!fb) {
		throw "Cannot find Facebook SDK.";
	}
	
	var mobile = (typeof facebookConnectPlugin !== 'undefined');
	var permissions = ["public_profile", "user_birthday", "email", "user_friends"];
	
	this.login = function(callback) {
		fb.login(permissions, function(a) {
			if(callback)
				callback(true, a);
		}, function(a) {
			if(callback)
				callback(false, a);
		});
	};
	
	var fbApi = function(url, apiPermissions, callback) {
		
		if(mobile) {
			
			fb.api(url, apiPermissions, function(res) {
				callback({success: true, response: res});
			}, function(err){
				callback({success: false, response: err});
			});
			
		}
		else {
			fb.api(url, function(res) {
				callback({success: (!!res && !res.error), response: res});
			});
		}
		
	};
	
	this.getLoggedAccount = function(callback) {
		
		var success = function(response) {
			
			if (response.status === 'connected') {
				
				fbApi('/me', ["public_profile", "user_birthday", "email"], function(dataResponse) {
					
					if(dataResponse.success) {
						
						dataResponse = dataResponse.response;
						
						console.log('Successful login for: ' + dataResponse.name);
						console.log(dataResponse);
						
						var onResponse = function(friendsResponse) {
							
							if(friendsResponse.success) {
								friendsResponse = friendsResponse.response;
															
								var account = new Account({
									id: dataResponse.id,
									fullname: dataResponse.name || "unknown",
									email: dataResponse.email,
									friends: friendsResponse.data,
									photograph: "http://graph.facebook.com/" + dataResponse.id + "/picture?type=normal"
								});					
								
								callback({success: true, account: account, status: response.status});
							}
							else {
								callback({success: false, account: null, status: friendsResponse.response.status, message: friendsResponse.response});
							}
						};
						
						fbApi('/me/friends', ["public_profile", "user_friends"], onResponse);
					}
					else {
						callback({success: false, account: null, status: dataResponse.response.status, message: dataResponse.response});
					}
				});
				
			}
			else {
				callback({success: false, account: null, status: response.status, message: "Conexión perdida"});
			}
		};
		
		if(mobile) {
			fb.getLoginStatus(success, function(err){
				callback({success: false, account: null, status: response.status, message: err});
			});
		}
		else {
			fb.getLoginStatus(success, true);	
		}
		
	}
	
	this.publishPhoto = function() {
		fb.showDialog( 
		{
			method: 		"feed",
			picture:		'https://www.google.co.jp/logos/doodles/2014/doodle-4-google-2014-japan-winner-5109465267306496.2-hp.png',
			name:			'Test Post',
			message:		'First photo post',    
			caption: 		'Testing using phonegap plugin',
			description: 	'Posting photo using phonegap facebook plugin'
		}, 
		function (response) { alert(JSON.stringify(response)) },
		function (response) { alert(JSON.stringify(response)) });
	};
	
	this.logout = function() {
		
	};
	
};