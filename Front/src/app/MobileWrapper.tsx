import React from "react";

interface MobileWrapperProps {
  children: React.ReactNode;
  bgColor?: string;
  desktopMode?: "full" | "mobile-only"; 
}

export function MobileWrapper({ children, bgColor = "#f0f4ff", desktopMode = "mobile-only" }: MobileWrapperProps) {
  if (desktopMode === "full") {
    
    return (
      <div
        className="min-h-screen w-full"
        style={{ background: bgColor, fontFamily: "'Poppins', sans-serif" }}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{ background: bgColor, fontFamily: "'Poppins', sans-serif" }}
    >
      <div
        className="relative w-full overflow-hidden flex flex-col md:max-w-md lg:max-w-lg md:rounded-3xl md:shadow-2xl md:my-6"
        style={{
          maxWidth: 430,
          minHeight: "100svh",
          background: "#ffffff",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        {children}
      </div>
    </div>
  );
}