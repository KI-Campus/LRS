import { ReactNode } from "react";

export default function EmptyLayout({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}
