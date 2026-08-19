/**
 * Birthday Studio - Universal Add Menu View
 * Clean primary popover menu for adding Text, Photo, Video, Countdown, Shape, and Buttons
 */

export class UniversalAddMenuView {
  constructor(onSelectItem = (() => {}), onClose = (() => {})) {
    this.onSelectItem = onSelectItem;
    this.onClose = onClose;
  }

  render() {
    const popover = document.createElement('div');
    popover.className = 'universal-add-popover';
    popover.id = 'universalAddPopover';

    const items = [
      { id: 'text', label: 'Text', icon: '🔤' },
      { id: 'image', label: 'Photo', icon: '🖼️' },
      { id: 'video', label: 'Video', icon: '🎬' },
      { id: 'countdown', label: 'Countdown', icon: '⏳' },
      { id: 'shape', label: 'Sticker', icon: '✨' },
      { id: 'button', label: 'Button', icon: '🔘' }
    ];

    popover.innerHTML = `
      ${items.map(item => `
        <div class="universal-add-item" data-add-type="${item.id}">
          <span class="universal-add-item-icon">${item.icon}</span>
          <span>${item.label}</span>
        </div>
      `).join('')}
    `;

    popover.addEventListener('click', (e) => {
      const item = e.target.closest('[data-add-type]');
      if (item) {
        this.onSelectItem(item.dataset.addType);
        this.onClose();
      }
    });

    // Close on click outside
    const clickOutsideHandler = (e) => {
      if (!popover.contains(e.target) && !e.target.closest('[data-action="add"]') && !e.target.closest('#btnMobileAddTool')) {
        this.onClose();
        document.removeEventListener('pointerdown', clickOutsideHandler);
      }
    };
    setTimeout(() => {
      document.addEventListener('pointerdown', clickOutsideHandler);
    }, 50);

    return popover;
  }
}
