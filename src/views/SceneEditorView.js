import { UniversalSceneEditor } from './UniversalSceneEditor.js';

export class SceneEditorView {
  constructor(options = {}) {
    this.editor = new UniversalSceneEditor(options);
  }

  render() {
    return this.editor.render();
  }

  setSelectedElementId(id) {
    if (this.editor) {
      this.editor.setSelectedElementId(id);
    }
  }
}

