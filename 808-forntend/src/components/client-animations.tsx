"use client";

import { useEffect, useState } from "react";

// Client-side animation component that only renders after hydration
export function ClientAnimations() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Animated particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          >
            <div className="h-1 w-1 rounded-full bg-white/20"></div>
          </div>
        ))}
      </div>
      
      {/* Floating animation for scroll indicator */}
      <style jsx>{`
        .scroll-bounce {
          animation: bounce 2s infinite;
        }
        
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(-50%, 0, 0);
          }
          40%, 43% {
            transform: translate3d(-50%, -10px, 0);
          }
          70% {
            transform: translate3d(-50%, -5px, 0);
          }
          90% {
            transform: translate3d(-50%, -2px, 0);
          }
        }
      `}</style>
    </>
  );
}
