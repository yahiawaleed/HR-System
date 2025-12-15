"use client";

import React from "react";

export const Topbar: React.FC = () => {
  return (
    <header style={{
      height: "64px",
      borderBottom: "1px solid #e2e8f0",
      backgroundColor: "#ffffff",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 32px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
    }}>
      <div style={{
        fontSize: "18px",
        fontWeight: 600,
        color: "#0f172a",
        letterSpacing: "-0.01em"
      }}>
        HR Dashboard
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <span style={{
          fontSize: "14px",
          color: "#475569",
          fontWeight: 500
        }}>
          Admin
        </span>
      </div>
    </header>
  );
};
