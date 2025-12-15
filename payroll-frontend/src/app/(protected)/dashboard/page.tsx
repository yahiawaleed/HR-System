"use client";

import Link from "next/link";
import React from "react";

export default function DashboardPage() {
  return (
    <div style={{ maxWidth: "1400px" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ 
          fontSize: "32px", 
          fontWeight: 700, 
          marginBottom: "8px",
          color: "#0f172a",
          letterSpacing: "-0.02em"
        }}>
          Dashboard
        </h1>
        <p style={{ 
          fontSize: "16px", 
          color: "#64748b", 
          lineHeight: "1.6"
        }}>
          Welcome to the HR System. Manage payroll configuration, approvals, and system administration.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
        }}
      >
        <div
          style={{
            padding: "24px",
            borderRadius: "12px",
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
          }}
        >
          <h3
            style={{
              fontSize: "18px",
              fontWeight: 600,
              marginBottom: "12px",
              color: "#0f172a"
            }}
          >
            What you can do here
          </h3>
          <ul
            style={{
              fontSize: "14px",
              color: "#475569",
              paddingLeft: "20px",
              margin: 0,
              lineHeight: "1.8"
            }}
          >
            <li>Define pay grades and base salaries.</li>
            <li>Configure allowances and deductions.</li>
            <li>Set tax and insurance rules.</li>
            <li>Manage signing bonuses and termination benefits.</li>
          </ul>
        </div>

        <div
          style={{
            padding: "24px",
            borderRadius: "12px",
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
          }}
        >
          <h3
            style={{
              fontSize: "18px",
              fontWeight: 600,
              marginBottom: "12px",
              color: "#0f172a"
            }}
          >
            Payroll Configuration
          </h3>
          <p
            style={{
              fontSize: "14px",
              color: "#64748b",
              marginBottom: "16px",
              lineHeight: "1.6"
            }}
          >
            To start working with the payroll setup, go to the configuration area.
          </p>
          <Link
            href="/payroll-config"
            style={{
              display: "inline-block",
              padding: "10px 20px",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 600,
              backgroundColor: "#3b82f6",
              color: "#ffffff",
              transition: "all 0.2s ease",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#2563eb";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#3b82f6";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
            }}
          >
            Open Payroll Configuration
          </Link>
        </div>

        <div
          style={{
            padding: "24px",
            borderRadius: "12px",
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
          }}
        >
          <h3
            style={{
              fontSize: "18px",
              fontWeight: 600,
              marginBottom: "12px",
              color: "#0f172a"
            }}
          >
            System Administration
          </h3>
          <p
            style={{
              fontSize: "14px",
              color: "#64748b",
              marginBottom: "16px",
              lineHeight: "1.6"
            }}
          >
            Manage configuration backups, restore system settings, and secure your payroll data.
          </p>
          <Link
            href="/system-admin"
            style={{
              display: "inline-block",
              padding: "10px 20px",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 600,
              backgroundColor: "#10b981",
              color: "#ffffff",
              transition: "all 0.2s ease",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#059669";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#10b981";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
            }}
          >
            Open System Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
