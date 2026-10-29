export class CommandHistory {
    constructor(maxUndo = 3) {
        this.stack = [];
        this.maxUndo = maxUndo;
        this.undosUsed = 0;
    }

    push(command) {
        this.stack.push(command);
        // Only the most recent maxUndo commands are ever undoable
        while (this.stack.length > this.maxUndo) {
            this.stack.shift();
        }
    }

    undo() {
        if (this.canUndo()) {
            const command = this.stack.pop();
            this.undosUsed++;
            return command.stateBefore;
        }
        return null;
    }

    canUndo() {
        return this.stack.length > 0 && this.undosUsed < this.maxUndo;
    }

    get undoCount() {
        return this.stack.length;
    }

    get undosLeft() {
        return this.maxUndo - this.undosUsed;
    }

    clear() {
        this.stack = [];
        this.undosUsed = 0;
    }
}
