export {};

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

  getPath(path: string) {
    const segments = path.split("/");
  }
}

export default new ScrollRestore();
