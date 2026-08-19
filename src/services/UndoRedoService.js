/**
 * Birthday Studio - Undo / Redo History Stack Manager (Section 13)
 */

export class UndoRedoService {
  constructor(maxHistory = 30) {
    this.maxHistory = maxHistory;
    this.undoStack = [];
    this.redoStack = [];
  }

  pushState(projectState) {
    if (!projectState) return;
    const jsonState = JSON.stringify(projectState);

    // Avoid pushing identical state
    if (this.undoStack.length > 0 && this.undoStack[this.undoStack.length - 1] === jsonState) {
      return;
    }

    this.undoStack.push(jsonState);
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }
    this.redoStack = []; // Clear redo stack on new action
  }

  undo(currentState) {
    if (!this.canUndo()) return null;
    const previous = this.undoStack.pop();
    this.redoStack.push(JSON.stringify(currentState));
    return JSON.parse(previous);
  }

  redo(currentState) {
    if (!this.canRedo()) return null;
    const next = this.redoStack.pop();
    this.undoStack.push(JSON.stringify(currentState));
    return JSON.parse(next);
  }

  canUndo() {
    return this.undoStack.length > 0;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }
}
