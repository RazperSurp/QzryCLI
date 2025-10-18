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
                    comment: "Название файла",
                    required: true
                }
            }, comment: 'Выводит запрошенное локальное изображение'
        }, randompic: {
            comment: 'Выводит случайное изображение с фотохостинга Imgur'
        }, cd: {
            args: {
                path: {
                    comment: "Название директории",
                    required: true
                }
            }, comment: 'Переходит в другую директорию'
        }
    },
    errors: {
        "-1": "Команда не найдена",
        "-2": "Изображение не найдено",
        "-3": "Путь не найден"
    }
}