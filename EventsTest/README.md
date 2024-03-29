#### Есть ряд способов работы с Events:
1) Как со статическим объектом:

	Events.addEventListener(event, func);
	Events.triggerGlobalEvent(event);

2) Создание нового объекта:

	var eventsObject = new Events();

3) Добавление методов для работы с событиями к существующему объекту:

	Events(eventsObject);
	eventsObject.addEventListener(event, func);

#### Метод addEventListener(event, func) добавляет новое событие к объекту.

Первый параметр - событие. Может быть строкой, объектом String или массивом со списком событий.
Регистр символов не важен: "eVenT" == "event" .
Существуют специальные называния событий, поведение которых отличается:
- "AfterAll" - выполняется после отработки всех события в объекте. Инициируется любым событием.
- "BeforeAll" - выполняется перед отработкой любого вызванного события.
- "All" - происходит при вызове любого события.

Второй параметр - функция. Ожидается передача функции по ссылке, или имя свойства объекта(строка или String),
которое содержит ссылку на функцию. Возможно добавить ещё не существующий метод объекта, но если метод
не будет создан перед вызовом события, произойдёт ошибка.

Оба параметра обязательны.

Существует альтернативный способ добавления событий в объект при его инициализации:

	var newObjectWithEvents = Events({

		events: {
			'event1': 'functionName1',
			'event2': 'functionName2',
			'event3': 'functionName3',
			...
		},

		functionName1: function() {
			...
		}

	});

Где functionName(1..3) - методы созданного объекта.

Метод возвращает true в случае удачного добавления, и false если добавление невозможно или
такое событие с такой функцией уже существует. Если был передан массив, то результатом будет тоже
массив со статусами.

#### Метод removeEventListener(event, func) удаляет события из объекта.

Первый параметр - событие, или массив событий.
Возможно удалить события "BeforeAll" и "AfterAll".
При указании специального события "All" - удаляются все события объекта.

Второй не обязательный параметр - функция. Как и при добавлении события,
функция может быть ссылкой или строкой.
Если указан второй параметр, то функция будет отписана от указанного в 
первом параметре события, но событие продолжит работу для других функций,
если такие имеются. Если в первом параметре передана строка "All", то
функция будет отписана от всех событий в объекте.
Важно, чтоб функция была указана в том же виде, что и при добавлении события.

Метод возвращает true, если  событие успешно удалено, или false, если события не сущестует.

#### Метод triggerEvent(event) вызывает событие.

В первом параметре передаётся строка с именем события.
Остальные параметры могут быть любыми и в любом колличестве.
Название события, и все указанные за ним параметры будут в том же порядке переданы
функциям, которые подписаны на указанное событие.

Результатом отработки метода будет массив в результатами отработки подписанных на событие
функций, или пустой массив, если таковых нет. Результаты работы функций, подписанных на любое
событие, включены не будут.
	

#### Метод triggerGlobalEvent(event) 
вызвыает указанное в первом параметре событие для всех объектов,
в которых было добавлено это событие. Все переданные атрибуты будут переданы функциям-подпищикам.
Возвращается массив массивов с результатами, или пустой массив, если событие не найдено.

#### Пример:

	var a = function () {console.log("Called function 'a'");}
	var b = function () {console.log("Called function 'b'");}
	var c = function () {console.log("Called function 'c'");}
	var d = function () {console.log("Called function 'd'");}

	var newEventObj = new Events();
	newEventObj.addEventListener('start', a);
	newEventObj.addEventListener('start', c);
	newEventObj.addEventListener('finish', b);

	var oneMoreObj = new Events();
	oneMoreObj.addEventListener(['start', 'finish'], c);
	oneMoreObj.someMethod = function () {
		if (this === oneMoreObj) {
			console.log('Method of newEventObj called');
		}
		else {
			console.log('Function from newEventObj called');
		}
	}
	oneMoreObj.addEventListener('finish', 'someMethod');
	newEventObj.addEventListener('finish', oneMoreObj.someMethod);

	Events.addEventListener('start', d);
	Events.addEventListener('finish', oneMoreObj.someMethod);

	var trickyObj = Events({
		events: {
			start: 'trickyMethod',
			finish: 'notCreatedYet'
		},

		trickyMethod: function() {
			console.log('add new event');
			this.addEventListener('finish', oneMoreObj.someMethod);
		}
	});

	trickyObj.notCreatedYet = function() {console.log("Method added later");}

	//Результаты:
	newEventObj.triggerEvent('finish');
		//Called function 'b'
		//Function from newEventObj called 

	trickyObj.triggerEvent('finish');
		//Method added later

	Events.triggerGlobalEvent('start');
		//Called function 'a'
		//Called function 'c'
		//Called function 'c'
		//Called function 'd'
		//add new event

	oneMoreObj.triggerGlobalEvent('finish');
		//Called function 'b'
		//Function from newEventObj called
		//Called function 'c'
		//Method of newEventObj called 
		//Function from newEventObj called
		//Method added later
		//Function from newEventObj called 

	trickyObj.removeEventListener('all');
	oneMoreObj.removeEventListener('finish');
	newEventObj.removeEventListener('finish', oneMoreObj.someMethod);
	Events.removeEventListener('All', oneMoreObj.someMethod);

	trickyObj.triggerGlobalEvent('start');
		//Called function 'a'
		//Called function 'c'
		//Called function 'c'
		//Called function 'd'

	Events.triggerGlobalEvent('finish');
		//Called function 'b'
