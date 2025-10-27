import { config } from "./config.mjs";

export default class Directory {
    static root;

    directories = [];
    files = [];
    parent;
    current;

    constructor(name, structObj, parent) {
        this.name = name;
        this.current = structObj;
        this.parent = parent;

        if (this.name == 'root') Directory.root = this;

        this.files = structObj.files ?? [];
    }

    static parse(name = 'root', struct = config.struct.root, parent = null) {
        let child, results = [];

        for (const [dir, content] of Object.entries(struct.directories)) {
            parent = parent ?? new Directory(name, struct);
            child = new Directory(dir, content, parent);

            if (content.directories !== undefined && Object.keys(content.directories)) {
                Directory.parse(name, content, child);
            }

            parent.appendChild(child)

            results = parent;
        }
        return results;
    }

    static findByPath(slashedPath, currentPath = null) {
        let splittedPath = slashedPath.replace(/[\\]{3,}/g, '\\').split('\\');
        currentPath = currentPath ?? Directory.root;

        for (let part of splittedPath) {
            if (part == '..' && currentPath.name !== 'root') currentPath = currentPath.parent;
            else if (part == '..' && currentPath.name == 'root') currentPath = currentPath;
            else {
                currentPath = currentPath.directories.filter(dir => dir.name === part)[0];

                if (!currentPath) return {status: 'error', code: 'PATH_NOT_FOUND'};
            }
        }

        return currentPath;
    }

    appendChild(...children) { 
        children.forEach(child => { this.directories.push(child) })
    }
}