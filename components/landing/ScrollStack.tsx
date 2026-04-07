"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// ============================================================
// SCROLL STACK ITEM
// ============================================================

interface ScrollStackItemProps {
  children: React.ReactNode;
  index?: number;
}

export function ScrollStackItem({ children, index = 0 }: ScrollStackItemProps) {
  return (
    <div
      className="scroll-stack-item"
      data-index={index}
      style={{
        position: "sticky",
        top: `${80 + index * 20}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: index + 1,
      }}
    >
      {children}
    </div>
  );
}

// ============================================================
// ICONS
// ============================================================

const icons = ["⚡", "🛠️", "📊", "🔒"];
const glowColors = [
  "rgba(139, 92, 246, 0.35)",
  "rgba(6, 182, 212, 0.35)",
  "rgba(251, 191, 36, 0.35)",
  "rgba(74, 222, 128, 0.35)",
];

// ============================================================
// SCROLL STACK
// ============================================================

interface ScrollStackProps {
  children: React.ReactNode;
}

export function ScrollStack({ children }: ScrollStackProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const childArray = React.Children.toArray(children);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.index ?? 0);
            setActiveIndex(idx);
          }
        });
      },
      { threshold: 0.5 }
    );

    const items = containerRef.current?.querySelectorAll(".scroll-stack-item");
    items?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        padding: "0 0 120px",
      }}
    >
      {childArray.map((child, i) => (
        <div
          key={i}
          className="scroll-stack-item"
          data-index={i}
          style={{
            position: "sticky",
            top: `${64 + i * 16}px`,
            zIndex: i + 1,
            padding: "24px 24px 8px",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, margin: "-80px" }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
            style={{
              maxWidth: 960,
              margin: "0 auto",
              borderRadius: "var(--r-2xl)",
              backgroundColor: "var(--bg-1)",
              border: "1px solid var(--border-s)",
              boxShadow: activeIndex === i
                ? `var(--shadow-lg), 0 0 60px ${glowColors[i % glowColors.length]}`
                : "var(--shadow-md)",
              overflow: "hidden",
              transition: "box-shadow 400ms ease-out",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr",
                gap: 0,
                minHeight: 220,
              }}
            >
              {/* Left accent panel */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 64,
                  backgroundColor: "var(--bg-2)",
                  borderRight: "1px solid var(--border)",
                  padding: 32,
                }}
              >
                <motion.span
                  animate={{
                    scale: activeIndex === i ? [1, 1.15, 1] : 1,
                  }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  {icons[i % icons.length]}
                </motion.span>
              </div>

              {/* Right content */}
              <div
                style={{
                  padding: "36px 40px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 12,
                }}
              >
                {/* Step number */}
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: 12,
                    color: "var(--accent)",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  0{i + 1}
                </span>
                {child}
              </div>
            </div>
          </motion.div>
        </div>
      ))}
    </div>
  );
}
