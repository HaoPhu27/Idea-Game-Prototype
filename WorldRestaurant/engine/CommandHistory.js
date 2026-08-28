export class CommandHistory {
    constructor(maxUndo = 3) {
        this.stack = [];
        this.maxUndo = maxUndo;
    }

    push(command) {
        this.stack.push(command);
    }

    undo() {
        if (this.canUndo()) {
            const command = this.stack.pop();
            return command.stateBefore;
        }
        return null;
    }

    canUndo() {
        return this.stack.length > 0 && this.stack.length <= this.maxUndo; // Or limit total allowed undos per level
    }
    
    get undoCount() {
        return this.stack.length;
    }

    clear() {
        this.stack = [];
    }
}
