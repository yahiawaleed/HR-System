"use client";

import React from "react";

export default function DeductionsPage() {
  return (
    <div>
      <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "8px" }}>
        Deductions
      </h2>
      <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "16px" }}>
        This section is reserved for future deduction rules (penalties,
        social funds, etc.).
      </p>

      <div
        style={{
          padding: "16px",
          borderRadius: "8px",
          backgroundColor: "#ffffff",
          border: "1px solid #e5e7eb",
        }}
      >
        <p style={{ fontSize: "14px", color: "#4b5563", marginBottom: "8px" }}>
          In the current version of the project, detailed deduction
          configuration is <strong>out of scope</strong> and is not implemented
          in the backend.
        </p>
        <p style={{ fontSize: "13px", color: "#6b7280" }}>
          The main implemented parts of the Payroll Configuration subsystem are:
        </p>
        <ul
          style={{
            fontSize: "13px",
            color: "#6b7280",
            marginTop: "6px",
            paddingLeft: "18px",
          }}
        >
          <li>Pay Grades (base &amp; gross salaries)</li>
          <li>Allowances (fixed amounts)</li>
          <li>Tax Rules</li>
          <li>Insurance Brackets</li>
          <li>Termination / Resignation Benefits</li>
        </ul>
        <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "8px" }}>
          This page is kept only to show the planned structure of the HR
          payroll system.
        </p>
      </div>
    </div>
  );
}
