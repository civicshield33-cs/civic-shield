export function resetToWelcome(navigation: {
  getParent?: () => any;
  getState?: () => { routeNames?: string[] };
  reset?: (state: { index: number; routes: { name: string }[] }) => void;
}) {
  let current: any = navigation;

  while (current) {
    const routeNames = current.getState?.()?.routeNames;
    if (routeNames?.includes("Welcome")) {
      current.reset({
        index: 0,
        routes: [{ name: "Welcome" }],
      });
      return;
    }
    current = current.getParent?.();
  }
}
