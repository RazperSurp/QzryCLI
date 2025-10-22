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
    struct: {
        root: {
            directories: {
                users: {
                    directories: {
                        home: {
                            directories: {
                                files: {
                                    files: ['passwd.txt']
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    users: [
        {username: 'guest', firstname: 'Anonymous'}
    ],
    errors: {
        COMMAND_NOT_FOUND: "Команда не найдена",
        FILE_NOT_FOUND: "Файл не найден",
        PATH_NOT_FOUND: "Путь не найден",
        INVALID_CREDENTIALS: "Авторизация провалена"
    }
}