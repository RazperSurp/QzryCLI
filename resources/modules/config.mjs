export let config = {
    commands: {
        help: {
            args: {
                name: {
                    comment: "Название команды",
                    required: false
                }
            }, comment: 'Выводит список команд'
        }, ping: {
            comment: 'Возвращает "ПОНГ!"'
        }, pic: {
            args: {
                name: {
                    comment: "",
                    required: true
                }
            }, comment: 'Выводит запрошенное изображение'
        }
    },
    errors: {
        "-1": "Команда не найдена",
        "-2": "Изображение не найдено"
    }
}