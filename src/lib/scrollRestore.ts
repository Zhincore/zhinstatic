interface PageStack {
  segment: string;
  scroll: number;
  next?: PageStack;
}

class ScrollRestore {
  private stack: PageStack = {
    segment: "/",
    scroll: 0,
  };

  private getStackRef(path: string, create = false) {
    const segments = path.split("/");
    let ref = this.stack;
    for (const segment of segments) {
      if (!segment) continue;
      if (ref.next?.segment !== segment) {
        if (create) {
          ref.next = { segment, scroll: 0 };
        } else {
          return;
        }
      }
      ref = ref.next;
    }
    return ref;
  }

  getPathScroll(path: string) {
    const ref = this.getStackRef(path);
    return ref?.scroll ?? 0;
  }

  setPathScroll(path: string, scroll: number) {
    const ref = this.getStackRef(path, true);
    if (!ref) return; // This will never happen
    ref.scroll = scroll;
  }
}

export default new ScrollRestore();
