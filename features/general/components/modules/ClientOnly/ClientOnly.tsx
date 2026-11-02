"use client";

import { PropsWithChildren, useEffect, useState } from "react";

function ClientOnly({ children }: PropsWithChildren) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setIsClient(true));
  });

  if (!isClient) {
    return null;
  }

  return children;
}

export default ClientOnly;
