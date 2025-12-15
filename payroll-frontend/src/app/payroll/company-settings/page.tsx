'use client';

import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:3000";

type SettingsObject = {
  [key: string]: any;
};

const READONLY_KEYS = ["_id", "__v", "createdAt", "updatedAt"];

export default function CompanySettingsPage() {
  const [settings, setSettings] = useState<SettingsObject | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadSettings() {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${API_BASE}/payroll-configuration/company-settings`);

      // Sometimes API returns an object, sometimes [object]
      const data = Array.isArray(res.data) ? res.data[0] : res.data;

      if (!data) {
        setSettings({});
        setForm({});
        return;
      }

      setSettings(data);

      const editable: Record<string, string> = {};
      Object.entries(data).forEach(([key, value]) => {
        if (!READONLY_KEYS.includes(key)) {
          editable[key] =
            value === null || value === undefined ? "" : String(value);
        }
      });
      setForm(editable);
    } catch (err) {
      console.error(err);
      setError("Failed to load company settings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function castValue(value: string): any {
    if (value === "") return "";
    // number?
    if (/^-?\d+(\.\d+)?$/.test(value)) {
      return Number(value);
    }
    // boolean?
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    try {
      setSaving(true);

      const patchBody: Record<string, any> = {};
      Object.entries(form).forEach(([key, value]) => {
        patchBody[key] = castValue(value);
      });

      await axios.patch(
        `${API_BASE}/payroll-configuration/company-settings`,
        patchBody
      );

      setMessage("Settings saved successfully.");
      await loadSettings();
    } catch (err) {
      console.error(err);
      setError("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Company settings</h1>
        <p className="text-sm text-gray-400">
          Configure global payroll settings such as company name, base currency, timezone, and defaults.
        </p>
      </div>

      {loading && <div className="text-sm text-gray-400">Loading settings…</div>}

      {error && (
        <div className="text-sm text-red-300 bg-red-900/30 border border-red-800 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      {message && (
        <div className="text-sm text-emerald-300 bg-emerald-900/30 border border-emerald-800 rounded-lg px-3 py-2">
          {message}
        </div>
      )}

      {settings && (
        <form
          onSubmit={handleSave}
          className="bg-gray-900/40 border border-gray-800 rounded-2xl p-4 space-y-4 max-w-2xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(form).map(([key, value]) => (
              <div key={key} className="flex flex-col">
                <label className="text-xs mb-1 text-gray-300">
                  {key}
                </label>
                <input
                  className="px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-sm outline-none"
                  value={value}
                  onChange={(e) => updateField(key, e.target.value)}
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-blue-600 text-sm font-medium disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save settings"}
          </button>
        </form>
      )}
    </div>
  );
}
