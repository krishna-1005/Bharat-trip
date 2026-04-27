import React from 'react';
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  variant?: 'light' | 'dark' | 'color';
}

export function Logo({ className, iconOnly = false, variant = 'color' }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative size-10 shrink-0">
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Orange Pin/Swoosh Shape - Bold & Tapered */}
          <path
            d="M50 96C65 96 92 75 92 45C92 25 78 18 68 22L45 80C40 90 40 96 50 96Z"
            fill="#FF8A00"
          />

          {/* Deep Blue 'G' Shape - Thick Circular Loop */}
          <path
            d="M72 24C45 10 12 30 12 60C12 85 42 92 58 82L68 38L72 24Z"
            fill="#003B95"
          />

          {/* Airplane Silhouette - Solid & Dynamic */}
          <g transform="translate(62, 38) rotate(-28)">
            {/* Plane Body - Thick and rounded */}
            <path
              d="M-40 0C-40-2 0-12 45 0C45 2 0 12-40 0Z"
              fill="#00A1E4"
            />
            {/* Large Wings - Swept back */}
            <path
              d="M5 0L-18 -35L12 0L-18 35Z"
              fill="#00A1E4"
            />
            {/* Tail Fins */}
            <path
              d="M-30 0L-45 -18L-38 0L-45 18Z"
              fill="#00A1E4"
            />
          </g>
        </svg>
      </div>
      
      {!iconOnly && (
        <span className={cn(
          "font-sans font-bold text-2xl tracking-tight flex items-baseline",
          variant === 'light' ? "text-white" : "text-slate-900 dark:text-white"
        )}>
          <span className="font-extrabold text-[#003B95] dark:text-blue-400">Go</span>
          <span className="font-medium text-slate-600 dark:text-slate-300">Tripo</span>
        </span>
      )}
    </div>
  );
}
