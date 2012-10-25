//Пример с рекурсией.
//Меньше кода для решения конкретной задачи, не нужно переворачивать массив после обработки.
function reversePrint (linkedList) {
    if (linkedList.next !== null) {
        reversePrint(linkedList.next);
    }
    console.log(linkedList.value);
}

//Перебор в цикле работает ощутимо быстрее на больших объёмах данных.
//Позволяет отслеживать состояние и котролировать процесс во время обработки.
function reversePrint2 (linkedList) {
    var o = linkedList, result = [];
    while (o) {
        result.push(o.value);
        o = o.next;
    }
    console.log(result.reverse());
}

var someList = {
    value: 1,
    next: {
        value: 2,
        next: {
            value: 3,
            next: {
                value: 4,
                next: null
            }
        }
    }
};

reversePrint(someList);
reversePrint2(someList);