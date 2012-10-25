var Events = (function(){

	var globalEventsObject,
		global_events_objects = {};

	var Events = function(objToAddEvents) {

		var eventsKeys, ekeys_scount, ekey,
			local_events = {},
			getLocalEvents = function(){
				return local_events;
			}

		if (!(this instanceof Events)) {
			if (!(objToAddEvents && typeof objToAddEvents === 'object')) {
				throw TypeError("Object is expected");
			}

			objToAddEvents.addEventListener 	= Events.prototype.addEventListener;
			objToAddEvents.removeEventListener 	= Events.prototype.removeEventListener;
			objToAddEvents.triggerEvent 		= Events.prototype.triggerEvent;
			objToAddEvents.triggerGlobalEvent 	= Events.prototype.triggerGlobalEvent;
			objToAddEvents.__getLocalEvents 	= getLocalEvents;

			if (objToAddEvents.events && typeof objToAddEvents.events === "object") {
				eventsKeys = objToAddEvents.events.keys();
				ekeys_scount = eventsKeys.length;
				for (ekey = 0; ekey < ekeys_scount; ekey++) {
					objToAddEvents.addEventListener(eventsKeys[ekey], objToAddEvents.events[eventsKeys[ekey]]);
				}
			}

			return objToAddEvents;
		}
		else {
			this.__getLocalEvents = getLocalEvents;
		}
	}

	var checkEventType = function (event) {
		if (!(typeof event === 'string' || event instanceof String)) {
			throw new TypeError("Event is not a string");
		}
	}

	var checkFunctionType = function (func) {
		if (!(typeof func === 'function' || typeof func === 'string' || func instanceof String)) {
			throw new TypeError("String or Function expected as second argument");
		}
	}

	var deleteFromGlobal = function(event, that) {
		var object_index;
		if (global_events_objects[event] !== undefined) {
			object_index = global_events_objects[event].indexOf(that);
			if (object_index >= 0) {
				global_events_objects[event].splice(object_index, 1);
				if (global_events_objects[event].length === 0) {
					delete global_events_objects[event];
				}
			}
		}
	}

	Events.prototype.addEventListener = function(event, func) {
		var that, local_events;

		if (event instanceof Array) {
			that = this;
			return event.map(function(event){
				that.addEventListener(event, func);
			});
		}

		checkFunctionType(func);
		checkEventType(event);

		if (event === 'All') {
			event = 'AfterAll';
		}

		event = event.toLowerCase();

		local_events = this.__getLocalEvents();
		if (!local_events[event]) {
			local_events[event] = [];
		}
		else {
			if (local_events[event].indexOf(func) >= 0) {
				return false;
			}
		}

		local_events[event].push(func);

		if (!global_events_objects[event]) {
			global_events_objects[event] = [];
		}
		else {
			if (global_events_objects[event].indexOf(this) >= 0) {
				return true;
			}
		}

		global_events_objects[event].push(this)
		return true;
	}

	Events.prototype.removeEventListener = function(event, func) {
		var local_events, eventKeys, ekey_count, ekey, that, func_index,
			remove_all_events = false;

		if (event instanceof Array) {
			that = this;
			return event.map(function(event){
				that.removeEventListener(event, func);
			});
		}

		checkEventType(event);
		event = event.toLowerCase();

		if (func !== undefined) {
			checkFunctionType(func);
		}
		else {
			remove_all_events = true;
		}

		local_events = this.__getLocalEvents();

		if (event == 'all') {
			eventKeys = local_events.keys();
			ekey_count = eventKeys.length;
			for (ekey = 0; ekey < ekey_count; ekey++) {
				if (remove_all_events) {
					delete local_events[eventKeys[ekey]];
					deleteFromGlobal(eventKeys[ekey], this);
				}
				else {
					func_index = local_events[eventKeys[ekey]].indexOf(func);
					if (func_index >= 0) {
						local_events[eventKeys[ekey]].splice(func_index, 1);
						if (local_events[eventKeys[ekey]].length === 0) {
							delete local_events[eventKeys[ekey]];
							deleteFromGlobal(eventKeys[ekey], this);
						}
					}
				}
			}
			return true;
		}
		else {
			if (!local_events[event]) {
				return false;
			}

			if (!remove_all_events) {
				func_index = local_events[event].indexOf(func);
				if (func_index >= 0) {
					local_events[event].splice(func_index, 1);
				}
				else {
					return false;
				}
			}
		}

		if (local_events[event].length === 0 || remove_all_events) {
			delete local_events[event];
			deleteFromGlobal(event, this);
		}

		return true;
	}

	Events.prototype.triggerEvent = function(event) {
		var args_length, callFunction, i,
			local_events = this.__getLocalEvents(),
			args = [],
			result = [],
			that = this;

		if (event == 'beforeall' || event == 'aftereall') {
			return [];
		}

		checkEventType(event);

		callFunction = function (func) {
			if (typeof func === "string" || func instanceof String) {
				if (func in that && typeof that[func] === "function") {
					return that[func].apply(that, args);
				}
				else {
					throw new ReferenceError("Function '" + func + "' not found in " + this.toString());
				}
			}
			else if (typeof func === "function") {
				return func.apply(that, args);
			}
		}

		args_length = arguments.length;
		args.push(event);
		if (args_length > 1) {
			for (i = 1; i < args_length; i++) {
				args.push(arguments[i]);
			}
		}

		if (local_events['beforeall'] !== undefined) {
			local_events['beforeall'].map(callFunction);
		}

		if (local_events[event] !== undefined) {
			result = local_events[event].map(callFunction);
		}
		
		if (local_events['afterall'] !== undefined) {
			local_events['afterall'].map(callFunction);
		}
		return result;
	}

	Events.prototype.triggerGlobalEvent = function(event) {
		var args_length, i;

		if (event == 'beforeall' || event == 'aftereall') {
			return [];
		}
		checkEventType(event);

		args_length = arguments.length, args = [];
		args[0] = event;
		if (args_length > 1) {
			for (i = 1; i < args_length; i++) {
				args.push(arguments[i]);
			}
		}
		if (global_events_objects[event] !== undefined) {
			return global_events_objects[event].map(function(object_with_events){
				return object_with_events.triggerEvent.apply(object_with_events, args);
			});
		}
	}

//Static methods
	var getGlobalEventsObject = function () {
		if (!globalEventsObject) {
			globalEventsObject = new Events();
		}
		return globalEventsObject;
	}

	Events.addEventListener = function (event, func) {
		return getGlobalEventsObject().addEventListener(event, func);
	}

	Events.removeEventListener = function (event, func) {
		return getGlobalEventsObject().removeEventListener(event, func);
	}

	Events.triggerEvent = function (event) {
		var globalObject = getGlobalEventsObject();
		return globalObject.triggerEvent.apply(globalObject, arguments);
	}

	Events.triggerGlobalEvent = function (event) {
		var globalObject = getGlobalEventsObject();
		return globalObject.triggerGlobalEvent.apply(globalObject, arguments);
	}

//For tests only
	Events.__getGlobalObject = function() {
		return global_events_objects;
	}

	return Events;
})();