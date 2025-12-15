"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const links = [
  { href: "/payroll-config", label: "Overview" },
  { href: "/approvals", label: "Approval Dashboard", highlight: true },
  { href: "/payroll-config/pay-grades", label: "Pay Grades" },
  { href: "/payroll-config/allowances", label: "Allowances" },
  { href: "/payroll-config/deductions", label: "Deductions" },
  { href: "/payroll-config/tax-rules", label: "Tax Rules" },
  { href: "/payroll-config/insurance-rules", label: "Insurance Rules" },
  { href: "/payroll-config/bonuses", label: "Signing Bonuses" },
  { href: "/payroll-config/termination-benefits", label: "Termination Benefits" },
];

export default function PayrollConfigLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: "280px",
          borderRight: "1px solid #e2e8f0",
          padding: "24px 20px",
          boxSizing: "border-box",
          backgroundColor: "#ffffff",
          boxShadow: "2px 0 8px rgba(0, 0, 0, 0.02)"
        }}
      >
        <h1 style={{ 
          fontSize: "20px", 
          fontWeight: 700, 
          marginBottom: "8px", 
          color: "#0f172a",
          letterSpacing: "-0.02em"
        }}>
          Payroll Config
        </h1>
        <p style={{ 
          fontSize: "12px", 
          color: "#64748b", 
          marginBottom: "24px",
          lineHeight: "1.5"
        }}>
          Configure all salary and policy rules here. This is the foundation for
          payroll processing.
        </p>

        <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontSize: "14px",
                  backgroundColor: active 
                    ? (link.highlight ? "#059669" : "#f1f5f9") 
                    : "transparent",
                  color: active 
                    ? (link.highlight ? "#ffffff" : "#0f172a") 
                    : "#475569",
                  border: active ? "none" : "1px solid transparent",
                  transition: "all 0.2s ease",
                  fontWeight: active ? 600 : 400,
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = "#f8fafc";
                    e.currentTarget.style.color = "#0f172a";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#475569";
                  }
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Content */}
      <main
        style={{
          flex: 1,
          padding: "32px",
          boxSizing: "border-box",
          backgroundColor: "#f8fafc",
          overflow: "auto"
        }}
      >
        {children}
      </main>
    </div>
  );
}
