"use client";

import React, { useEffect, useState, FormEvent } from "react";

type Benefit = {
  _id?: string;
  name: string;
  amount: number;
  terms?: string;
  status?: string;
};

export default function TerminationBenefitsPage() {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  // form state (matches CreateBenefitDto)
  const [name, setName] = useState("");
  const [amount, setAmount] = useState<number | string>("");
  const [terms, setTerms] = useState("");

  // ✅ must match: @Controller('payroll-configuration') + 'benefits'
  const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/payroll-configuration/benefits`;
  const API_CONFIG_BASE = process.env.NEXT_PUBLIC_API_URL 
    ? `${process.env.NEXT_PUBLIC_API_URL}/payroll-configuration`
    : 'http://localhost:3000/payroll-configuration';

  const fetchBenefits = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(API_BASE, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`Failed to load benefits (${res.status})`);
      }

      const data = await res.json();
      setBenefits(data);
    } catch (err: any) {
      setError(err.message || "Error while loading benefits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBenefits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      name,
      amount: Number(amount),
      terms: terms || undefined,
      // createdBy can be added later if you plug auth/user
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
        throw new Error(text || "Failed to create benefit");
      }

      // clear form
      setName("");
      setAmount("");
      setTerms("");

      await fetchBenefits();
    } catch (err: any) {
      setError(err.message || "Error while creating benefit");
    }
  };

  const handleApprove = async (id: string) => {
    setProcessing(id);
    setError(null);
    try {
      const res = await fetch(`${API_CONFIG_BASE}/benefits/${id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Failed to approve");
      await fetchBenefits();
    } catch (err: any) {
      setError(err.message || "Error while approving");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Are you sure you want to reject this benefit?")) return;
    setProcessing(id);
    setError(null);
    try {
      const res = await fetch(`${API_CONFIG_BASE}/benefits/${id}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Failed to reject");
      await fetchBenefits();
    } catch (err: any) {
      setError(err.message || "Error while rejecting");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "8px" }}>
        Termination &amp; Resignation Benefits
      </h2>
      <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "20px" }}>
        Configure end-of-service and resignation benefits such as gratuity
        schemes and special payouts defined by company policy or local labor
        law.
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
            Existing Benefits
          </h3>

          {loading ? (
            <p style={{ fontSize: "13px", color: "#6b7280" }}>
              Loading benefits…
            </p>
          ) : benefits.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#6b7280" }}>
              No termination / resignation benefits defined yet. Use the form
              below to add one.
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
                    <th style={thStyle}>Amount</th>
                    <th style={thStyle}>Terms</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {benefits.map((b) => (
                    <tr key={b._id || b.name}>
                      <td style={tdStyle}>{b.name}</td>
                      <td style={tdStyle}>{b.amount}</td>
                      <td style={tdStyle}>{b.terms || "—"}</td>
                      <td style={tdStyle}>{b.status || "—"}</td>
                      <td style={tdStyle}>
                        {b.status === "draft" && (
                          <div style={{ display: "flex", gap: "4px" }}>
                            <button
                              onClick={() => handleApprove(b._id!)}
                              disabled={processing === b._id}
                              style={{
                                padding: "4px 8px",
                                borderRadius: "4px",
                                border: "none",
                                cursor: processing === b._id ? "not-allowed" : "pointer",
                                backgroundColor: processing === b._id ? "#9ca3af" : "#059669",
                                color: "#ffffff",
                                fontSize: "11px",
                              }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(b._id!)}
                              disabled={processing === b._id}
                              style={{
                                padding: "4px 8px",
                                borderRadius: "4px",
                                border: "none",
                                cursor: processing === b._id ? "not-allowed" : "pointer",
                                backgroundColor: processing === b._id ? "#9ca3af" : "#dc2626",
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
            Add New Benefit
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
                placeholder="End of Service Gratuity"
                style={inputStyle}
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
                placeholder="20000"
                style={inputStyle}
              />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                gridColumn: "1 / -1",
              }}
            >
              <label style={labelStyle}>Terms (optional)</label>
              <textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                placeholder="e.g. based on years of service, paid upon resignation under specific conditions, etc."
                style={{
                  ...inputStyle,
                  minHeight: "70px",
                  resize: "vertical",
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
                Save Benefit
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
