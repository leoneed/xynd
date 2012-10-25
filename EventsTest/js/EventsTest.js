
var print = function(str){
	document.write(str + '<br />');
}
var last_time = (new Date()).valueOf();
var time = function(str) {
	var time = (new Date()).valueOf();
	print(str + ": " + (time - last_time) + "ms");
	last_time = time;
}

var testEvents = function (e_count, f_count, o_count) {
	var functions = {}, objects = {}, events = [], i, n, g;

	var addEvents = function(e_count, f_count, o_count) {
	var e, f, o;

		for (e=0;e<e_count;e++) {
			for (f=0;f<f_count;f++) {
				for (o=0;o<o_count;o++) {
					objects['obj_'+o].addEventListener(events[e], functions['func_'+f]);
				}
			}
		}
	}


	for (i=0; i<e_count; i++) {
		events.push("test_"+i);
	}
	for (i=0; i<o_count; i++) {
		objects['obj_'+i] = new Events();
	}
	for (i=0; i<f_count; i++) {
		functions['func_'+i] = function() {
		}
	}

	time("Add events");

	addEvents(e_count, f_count, o_count);

	time("Events added");

	for (i=0;i<e_count;i++){
		for (n=0;n<100;n++){
			Events.triggerGlobalEvent(events[i]);
		}
	}

	time("Events called");

	for (i=e_count; i > 0; i--) {
		g = Math.floor((Math.random()*i));
		for (n=0;n<o_count;n++) {
			objects['obj_'+n].removeEventListener(events[g]);
		}
		events.splice(g,1);
	}

	time("Events removed");
}

print("TEST 10 events, 10 functions, 10 object");
testEvents(10, 10, 10);


print("TEST 100 events, 10 functions, 10 object");
testEvents(100, 10, 10);


print("TEST 10 events, 100 functions, 10 object");
testEvents(10, 100, 10);


print("TEST 10 events, 10 functions, 100 object");
testEvents(10, 10, 100);

// var a = function () {console.log("Called function 'a'");}
// var b = function () {console.log("Called function 'b'");}
// var c = function () {console.log("Called function 'c'");}
// var d = function () {console.log("Called function 'd'");}

// var newEventObj = new Events();
// newEventObj.addEventListener('start', a);
// newEventObj.addEventListener('start', c);
// newEventObj.addEventListener('finish', b);

// var oneMoreObj = new Events();
// oneMoreObj.addEventListener(['start', 'finish'], c);
// oneMoreObj.someMethod = function () {
// 	if (this === oneMoreObj) {
// 		console.log('Method of newEventObj called');
// 	}
// 	else {
// 		console.log('Function from newEventObj called');
// 	}
// }
// oneMoreObj.addEventListener('finish', 'someMethod');
// newEventObj.addEventListener('finish', oneMoreObj.someMethod);

// Events.addEventListener('start', d);
// Events.addEventListener('finish', oneMoreObj.someMethod);

// var trickyObj = Events({
// 	events: {
// 		start: 'trickyMethod',
// 		finish: 'notCreatedYet'
// 	},

// 	trickyMethod: function() {
// 		console.log('add new event');
// 		this.addEventListener('finish', oneMoreObj.someMethod);
// 	}
// });

// trickyObj.notCreatedYet = function() {console.log("Method added later");}
