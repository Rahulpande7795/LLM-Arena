"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BottomSheetProps {
  isOpen:   boolean;
  onClose:  () => void;
  title:    string;
  children: React.ReactNode;
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Disable body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{    opacity: 0 }}
            onClick={onClose}
            style={{
              position:        "fixed",
              top:             0,
              left:            0,
              right:           0,
              bottom:          0,
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              zIndex:          100,
              backdropFilter:  "blur(2px)",
            }}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{    y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            style={{
              position:        "fixed",
              bottom:          0,
              left:            0,
              right:           0,
              backgroundColor: "var(--bg-1)",
              borderTopLeftRadius:  "var(--r-xl)",
              borderTopRightRadius: "var(--r-xl)",
              zIndex:          101,
              maxHeight:       "85vh",
              display:         "flex",
              flexDirection:   "column",
              boxShadow:       "0 -8px 24px rgba(0,0,0,0.12)",
            }}
          >
            {/* Handle / Drag Indicator */}
            <div
              style={{
                width:         "100%",
                height:        24,
                display:       "flex",
                justifyContent: "center",
                alignItems:     "center",
                cursor:         "grab",
              }}
            >
              <div
                style={{
                  width:           40,
                  height:          4,
                  backgroundColor: "var(--border-s)",
                  borderRadius:    2,
                }}
              />
            </div>

            {/* Header */}
            <div
              style={{
                padding: "0 20px 12px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>{title}</h2>
              <button
                onClick={onClose}
                style={{
                  padding: "4px 8px",
                  fontSize: 14,
                  color: "var(--ink-4)",
                  background: "none",
                  border: "none"
                }}
              >
                Close
              </button>
            </div>

            {/* Content */}
            <div
              ref={scrollRef}
              style={{
                padding:   "20px",
                overflowY: "auto",
                flex:      1,
              }}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
