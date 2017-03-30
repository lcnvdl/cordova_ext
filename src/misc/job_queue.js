/**
 *	JobQueue
 *	
 *	Queue that processes a certain amount of simultaneous asynchronous functions.
 *
 *	@constructor	
 *
 *	@param {Number} [maxJobs=3] - Limit of simultaneous jobs.
 *
 */
var JobQueue = function (maxJobs) {

    var currentJobs = 0;
    var queue = [];
    var tout = 0;
    var self = this;
	var inactive = true;
	
	this.activeEvent = [];
	this.inactiveEvent = [];

    this.maxJobs = maxJobs || 3;

	/**
	 * 	Adds an async function.
	 *	@param {Function} work - Working function.
	 */
    this.add = function(work) {
        queue.push(work);
    };
	
	this.stop = function() {
		if(tout) {
			clearTimeout(tout);
			tout = 0;
		}
	};

    this.process = function () {

        if (queue.length > 0 && currentJobs < this.maxJobs) {
			
			inactive = false;
			for(var i = 0; i < this.activeEvent.length; i++) {
				this.activeEvent[i]();
			}

            while (queue.length > 0 && currentJobs < this.maxJobs) {
                
                currentJobs++;
                var fn = queue.shift();

                fn(function () {
                    currentJobs--;
                    self.process();
                });
            }


        } else {
            if (tout) {
                clearTimeout(tout);
                tout = 0;
            }

            tout = setTimeout(function () {
                self.process();
            }, 1000);
			
			if(queue.length === 0) {
				for(var i = 0; i < this.inactiveEvent.length; i++) {
					this.inactiveEvent[i]();
				}
			}
        }
    };

    this.process();
};