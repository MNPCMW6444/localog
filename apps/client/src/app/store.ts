let currentValue: any = null;
const listeners = new Set<() => void>();

export const launchStore = {
  get: () => currentValue,
  set: (val: any) => {
    currentValue = val;
    listeners.forEach((l) => l());
  },
  subscribe: (cb: () => void) => {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
};
