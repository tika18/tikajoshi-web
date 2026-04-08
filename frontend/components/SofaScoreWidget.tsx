"use client";
import { useEffect, useRef } from "react";

export default function SofaScoreWidget({ sport = "cricket" }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Clean up previous widget
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }

    const wrapper = document.createElement("div");
    
    // Config properties for sofascore
    wrapper.innerHTML = `
      <div 
        class="sofascore-widget" 
        data-widget="events" 
        data-sport="${sport}"
        data-id=""
      ></div>
    `;

    if (containerRef.current) {
      containerRef.current.appendChild(wrapper);
    }

    // Attempt to inject their library
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://widget.sofascore.com/widget.js";
    script.async = true;
    script.id = "sofascore-script";
    
    // Only append if not already exists
    if (!document.getElementById("sofascore-script")) {
      document.body.appendChild(script);
    } else {
      // If it exists, we might need to trigger a reload or re-init
      // Usually, the script watches for new elements
    }

    return () => {
      // Optional: keep script if other widgets might use it, or remove it
      // For single page apps, it's safer to keep it once loaded
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [sport]);

  return (
    <div className="w-full h-full min-h-[600px] flex flex-col">
      <div ref={containerRef} className="w-full flex-1" />
    </div>
  );
}
