/**
 * Birthday Studio - Centralized Keyboard Shortcut Service (Section 11)
 * Manages Desktop Keyboard Shortcuts with Clean Input & ContentEditable Protection
 */

export class KeyboardShortcutService {
  static isInputActive(e) {
    if (!e) return false;
    const target = e.target;
    if (!target) return false;

    const tagName = (target.tagName || '').toUpperCase();
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tagName)) return true;
    if (target.isContentEditable) return true;
    
    if (typeof target.closest === 'function') {
      if (target.closest('[contenteditable="true"]')) return true;
      if (target.closest('input, textarea, select')) return true;
      if (target.closest('.canvas-selection-box')) return true;
    }

    if (document.activeElement) {
      const activeTag = (document.activeElement.tagName || '').toUpperCase();
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag)) return true;
      if (document.activeElement.isContentEditable) return true;
    }

    return false;
  }

  static init(handlers = {}) {
    const listener = (e) => {
      // Don't intercept ANY global shortcuts when user is typing inside text inputs, textareas, or contenteditable
      if (KeyboardShortcutService.isInputActive(e)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (handlers.onQuickAction) handlers.onQuickAction();
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (handlers.onSave) handlers.onSave();
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (handlers.onUndo) handlers.onUndo();
      }

      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (handlers.onRedo) handlers.onRedo();
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (handlers.onDuplicateScene) handlers.onDuplicateScene();
      }

      // CRITICAL: Explicit delete scene shortcut only (Ctrl+Shift+Delete or Alt+Delete, NEVER plain Backspace)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Delete') {
        e.preventDefault();
        if (handlers.onDeleteScene) handlers.onDeleteScene();
      }

      if (e.key === 'ArrowLeft' && (e.altKey || e.ctrlKey)) {
        if (handlers.onPrevScene) handlers.onPrevScene();
      }

      if (e.key === 'ArrowRight' && (e.altKey || e.ctrlKey)) {
        if (handlers.onNextScene) handlers.onNextScene();
      }
    };

    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }
}
