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
                        guest: {
                            directories: {
                                home: {
                                    files: ['passwd.txt', 'submarine_crush.txt'],
                                    directories: {
                                        files: {
                                            files: ['secret.jpeg']
                                        }
                                    }
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
        UNDEFINED_EXCEPTION: "Неизвестная ошибка",
        COMMAND_NOT_FOUND: "Команда не найдена",
        FILE_NOT_FOUND: "Файл не найден",
        PATH_NOT_FOUND: "Путь не найден",
        INVALID_CREDENTIALS: "Авторизация провалена",
        UNAVALIBLE_IN_LOCAL: "Невозможно выполнить команду в локальном режиме",
        ARGUMENT_NOT_FOUND: "Не переданы дополнительные параметры",
        CONTENT_TYPE_NOT_SUPPORTED: "Тип данных файла не поддерживается"
    },
    games: {
        mineswepper: {
            interval: { enabled: true },
            area: {
                width: {
                    min: 5,
                    max: 25
                }, height: {
                    min: 5,
                    max: 25
                }, mines: { // w*h * value e [min, max]
                    min: 0.3,
                    max: 0.7
                }
            }
        }
    }
}