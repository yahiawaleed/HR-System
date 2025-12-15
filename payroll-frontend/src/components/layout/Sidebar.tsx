"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const payrollItems = [
  { label: "Overview", href: "/payroll-config" },
  { label: "Pay Grades", href: "/payroll-config/pay-grades" },
  { label: "Allowances", href: "/payroll-config/allowances" },
  { label: "Deductions", href: "/payroll-config/deductions" },
  { label: "Tax Rules", href: "/payroll-config/tax-rules" },
  { label: "Insurance Rules", href: "/payroll-config/insurance-rules" },
  { label: "Signing Bonuses", href: "/payroll-config/signing-bonuses" },
  { label: "Termination Benefits", href: "/payroll-config/termination-benefits" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      width: "280px",
      minHeight: "100vh",
      backgroundColor: "#1e293b",
      borderRight: "1px solid #334155",
      padding: "24px 20px",
      display: "flex",
      flexDirection: "column",
      boxShadow: "2px 0 8px rgba(0, 0, 0, 0.05)"
    }}>
      <div style={{
        color: "#ffffff",
        fontSize: "20px",
        fontWeight: 700,
        marginBottom: "8px",
        letterSpacing: "-0.02em"
      }}>
        Payroll Config
      </div>
      <p style={{
        color: "#94a3b8",
        fontSize: "12px",
        marginBottom: "24px",
        lineHeight: "1.5"
      }}>
        Manage payroll settings and policies
      </p>

      <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {payrollItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "block",
                padding: "10px 14px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#ffffff" : "#cbd5e1",
                backgroundColor: isActive ? "#3b82f6" : "transparent",
                textDecoration: "none",
                transition: "all 0.2s ease",
                border: isActive ? "none" : "1px solid transparent"
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
                  e.currentTarget.style.color = "#ffffff";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#cbd5e1";
                }
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
