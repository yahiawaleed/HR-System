"use client";

import React, { useEffect, useState, FormEvent } from "react";

type InsuranceBracket = {
  _id?: string;
  name: string;
  minSalary: number;
  maxSalary: number;
  employeeRate: number;
  employerRate: number;
  status?: string; // ConfigStatus from backend
};

export default function InsuranceRulesPage() {
  const [brackets, setBrackets] = useState<InsuranceBracket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // form state (MATCHES YOUR SCHEMA)
  const [name, setName] = useState("");
  const [minSalary, setMinSalary] = useState<number | string>("");
  const [maxSalary, setMaxSalary] = useState<number | string>("");
  const [employeeRate, setEmployeeRate] = useState<number | string>("");
  const [employerRate, setEmployerRate] = useState<number | string>("");

  // ✅ must match: @Controller('payroll-configuration') + 'insurance-brackets'
  const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/payroll-configuration/insurance-brackets`;
  const API_CONFIG_BASE = process.env.NEXT_PUBLIC_API_URL 
    ? `${process.env.NEXT_PUBLIC_API_URL}/payroll-configuration`
    : 'http://localhost:3000/payroll-configuration';

  const fetchBrackets = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(API_BASE, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`Failed to load insurance rules (${res.status})`);
      }

      const data = await res.json();
      setBrackets(data);
    } catch (err: any) {
      setError(err.message || "Error while loading insurance rules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrackets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      name,
      minSalary: Number(minSalary),
      maxSalary: Number(maxSalary),
      employeeRate: Number(employeeRate),
      employerRate: Number(employerRate),
      // status will default to DRAFT in the backend
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
        throw new Error(text || "Failed to create insurance rule");
      }

      // clear form
      setName("");
      setMinSalary("");
      setMaxSalary("");
      setEmployeeRate("");
      setEmployerRate("");

      await fetchBrackets();
    } catch (err: any) {
      setError(err.message || "Error while creating insurance rule");
    }
  };

  const handleEdit = (bracket: InsuranceBracket) => {
    setEditingId(bracket._id!);
    setName(bracket.name);
    setMinSalary(bracket.minSalary);
    setMaxSalary(bracket.maxSalary);
    setEmployeeRate(bracket.employeeRate);
    setEmployerRate(bracket.employerRate);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName("");
    setMinSalary("");
    setMaxSalary("");
    setEmployeeRate("");
    setEmployerRate("");
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    setError(null);
    const payload = {
      name,
      minSalary: Number(minSalary),
      maxSalary: Number(maxSalary),
      employeeRate: Number(employeeRate),
      employerRate: Number(employerRate),
    };

    try {
      const res = await fetch(`${API_BASE}/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to update insurance rule");
      }

      handleCancelEdit();
      await fetchBrackets();
    } catch (err: any) {
      setError(err.message || "Error while updating insurance rule");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this insurance rule?")) return;

    setProcessing(`delete-${id}`);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to delete insurance rule");
      }

      await fetchBrackets();
    } catch (err: any) {
      setError(err.message || "Error while deleting insurance rule");
    } finally {
      setProcessing(null);
    }
  };

  const handleApprove = async (id: string) => {
    setProcessing(`approve-${id}`);
    setError(null);
    try {
      const res = await fetch(`${API_CONFIG_BASE}/insurance-brackets/${id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Failed to approve");
      await fetchBrackets();
    } catch (err: any) {
      setError(err.message || "Error while approving");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Are you sure you want to reject this insurance rule?")) return;
    setProcessing(`reject-${id}`);
    setError(null);
    try {
      const res = await fetch(`${API_CONFIG_BASE}/insurance-brackets/${id}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Failed to reject");
      await fetchBrackets();
    } catch (err: any) {
      setError(err.message || "Error while rejecting");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "8px" }}>
        Insurance Rules
      </h2>
      <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "20px" }}>
        Configure social / insurance contributions, including employee and
        employer shares and salary caps.
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
            Existing Insurance Rules
          </h3>

          {loading ? (
            <p style={{ fontSize: "13px", color: "#6b7280" }}>
              Loading insurance rules…
            </p>
          ) : brackets.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#6b7280" }}>
              No insurance rules defined yet. Use the form below to add one.
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
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Min Salary</th>
                    <th style={thStyle}>Max Salary</th>
                    <th style={thStyle}>Employee %</th>
                    <th style={thStyle}>Employer %</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {brackets.map((b) => (
                    <tr key={b._id || b.name}>
                      <td style={tdStyle}>{b.name}</td>
                      <td style={tdStyle}>{b.minSalary}</td>
                      <td style={tdStyle}>{b.maxSalary}</td>
                      <td style={tdStyle}>{b.employeeRate}</td>
                      <td style={tdStyle}>{b.employerRate}</td>
                      <td style={tdStyle}>{b.status || "—"}</td>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                          <button
                            onClick={() => handleEdit(b)}
                            disabled={processing !== null}
                            style={{
                              padding: "4px 8px",
                              borderRadius: "4px",
                              border: "none",
                              cursor: processing ? "not-allowed" : "pointer",
                              backgroundColor: "#3b82f6",
                              color: "#ffffff",
                              fontSize: "11px",
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(b._id!)}
                            disabled={processing === `delete-${b._id}`}
                            style={{
                              padding: "4px 8px",
                              borderRadius: "4px",
                              border: "none",
                              cursor: processing === `delete-${b._id}` ? "not-allowed" : "pointer",
                              backgroundColor: processing === `delete-${b._id}` ? "#9ca3af" : "#dc2626",
                              color: "#ffffff",
                              fontSize: "11px",
                            }}
                          >
                            {processing === `delete-${b._id}` ? "Deleting..." : "Delete"}
                          </button>
                          {b.status === "draft" && (
                            <>
                              <button
                                onClick={() => handleApprove(b._id!)}
                                disabled={processing === `approve-${b._id}`}
                                style={{
                                  padding: "4px 8px",
                                  borderRadius: "4px",
                                  border: "none",
                                  cursor: processing === `approve-${b._id}` ? "not-allowed" : "pointer",
                                  backgroundColor: processing === `approve-${b._id}` ? "#9ca3af" : "#059669",
                                  color: "#ffffff",
                                  fontSize: "11px",
                                }}
                              >
                                {processing === `approve-${b._id}` ? "Approving..." : "Approve"}
                              </button>
                              <button
                                onClick={() => handleReject(b._id!)}
                                disabled={processing === `reject-${b._id}`}
                                style={{
                                  padding: "4px 8px",
                                  borderRadius: "4px",
                                  border: "none",
                                  cursor: processing === `reject-${b._id}` ? "not-allowed" : "pointer",
                                  backgroundColor: processing === `reject-${b._id}` ? "#9ca3af" : "#dc2626",
                                  color: "#ffffff",
                                  fontSize: "11px",
                                }}
                              >
                                {processing === `reject-${b._id}` ? "Rejecting..." : "Reject"}
                              </button>
                            </>
                          )}
                        </div>
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
            {editingId ? "Edit Insurance Rule" : "Add New Insurance Rule"}
          </h3>

          <form
            onSubmit={editingId ? handleUpdate : handleCreate}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={labelStyle}>Name *</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Social Insurance"
                style={inputStyle}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={labelStyle}>Min Salary *</label>
              <input
                required
                type="number"
                min={0}
                value={minSalary}
                onChange={(e) => setMinSalary(e.target.value)}
                placeholder="0"
                style={inputStyle}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={labelStyle}>Max Salary *</label>
              <input
                required
                type="number"
                min={0}
                value={maxSalary}
                onChange={(e) => setMaxSalary(e.target.value)}
                placeholder="100000"
                style={inputStyle}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={labelStyle}>Employee Rate % *</label>
              <input
                required
                type="number"
                min={0}
                max={100}
                value={employeeRate}
                onChange={(e) => setEmployeeRate(e.target.value)}
                placeholder="11"
                style={inputStyle}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={labelStyle}>Employer Rate % *</label>
              <input
                required
                type="number"
                min={0}
                max={100}
                value={employerRate}
                onChange={(e) => setEmployerRate(e.target.value)}
                placeholder="18.75"
                style={inputStyle}
              />
            </div>

            <div
              style={{
                gridColumn: "1 / -1",
                marginTop: "4px",
              }}
            >
              <div style={{ display: "flex", gap: "8px" }}>
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
                  {editingId ? "Update Insurance Rule" : "Save Insurance Rule"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "6px",
                      border: "1px solid #d1d5db",
                      cursor: "pointer",
                      backgroundColor: "#ffffff",
                      color: "#374151",
                      fontSize: "14px",
                      fontWeight: 500,
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
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
