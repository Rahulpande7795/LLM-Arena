"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

// ============================================================
// TYPES
// ============================================================

interface TiltedCardProps {
  /** SVG string or image URL for the card visual */
  imageSrc?:           string;
  /** Whether imageSrc is a URL (true) or raw SVG string (false) */
  isUrl?:              boolean;
  altText?:            string;
  captionText?:        string;
  containerHeight?:    string | number;
  containerWidth?:     string | number;
  imageHeight?:        string | number;
  imageWidth?:         string | number;
  rotateAmplitude?:    number;
  scaleOnHover?:       number;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showMobileWarning?:  boolean;
  showTooltip?:        boolean;
  displayOverlayContent?: boolean;
  overlayContent?:     React.ReactNode;
  /** Model accent color for border glow */
  accentColor?:        string;
}

// ============================================================
// COMPONENT
// ============================================================

export default function TiltedCard({
  imageSrc,
  isUrl = false,
  altText         = "",
  captionText     = "",
  containerHeight = "240px",
  containerWidth  = "200px",
  imageHeight     = "200px",
  imageWidth      = "160px",
  rotateAmplitude = 12,
  scaleOnHover    = 1.06,
  showTooltip     = true,
  displayOverlayContent = true,
  overlayContent,
  accentColor     = "var(--accent)",
}: TiltedCardProps) {
  const cardRef  = useRef<HTMLDivElement>(null);
  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(0);
  const [hovered, setHovered] = useState(false);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width  / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    setRotY(dx * rotateAmplitude);
    setRotX(-dy * rotateAmplitude);
  }

  function handleMouseLeave() {
    setRotX(0);
    setRotY(0);
    setHovered(false);
  }

  return (
    <div
      style={{
        perspective: 800,
        height:      containerHeight,
        width:       containerWidth,
        cursor:      "pointer",
        position:    "relative",
      }}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        animate={{
          rotateX: rotX,
          rotateY: rotY,
          scale:   hovered ? scaleOnHover : 1,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 22, mass: 0.5 }}
        style={{
          width:           "100%",
          height:          "100%",
          borderRadius:    "var(--r-xl)",
          backgroundColor: "var(--bg-2)",
          border:          `1.5px solid color-mix(in srgb, ${accentColor} 30%, var(--border))`,
          boxShadow:       hovered
            ? `var(--shadow-lg), 0 0 28px color-mix(in srgb, ${accentColor} 40%, transparent)`
            : "var(--shadow-md)",
          overflow:        "hidden",
          display:         "flex",
          flexDirection:   "column",
          alignItems:      "center",
          justifyContent:  "center",
          gap:             12,
          padding:         16,
          transformStyle:  "preserve-3d",
          position:        "relative",
        }}
      >
        {/* SVG / Image visual */}
        {imageSrc && (
          isUrl ? (
            <Image
              src={imageSrc}
              alt={altText}
              width={typeof imageWidth === "number" ? imageWidth : 160}
              height={typeof imageHeight === "number" ? imageHeight : 200}
              style={{ objectFit: "contain", borderRadius: "var(--r-lg)" }}
            />
          ) : (
            <div
              aria-label={altText}
              style={{
                width:  imageWidth,
                height: imageHeight,
              }}
              dangerouslySetInnerHTML={{ __html: imageSrc }}
            />
          )
        )}

        {/* Caption */}
        {showTooltip && captionText && (
          <span
            style={{
              fontSize:   13,
              fontWeight: 600,
              color:      "var(--ink-2)",
              textAlign:  "center",
              whiteSpace: "nowrap",
              overflow:   "hidden",
              textOverflow: "ellipsis",
              maxWidth:   "100%",
            }}
          >
            {captionText}
          </span>
        )}

        {/* Overlay content */}
        {displayOverlayContent && overlayContent && hovered && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{    opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
            style={{
              position:        "absolute",
              inset:           0,
              display:         "flex",
              alignItems:      "flex-end",
              justifyContent:  "center",
              padding:         12,
              background:      "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)",
              borderRadius:    "inherit",
            }}
          >
            {overlayContent}
          </motion.div>
        )}

        {/* Glare shimmer */}
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.12 }}
            style={{
              position:         "absolute",
              inset:            0,
              background:       `radial-gradient(circle at ${50 + rotY * 2}% ${50 - rotX * 2}%, var(--shimmer-color), transparent 70%)`,
              pointerEvents:    "none",
              borderRadius:     "inherit",
            }}
          />
        )}
      </motion.div>
    </div>
  );
}
