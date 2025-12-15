"use client";

import React, { useEffect, useState, FormEvent } from "react";

type SigningBonus = {
  _id?: string;
  positionName: string;
  amount: number;
  status?: string;
};

export default function SigningBonusesPage() {
  const [bonuses, setBonuses] = useState<SigningBonus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const [positionName, setPositionName] = useState("");
  const [amount, setAmount] = useState<number | string>("");

  // ✅ new real endpoint
  const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/payroll-configuration/signing-bonuses`;
  const API_CONFIG_BASE = process.env.NEXT_PUBLIC_API_URL 
    ? `${process.env.NEXT_PUBLIC_API_URL}/payroll-configuration`
    : 'http://localhost:3000/payroll-configuration';

  const fetchBonuses = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(API_BASE, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`Failed to load signing bonuses (${res.status})`);
      }

      const data = await res.json();
      setBonuses(data);
    } catch (err: any) {
      setError(err.message || "Error while loading signing bonuses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBonuses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      positionName,
      amount: Number(amount),
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
        throw new Error(text || "Failed to create signing bonus");
      }

      setPositionName("");
      setAmount("");

      await fetchBonuses();
    } catch (err: any) {
      setError(err.message || "Error while creating signing bonus");
    }
  };

  const handleApprove = async (id: string) => {
    setProcessing(id);
    setError(null);
    try {
      const res = await fetch(`${API_CONFIG_BASE}/signing-bonuses/${id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Failed to approve");
      await fetchBonuses();
    } catch (err: any) {
      setError(err.message || "Error while approving");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Are you sure you want to reject this signing bonus?")) return;
    setProcessing(id);
    setError(null);
    try {
      const res = await fetch(`${API_CONFIG_BASE}/signing-bonuses/${id}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Failed to reject");
      await fetchBonuses();
    } catch (err: any) {
      setError(err.message || "Error while rejecting");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "8px" }}>
        Signing Bonuses
      </h2>
      <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "20px" }}>
        Configure signing bonuses and similar predefined bonus amounts linked to
        specific positions (e.g. Junior TA, Senior TA, etc.).
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
            Existing Bonuses
          </h3>

          {loading ? (
            <p style={{ fontSize: "13px", color: "#6b7280" }}>
              Loading bonuses…
            </p>
          ) : bonuses.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#6b7280" }}>
              No signing bonuses defined yet. Use the form below to add one.
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
                    <th style={thStyle}>Position</th>
                    <th style={thStyle}>Amount</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bonuses.map((b) => (
                    <tr key={b._id || b.positionName}>
                      <td style={tdStyle}>{b.positionName}</td>
                      <td style={tdStyle}>{b.amount}</td>
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
            Add New Signing Bonus
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
              <label style={labelStyle}>Position Name *</label>
              <input
                required
                value={positionName}
                onChange={(e) => setPositionName(e.target.value)}
                placeholder="Junior TA"
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
                placeholder="5000"
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
                Save Bonus
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
