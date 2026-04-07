"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ViewMode } from "@/types";

// ============================================================
// ICONS
// ============================================================

const GridIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const SlidersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/>
    <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
    <line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/>
    <line x1="17" y1="16" x2="23" y2="16"/>
  </svg>
);

const ChevronIcon = ({ collapsed }: { collapsed: boolean }) => (
  <svg
    width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    style={{
      transform:  collapsed ? "rotate(180deg)" : "rotate(0deg)",
      transition: "transform 200ms ease-out",
    }}
  >
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

// ============================================================
// NAV ITEMS CONFIG
// ============================================================

const NAV_ITEMS: { id: ViewMode; icon: React.ReactNode; label: string }[] = [
  { id: "compare",  icon: <GridIcon />,    label: "Compare"  },
  { id: "history",  icon: <ClockIcon />,   label: "History"  },
  { id: "settings", icon: <SlidersIcon />, label: "Settings" },
];

// ============================================================
// TYPES
// ============================================================

interface SidebarProps {
  collapsed:      boolean;
  onToggle:       () => void;
  currentView:    ViewMode;
  onViewChange:   (v: ViewMode) => void;
  stats: {
    runCount:   number;
    totalTokens: number;
    avgTTFT:    number;
  };
  // Mobile
  mobileOpen:     boolean;
  onMobileClose:  () => void;
}

// ============================================================
// COMPONENT
// ============================================================

export function Sidebar({
  collapsed,
  onToggle,
  currentView,
  onViewChange,
  stats,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {

  return (
    <>
      {/* ── Mobile overlay backdrop ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{    opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onMobileClose}
            style={{
              position:        "fixed",
              inset:           0,
              backgroundColor: "color-mix(in srgb, var(--bg) 40%, transparent)",
              backdropFilter:  "blur(4px)",
              zIndex:          29,
            }}
            className="mobile-backdrop"
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar panel ── */}
      <motion.aside
        animate={{ x: 0 }}
        style={{
          position:        "sticky",
          top:             0,
          height:          "100dvh",
          width:           collapsed ? 64 : 268,
          flexShrink:      0,
          display:         "flex",
          flexDirection:   "column",
          backgroundColor: "color-mix(in srgb, var(--bg-1) 90%, transparent)",
          backdropFilter:  "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderRight:     "1px solid var(--border)",
          overflow:        "hidden",
          zIndex:          30,
          transition:      "width 220ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* ── Logo ── */}
        <div
          style={{
            height:      64,
            display:     "flex",
            alignItems:  "center",
            padding:     "0 16px",
            flexShrink:  0,
            gap:         10,
            borderBottom: "1px solid var(--border)",
          }}
        >
          <span
            style={{
              fontSize:   22,
              lineHeight: 1,
              flexShrink: 0,
              color:      "var(--accent-hi)",
            }}
          >
            ⚡
          </span>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                key="wordmark"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0  }}
                exit={{    opacity: 0, x: -8  }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                style={{
                  fontWeight:  800,
                  fontSize:    17,
                  color:       "var(--ink)",
                  whiteSpace:  "nowrap",
                  overflow:    "hidden",
                }}
              >
                LLM Arena
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* ── Nav items ── */}
        <nav
          style={{
            flex:          1,
            display:       "flex",
            flexDirection: "column",
            gap:           4,
            padding:       "12px 10px",
            overflowY:     "auto",
          }}
        >
          {NAV_ITEMS.map((item) => {
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                style={{
                  display:         "flex",
                  alignItems:      "center",
                  gap:             12,
                  padding:         "10px 12px",
                  paddingLeft:     active ? 9 : 12,
                  borderRadius:    "var(--r-md)",
                  border:          "none",
                  borderLeft:      active
                    ? "3px solid var(--accent)"
                    : "3px solid transparent",
                  backgroundColor: active ? "var(--bg-2)" : "transparent",
                  color:           active ? "var(--ink)" : "var(--ink-3)",
                  cursor:          "pointer",
                  transition:      "all 120ms ease-out",
                  width:           "100%",
                  textAlign:       "left",
                  flexShrink:      0,
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-3)";
                    (e.currentTarget as HTMLElement).style.color = "var(--ink)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "var(--ink-3)";
                  }
                }}
              >
                <span style={{ flexShrink: 0, lineHeight: 0 }}>{item.icon}</span>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      key={item.id + "-label"}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{    opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        fontSize:   14,
                        fontWeight: active ? 600 : 400,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </nav>

        {/* ── Stats (expanded only) ── */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              key="stats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{    opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{
                padding:     "12px 16px",
                borderTop:   "1px solid var(--border)",
                display:     "flex",
                flexDirection: "column",
                gap:         8,
              }}
            >
              {[
                { label: "RUNS",     value: stats.runCount },
                { label: "TOKENS",   value: stats.totalTokens.toLocaleString() },
                { label: "AVG TTFT", value: stats.avgTTFT > 0 ? `${stats.avgTTFT}ms` : "—" },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span
                    style={{
                      fontFamily:    "var(--font-jetbrains-mono), monospace",
                      fontSize:      11,
                      color:         "var(--ink-4)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize:   13,
                      fontWeight: 600,
                      color:      "var(--ink-2)",
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Collapse toggle ── */}
        <button
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          style={{
            display:         "flex",
            alignItems:      "center",
            justifyContent:  collapsed ? "center" : "flex-end",
            padding:         "12px 16px",
            background:      "none",
            border:          "none",
            borderTop:       "1px solid var(--border)",
            color:           "var(--ink-4)",
            cursor:          "pointer",
            width:           "100%",
            transition:      "color 120ms ease-out",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--ink-2)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--ink-4)")}
        >
          <ChevronIcon collapsed={collapsed} />
        </button>
      </motion.aside>
    </>
  );
}