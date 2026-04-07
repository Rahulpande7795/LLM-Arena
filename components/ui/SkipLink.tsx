"use client";

// SkipLink — keyboard accessibility skip-to-content link
// Must be a Client Component because it uses onFocus/onBlur event handlers.

export function SkipLink() {
  return (
    <a
      href="#main-content"
      style={{
        position:        "absolute",
        top:             -40,
        left:            0,
        padding:         "8px 16px",
        backgroundColor: "var(--accent)",
        color:           "var(--bg)",
        zIndex:          9999,
        borderRadius:    "0 0 var(--r-md) 0",
        fontWeight:      600,
        fontSize:        14,
        textDecoration:  "none",
        transition:      "top 150ms ease-out",
      }}
      onFocus={(e) => { (e.currentTarget as HTMLElement).style.top = "0"; }}
      onBlur={(e)  => { (e.currentTarget as HTMLElement).style.top = "-40px"; }}
    >
      Skip to main content
    </a>
  );
}
