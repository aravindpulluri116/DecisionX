"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type WorkspaceShellLayoutProps = {
  children: ReactNode;
  className?: string;
  mesh?: boolean;
};

export function WorkspaceShellLayout({
  children,
  className,
  mesh = true,
}: WorkspaceShellLayoutProps) {
  return (
    <div className={cn("relative min-h-0 flex-1 overflow-hidden bg-background", className)}>
      {mesh && <div className="mesh-bg pointer-events-none absolute inset-0 opacity-30" />}
      <div className="relative h-full">{children}</div>
    </div>
  );
}
