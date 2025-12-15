"use client";

import React, { useEffect, useState, FormEvent } from "react";

type TaxRule = {
  _id?: string;
  code: string;
  name: string;
  bracketFrom: number; // inclusive
  bracketTo: number;   // inclusive or 0 for "no upper limit"
  rate: number; // e.g. 10 = 10%
  description?: string;
};

export default function TaxRulesPage() {
  const [rules, setRules] = useState<TaxRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [bracketFrom, setBracketFrom] = useState<number | string>("");
  const [bracketTo, setBracketTo] = useState<number | string>("");
  const [rate, setRate] = useState<number | string>("");
  const [description, setDescription] = useState("");

  const API_BASE = process.env.NEXT_PUBLIC_API_URL 
    ? `${process.env.NEXT_PUBLIC_API_URL}/payroll-configuration`
    : 'http://localhost:3000/payroll-configuration';
  const fetchRules = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/tax-rules`, { credentials: "include" });

      if (!res.ok) throw new Error(`Failed to load tax rules (${res.status})`);

      const data = await res.json();
      setRules(data);
    } catch (err: any) {
      setError(err.message || "Error while loading tax rules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Convert to numbers and validate
    const bracketFromNum = Number(bracketFrom);
    const bracketToNum = Number(bracketTo);
    const rateNum = Number(rate);

    // Validate that all numbers are valid
    if (!Number.isFinite(bracketFromNum) || bracketFromNum < 0) {
      setError("Bracket From must be a valid number ≥ 0");
      return;
    }
    if (!Number.isFinite(bracketToNum) || bracketToNum < 0) {
      setError("Bracket To must be a valid number ≥ 0");
      return;
    }
    if (!Number.isFinite(rateNum) || rateNum < 0) {
      setError("Rate must be a valid number ≥ 0");
      return;
    }

    const payload: TaxRule = {
      code,
      name,
      bracketFrom: bracketFromNum,
      bracketTo: bracketToNum,
      rate: rateNum,
      description,
    };

    try {
      const res = await fetch(`${API_BASE}/tax-rules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Failed to create tax rule" }));
        const errorMsg = Array.isArray(errorData.message) 
          ? errorData.message.join(" | ") 
          : (errorData.message || "Failed to create tax rule");
        throw new Error(errorMsg);
      }

      setCode("");
      setName("");
      setBracketFrom("");
      setBracketTo("");
      setRate("");
      setDescription("");

      await fetchRules();
    } catch (err: any) {
      setError(err.message || "Error while creating tax rule");
    }
  };

  const handleApprove = async (id: string) => {
    setProcessing(id);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/tax-rules/${id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Failed to approve");
      await fetchRules();
    } catch (err: any) {
      setError(err.message || "Error while approving");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Are you sure you want to reject this tax rule?")) return;
    setProcessing(id);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/tax-rules/${id}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Failed to reject");
      await fetchRules();
    } catch (err: any) {
      setError(err.message || "Error while rejecting");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "8px" }}>
        Tax Rules
      </h2>
      <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "20px" }}>
        Define tax brackets and rates that will be applied to employee salaries
        to ensure legal compliance.
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
        <section>
          <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px" }}>
            Existing Tax Rules
          </h3>

          {loading ? (
            <p style={{ fontSize: "13px", color: "#6b7280" }}>
              Loading tax rules…
            </p>
          ) : rules.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#6b7280" }}>
              No tax rules defined yet. Use the form below to add one.
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
                    <th style={thStyle}>Code</th>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Bracket From</th>
                    <th style={thStyle}>Bracket To</th>
                    <th style={thStyle}>Rate %</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((r) => (
                    <tr key={r._id || r.code}>
                      <td style={tdStyle}>{r.code}</td>
                      <td style={tdStyle}>{r.name}</td>
                      <td style={tdStyle}>{r.bracketFrom}</td>
                      <td style={tdStyle}>
                        {r.bracketTo === 0 ? "No limit" : r.bracketTo}
                      </td>
                      <td style={tdStyle}>{r.rate}</td>
                      <td style={tdStyle}>{r.status || "—"}</td>
                      <td style={tdStyle}>
                        {r.status === "draft" && (
                          <div style={{ display: "flex", gap: "4px" }}>
                            <button
                              onClick={() => handleApprove(r._id!)}
                              disabled={processing === r._id}
                              style={{
                                padding: "4px 8px",
                                borderRadius: "4px",
                                border: "none",
                                cursor: processing === r._id ? "not-allowed" : "pointer",
                                backgroundColor: processing === r._id ? "#9ca3af" : "#059669",
                                color: "#ffffff",
                                fontSize: "11px",
                              }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(r._id!)}
                              disabled={processing === r._id}
                              style={{
                                padding: "4px 8px",
                                borderRadius: "4px",
                                border: "none",
                                cursor: processing === r._id ? "not-allowed" : "pointer",
                                backgroundColor: processing === r._id ? "#9ca3af" : "#dc2626",
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
            Add New Tax Rule
          </h3>

          <form
            onSubmit={handleCreate}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={labelStyle}>Code *</label>
              <input
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="TX-01"
                style={inputStyle}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={labelStyle}>Name *</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tax Bracket 1"
                style={inputStyle}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={labelStyle}>Bracket From *</label>
              <input
                required
                type="number"
                min={0}
                value={bracketFrom}
                onChange={(e) => setBracketFrom(e.target.value)}
                placeholder="0"
                style={inputStyle}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={labelStyle}>Bracket To (0 = No limit) *</label>
              <input
                required
                type="number"
                min={0}
                value={bracketTo}
                onChange={(e) => setBracketTo(e.target.value)}
                placeholder="10000"
                style={inputStyle}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={labelStyle}>Rate % *</label>
              <input
                required
                type="number"
                min={0}
                step="0.01"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="10"
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
              <label style={labelStyle}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional notes about this tax rule..."
                rows={3}
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            <div style={{ gridColumn: "1 / -1", marginTop: "4px" }}>
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
                Save Tax Rule
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  borderBottom: "1px solid #e5e7eb",
  padding: "8px",
  fontWeight: 600,
  backgroundColor: "#f3f4f6",
};

const tdStyle: React.CSSProperties = {
  borderBottom: "1px solid #e5e7eb",
  padding: "8px",
};

const labelStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#4b5563",
};

const inputStyle: React.CSSProperties = {
  borderRadius: "6px",
  border: "1px solid #d1d5db",
  padding: "6px 8px",
  fontSize: "13px",
};
