"use client";

import React, { useEffect, useState, FormEvent } from "react";

type PayGrade = {
  _id?: string;
  grade: string;       // e.g. "Junior TA"
  baseSalary: number;
  grossSalary: number;
  status?: string;     // ConfigStatus from backend: DRAFT, APPROVED, etc.
};

export default function PayGradesPage() {
  const [grades, setGrades] = useState<PayGrade[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  // form state (MATCHES YOUR DTO / SCHEMA)
  const [grade, setGrade] = useState("");
  const [baseSalary, setBaseSalary] = useState<number | string>("");
  const [grossSalary, setGrossSalary] = useState<number | string>("");

  // ✅ VERY IMPORTANT: match backend controller
  // backend route = /payroll-configuration/pay-grades
  const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/payroll-configuration/pay-grades`;
  const API_CONFIG_BASE = process.env.NEXT_PUBLIC_API_URL 
    ? `${process.env.NEXT_PUBLIC_API_URL}/payroll-configuration`
    : 'http://localhost:3000/payroll-configuration';

  const fetchGrades = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(API_BASE, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`Failed to load pay grades (${res.status})`);
      }

      const data = await res.json();
      setGrades(data);
    } catch (err: any) {
      setError(err.message || "Error while loading pay grades");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      grade,                        // string
      baseSalary: Number(baseSalary),
      grossSalary: Number(grossSalary),
      // status is optional; backend default = DRAFT
    };

    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create pay grade");
      }

      // clear form
      setGrade("");
      setBaseSalary("");
      setGrossSalary("");

      await fetchGrades();
    } catch (err: any) {
      setError(err.message || "Error while creating pay grade");
    }
  };

  const handleApprove = async (id: string) => {
    setProcessing(id);
    setError(null);
    try {
      const res = await fetch(`${API_CONFIG_BASE}/pay-grades/${id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Failed to approve");
      await fetchGrades();
    } catch (err: any) {
      setError(err.message || "Error while approving");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Are you sure you want to reject this pay grade?")) return;
    setProcessing(id);
    setError(null);
    try {
      const res = await fetch(`${API_CONFIG_BASE}/pay-grades/${id}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Failed to reject");
      await fetchGrades();
    } catch (err: any) {
      setError(err.message || "Error while rejecting");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "8px" }}>
        Pay Grades
      </h2>
      <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "20px" }}>
        Define pay grades with base and gross salaries. These rules will be used
        later in payroll processing for different positions (Junior TA, Senior TA, etc.).
      </p>

      {error && (
        <div
          style={{
            marginBottom: "16px",
            padding: "8px 10px",
            borderRadius: "6px",
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            fontSize: "13px",
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Table */}
        <section>
          <h3
            style={{
              fontSize: "16px",
              fontWeight: 600,
              marginBottom: "8px",
            }}
          >
            Existing Pay Grades
          </h3>

          {loading ? (
            <p style={{ fontSize: "13px", color: "#6b7280" }}>
              Loading pay grades…
            </p>
          ) : grades.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#6b7280" }}>
              No pay grades defined yet. Use the form below to add one.
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "13px",
                  backgroundColor: "#ffffff",
                }}
              >
                <thead>
                  <tr>
                    <th style={thStyle}>Grade</th>
                    <th style={thStyle}>Base Salary</th>
                    <th style={thStyle}>Gross Salary</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((g) => (
                    <tr key={g._id || g.grade}>
                      <td style={tdStyle}>{g.grade}</td>
                      <td style={tdStyle}>{g.baseSalary}</td>
                      <td style={tdStyle}>{g.grossSalary}</td>
                      <td style={tdStyle}>{g.status || "—"}</td>
                      <td style={tdStyle}>
                        {g.status === "draft" && (
                          <div style={{ display: "flex", gap: "4px" }}>
                            <button
                              onClick={() => handleApprove(g._id!)}
                              disabled={processing === g._id}
                              style={{
                                padding: "4px 8px",
                                borderRadius: "4px",
                                border: "none",
                                cursor: processing === g._id ? "not-allowed" : "pointer",
                                backgroundColor: processing === g._id ? "#9ca3af" : "#059669",
                                color: "#ffffff",
                                fontSize: "11px",
                              }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(g._id!)}
                              disabled={processing === g._id}
                              style={{
                                padding: "4px 8px",
                                borderRadius: "4px",
                                border: "none",
                                cursor: processing === g._id ? "not-allowed" : "pointer",
                                backgroundColor: processing === g._id ? "#9ca3af" : "#dc2626",
                                color: "#ffffff",
                                fontSize: "11px",
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Form */}
        <section
          style={{
            padding: "16px",
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
          }}
        >
          <h3
            style={{
              fontSize: "16px",
              fontWeight: 600,
              marginBottom: "12px",
            }}
          >
            Add New Pay Grade
          </h3>

          <form
            onSubmit={handleCreate}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={labelStyle}>Grade *</label>
              <input
                required
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="Junior TA"
                style={inputStyle}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={labelStyle}>Base Salary *</label>
              <input
                required
                type="number"
                min={6000}
                value={baseSalary}
                onChange={(e) => setBaseSalary(e.target.value)}
                placeholder="6000"
                style={inputStyle}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={labelStyle}>Gross Salary *</label>
              <input
                required
                type="number"
                min={6000}
                value={grossSalary}
                onChange={(e) => setGrossSalary(e.target.value)}
                placeholder="8000"
                style={inputStyle}
              />
            </div>

            <div
              style={{
                gridColumn: "1 / -1",
                marginTop: "4px",
              }}
            >
              <button
                type="submit"
                style={{
                  padding: "8px 14px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: "#111827",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                Save Pay Grade
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

const thStyle = {
  textAlign: "left" as const,
  borderBottom: "1px solid #e5e7eb",
  padding: "8px",
  fontWeight: 600,
  backgroundColor: "#f3f4f6",
};

const tdStyle = {
  borderBottom: "1px solid #e5e7eb",
  padding: "8px",
};

const labelStyle = {
  fontSize: "12px",
  color: "#4b5563",
};

const inputStyle = {
  borderRadius: 6,
  border: "1px solid #d1d5db",
  padding: "6px 8px",
  fontSize: 13,
};
