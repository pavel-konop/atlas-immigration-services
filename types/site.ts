export type RouteParams<T extends string = string> = {
  params: Promise<Record<T, string>>;
};
