import { config } from "./config.mjs";

export default class User {
    username;
    firstname;

    get homePath() { return `\\root\\users\\${this.username}\\home`; }

    constructor(username, password = null) {
        for (user of config.users) {
            if (
                user.username == username && 
                ((user.password !== undefined && user.password == password) ||
                (user.password === undefined)
            )) {
                this.username = user.username;
                this.firstname = user.firstname;

                break;
            }
        }
    }

    static login(username, password = null) {
        let user = new User(username, password);

        return (user.username ? user : '401');
    }
}