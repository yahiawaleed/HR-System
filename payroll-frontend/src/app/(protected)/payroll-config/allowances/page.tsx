"use client";

import React, { useEffect, useState, FormEvent } from "react";

type Allowance = {
  _id?: string;
  name: string;
  amount: number;
  status?: string; // ConfigStatus from backend
};

export default function AllowancesPage() {
  const [allowances, setAllowances] = useState<Allowance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  // form state (matches CreateAllowanceDto)
  const [name, setName] = useState("");
  const [amount, setAmount] = useState<number | string>("");

  // ✅ MUST MATCH YOUR CONTROLLER: @Controller('payroll-configuration') + 'allowances'
  const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/payroll-configuration/allowances`;
  const API_CONFIG_BASE = process.env.NEXT_PUBLIC_API_URL 
    ? `${process.env.NEXT_PUBLIC_API_URL}/payroll-configuration`
    : 'http://localhost:3000/payroll-configuration';

  const fetchAllowances = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(API_BASE, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`Failed to load allowances (${res.status})`);
      }

      const data = await res.json();
      setAllowances(data);
    } catch (err: any) {
      setError(err.message || "Error while loading allowances");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllowances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      name,
      amount: Number(amount), // make sure it's a number for IsNumber()
      // createdBy can be added here later if needed
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
        throw new Error(text || "Failed to create allowance");
      }

      setName("");
      setAmount("");

      await fetchAllowances();
    } catch (err: any) {
      setError(err.message || "Error while creating allowance");
    }
  };

  const handleApprove = async (id: string) => {
    setProcessing(id);
    setError(null);
    try {
      const res = await fetch(`${API_CONFIG_BASE}/allowances/${id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Failed to approve");
      await fetchAllowances();
    } catch (err: any) {
      setError(err.message || "Error while approving");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Are you sure you want to reject this allowance?")) return;
    setProcessing(id);
    setError(null);
    try {
      const res = await fetch(`${API_CONFIG_BASE}/allowances/${id}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Failed to reject");
      await fetchAllowances();
    } catch (err: any) {
      setError(err.message || "Error while rejecting");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div style={{ maxWidth: "1400px" }}>
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ 
          fontSize: "28px", 
          fontWeight: 700, 
          marginBottom: "8px",
          color: "#0f172a",
          letterSpacing: "-0.02em"
        }}>
          Allowances
        </h2>
        <p style={{ 
          fontSize: "15px", 
          color: "#64748b", 
          lineHeight: "1.6"
        }}>
          Configure fixed allowances such as housing, transportation, risk
          allowance, etc. These rules will be used later in payroll calculations.
        </p>
      </div>

      {error && (
        <div
          style={{
            marginBottom: "24px",
            padding: "12px 16px",
            borderRadius: "8px",
            backgroundColor: "#fee2e2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            fontSize: "14px",
            fontWeight: 500,
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        {/* Table */}
        <section style={{
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          overflow: "hidden"
        }}>
          <div style={{
            padding: "20px 24px",
            borderBottom: "1px solid #e2e8f0",
            backgroundColor: "#f8fafc"
          }}>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: 600,
                color: "#0f172a",
                margin: 0
              }}
            >
              Existing Allowances
            </h3>
          </div>

          {loading ? (
            <div style={{ padding: "40px 24px", textAlign: "center" }}>
              <p style={{ fontSize: "14px", color: "#64748b" }}>
                Loading allowances…
              </p>
            </div>
          ) : allowances.length === 0 ? (
            <div style={{ padding: "40px 24px", textAlign: "center" }}>
              <p style={{ fontSize: "14px", color: "#64748b" }}>
                No allowances defined yet. Use the form below to add one.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "14px",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc" }}>
                    <th style={{
                      ...thStyle,
                      padding: "12px 24px",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#475569",
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em"
                    }}>Name</th>
                    <th style={{
                      ...thStyle,
                      padding: "12px 24px",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#475569",
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em"
                    }}>Amount</th>
                    <th style={{
                      ...thStyle,
                      padding: "12px 24px",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#475569",
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em"
                    }}>Status</th>
                    <th style={{
                      ...thStyle,
                      padding: "12px 24px",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#475569",
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em"
                    }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allowances.map((a, idx) => (
                    <tr 
                      key={a._id || a.name}
                      style={{
                        borderBottom: idx < allowances.length - 1 ? "1px solid #e2e8f0" : "none",
                        transition: "background-color 0.15s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f8fafc";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <td style={{
                        ...tdStyle,
                        padding: "16px 24px",
                        color: "#0f172a",
                        fontWeight: 500
                      }}>{a.name}</td>
                      <td style={{
                        ...tdStyle,
                        padding: "16px 24px",
                        color: "#475569"
                      }}>{a.amount}</td>
                      <td style={{
                        ...tdStyle,
                        padding: "16px 24px"
                      }}>
                        <span style={{
                          display: "inline-block",
                          padding: "4px 12px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: 500,
                          backgroundColor: a.status === "approved" ? "#d1fae5" : a.status === "rejected" ? "#fee2e2" : "#f1f5f9",
                          color: a.status === "approved" ? "#065f46" : a.status === "rejected" ? "#991b1b" : "#475569"
                        }}>
                          {a.status || "draft"}
                        </span>
                      </td>
                      <td style={{
                        ...tdStyle,
                        padding: "16px 24px"
                      }}>
                        {a.status === "draft" && (
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              onClick={() => handleApprove(a._id!)}
                              disabled={processing === a._id}
                              style={{
                                padding: "6px 14px",
                                borderRadius: "6px",
                                border: "none",
                                cursor: processing === a._id ? "not-allowed" : "pointer",
                                backgroundColor: processing === a._id ? "#9ca3af" : "#10b981",
                                color: "#ffffff",
                                fontSize: "12px",
                                fontWeight: 500,
                                transition: "all 0.2s ease",
                                boxShadow: processing === a._id ? "none" : "0 1px 2px rgba(0, 0, 0, 0.1)"
                              }}
                              onMouseEnter={(e) => {
                                if (!processing) {
                                  e.currentTarget.style.backgroundColor = "#059669";
                                  e.currentTarget.style.transform = "translateY(-1px)";
                                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.15)";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!processing) {
                                  e.currentTarget.style.backgroundColor = "#10b981";
                                  e.currentTarget.style.transform = "translateY(0)";
                                  e.currentTarget.style.boxShadow = "0 1px 2px rgba(0, 0, 0, 0.1)";
                                }
                              }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(a._id!)}
                              disabled={processing === a._id}
                              style={{
                                padding: "6px 14px",
                                borderRadius: "6px",
                                border: "none",
                                cursor: processing === a._id ? "not-allowed" : "pointer",
                                backgroundColor: processing === a._id ? "#9ca3af" : "#ef4444",
                                color: "#ffffff",
                                fontSize: "12px",
                                fontWeight: 500,
                                transition: "all 0.2s ease",
                                boxShadow: processing === a._id ? "none" : "0 1px 2px rgba(0, 0, 0, 0.1)"
                              }}
                              onMouseEnter={(e) => {
                                if (!processing) {
                                  e.currentTarget.style.backgroundColor = "#dc2626";
                                  e.currentTarget.style.transform = "translateY(-1px)";
                                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.15)";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!processing) {
                                  e.currentTarget.style.backgroundColor = "#ef4444";
                                  e.currentTarget.style.transform = "translateY(0)";
                                  e.currentTarget.style.boxShadow = "0 1px 2px rgba(0, 0, 0, 0.1)";
                                }
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
            padding: "24px",
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
          }}
        >
          <h3
            style={{
              fontSize: "18px",
              fontWeight: 600,
              marginBottom: "20px",
              color: "#0f172a"
            }}
          >
            Add New Allowance
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
              <label style={labelStyle}>Name *</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Housing Allowance"
                style={inputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#3b82f6";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#cbd5e1";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={labelStyle}>Amount *</label>
              <input
                required
                type="number"
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1000"
                style={inputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#3b82f6";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#cbd5e1";
                  e.currentTarget.style.boxShadow = "none";
                }}
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
                  padding: "12px 24px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: "#3b82f6",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: 600,
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
                Save Allowance
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
  fontSize: "13px",
  color: "#475569",
  fontWeight: 500,
  marginBottom: "6px",
  display: "block"
};

const inputStyle = {
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  padding: "10px 12px",
  fontSize: "14px",
  width: "100%",
  transition: "all 0.2s ease",
  backgroundColor: "#ffffff"
};
