import { Suspense, type ReactNode } from "react";
import ConnectivityFallback from "../ConnectivityFallback/ConnectivityFallback";

export interface ContentSuspenseProps {
  children: ReactNode;
  fallbackMessage?: string;
}

/**
 * Reusable Suspense wrapper providing consistent loading and connectivity fallback.
 */
export default function ContentSuspense({
  children,
  fallbackMessage = "Loading...",
}: ContentSuspenseProps) {
  return (
    <Suspense fallback={<ConnectivityFallback message={fallbackMessage} />}>
      {children}
    </Suspense>
  );
}
