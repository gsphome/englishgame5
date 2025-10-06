// Modal Debug Script - Copy to Chrome DevTools Console
// Run this in the browser console when the Profile modal is open

(function debugModal() {
  const container = document.querySelector('.compact-profile__container');
  const content = document.querySelector('.compact-profile__content');

  if (!container || !content) {
    console.log('❌ Modal elements not found. Make sure Profile modal is open.');
    return;
  }

  const getComputedStyles = (element, properties) => {
    const computed = window.getComputedStyle(element);
    const result = {};
    properties.forEach(prop => {
      result[prop] = computed.getPropertyValue(prop);
    });
    return result;
  };

  const getBoxModel = (element) => {
    const rect = element.getBoundingClientRect();
    const computed = window.getComputedStyle(element);
    return {
      width: rect.width,
      height: rect.height,
      margin: {
        top: computed.marginTop,
        right: computed.marginRight,
        bottom: computed.marginBottom,
        left: computed.marginLeft
      },
      border: {
        top: computed.borderTopWidth,
        right: computed.borderRightWidth,
        bottom: computed.borderBottomWidth,
        left: computed.borderLeftWidth
      },
      padding: {
        top: computed.paddingTop,
        right: computed.paddingRight,
        bottom: computed.paddingBottom,
        left: computed.paddingLeft
      }
    };
  };

  console.log('🔍 MODAL DEBUG REPORT');
  console.log('====================');

  console.log('\n📦 CONTAINER (.compact-profile__container):');
  console.log('Computed Styles:', getComputedStyles(container, [
    'background-color', 'border', 'border-radius', 'padding', 'margin'
  ]));
  console.log('Box Model:', getBoxModel(container));

  console.log('\n📄 CONTENT (.compact-profile__content):');
  console.log('Computed Styles:', getComputedStyles(content, [
    'background-color', 'border', 'border-radius', 'padding', 'margin'
  ]));
  console.log('Box Model:', getBoxModel(content));

  console.log('\n🏗️ HTML STRUCTURE:');
  console.log(container.outerHTML.substring(0, 500) + '...');

  console.log('\n🎨 VISUAL ANALYSIS:');
  const containerBg = getComputedStyles(container, ['background-color'])['background-color'];
  const contentBg = getComputedStyles(content, ['background-color'])['background-color'];

  console.log(`Container background: ${containerBg}`);
  console.log(`Content background: ${contentBg}`);
  console.log(`Same background: ${containerBg === contentBg}`);

  // Check for any elements between container and content
  const directChildren = Array.from(container.children);
  console.log('\n👶 DIRECT CHILDREN OF CONTAINER:');
  directChildren.forEach((child, index) => {
    console.log(`${index + 1}. ${child.className} - bg: ${window.getComputedStyle(child).backgroundColor}`);
  });

})();