// https://svelte.dev/repl/0ace7a508bd843b798ae599940a91783?version=3.16.7

/** Dispatch event on click outside of node */
export function onClickOutside(node: Element, handler: (event: Event) => void) {
  const handleClick = (event: Event) => {
    if (node && !node.contains(event.target as Element) && !event.defaultPrevented) {
      handler(event);
    }
  };

  document.addEventListener("click", handleClick, true);

  return {
    destroy() {
      document.removeEventListener("click", handleClick, true);
    },
  };
}
