var logger = {
	
	log : function(msg) {
		if (!window.avoidConsoleOutput)
			console.log(msg);
	}

};