"use client";
import { useState, useEffect } from "react";
import Worksheet from "./worksheet";

const STORAGE_KEY = "sand_worksheets";

const defaultWorksheets = [
  {
    id: 1,
    name: "Sheet 1",
    columns: [
      { id: "firstName", label: "First Name", type: "text" },
      { id: "lastName", label: "Last Name", type: "text" },
      { id: "major", label: "Major", type: "text" },
    ],
    rows: [
      { id: 1, firstName: "Alice", lastName: "Smith", major: "Physics" },
      { id: 2, firstName: "Bob", lastName: "Johnson", major: "Mathematics" },
    ],
  },
];

export default function WorksheetsManager() {
  const [worksheets, setWorksheets] = useState(defaultWorksheets);
  const [activeIdx, setActiveIdx] = useState(0);
  const [renamingIdx, setRenamingIdx] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  // Load from localStorage on mount
  useEffect(() => {
    const saved = typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setWorksheets(parsed);
        }
      } catch {}
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(worksheets));
    }
  }, [worksheets]);

  // Add a new worksheet
  const handleAddWorksheet = () => {
    const newSheet = {
      id: Date.now(),
      name: `Sheet ${worksheets.length + 1}`,
      columns: [
        { id: "firstName", label: "First Name", type: "text" },
        { id: "lastName", label: "Last Name", type: "text" },
        { id: "major", label: "Major", type: "text" },
      ],
      rows: [],
    };
    setWorksheets([...worksheets, newSheet]);
    setActiveIdx(worksheets.length);
  };

  // Remove a worksheet
  const handleRemoveWorksheet = (idx) => {
    if (worksheets.length === 1) return; // Always keep at least one
    const newSheets = worksheets.filter((_, i) => i !== idx);
    setWorksheets(newSheets);
    setActiveIdx(idx === 0 ? 0 : idx - 1);
  };

  // Rename a worksheet
  const handleRenameWorksheet = (idx) => {
    setRenamingIdx(idx);
    setRenameValue(worksheets[idx].name);
  };
  const handleRenameChange = (e) => setRenameValue(e.target.value);
  const handleRenameSubmit = (idx) => {
    const newSheets = worksheets.map((ws, i) =>
      i === idx ? { ...ws, name: renameValue.trim() || ws.name } : ws
    );
    setWorksheets(newSheets);
    setRenamingIdx(null);
    setRenameValue("");
  };

  // Update worksheet data (columns/rows)
  const handleWorksheetChange = (columns, rows) => {
    setWorksheets(worksheets.map((ws, i) =>
      i === activeIdx ? { ...ws, columns, rows } : ws
    ));
  };

  const activeSheet = worksheets[activeIdx];

  return (
    <div className="flex flex-col w-full">
      {/* Worksheet above tabs */}
      <Worksheet
        columns={activeSheet.columns}
        rows={activeSheet.rows}
        onChange={handleWorksheetChange}
        key={activeSheet.id}
      />
      {/* Tabs at the bottom */}
      <div className="flex gap-2 items-center justify-start flex-wrap backdrop-blur-sm px-4 py-3">
        <div className="flex gap-1 items-center">
          {worksheets.map((ws, idx) => (
            <div key={ws.id} className="flex items-center">
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  idx === activeIdx 
                    ? "bg-[#bfa76a] text-white shadow-sm" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setActiveIdx(idx)}
              >
                {renamingIdx === idx ? (
                  <input
                    className="border px-1 rounded text-sm w-24 bg-white text-gray-900"
                    value={renameValue}
                    onChange={handleRenameChange}
                    onBlur={() => handleRenameSubmit(idx)}
                    onKeyDown={e => {
                      if (e.key === "Enter") handleRenameSubmit(idx);
                    }}
                    autoFocus
                  />
                ) : (
                  <span onDoubleClick={() => handleRenameWorksheet(idx)}>{ws.name}</span>
                )}
              </button>
              {worksheets.length > 1 && (
                <button
                  className="ml-1 text-gray-400 hover:text-red-500 transition-colors"
                  onClick={() => handleRemoveWorksheet(idx)}
                  title="Delete worksheet"
                >
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="9" fill="currentColor" fillOpacity="0.12" />
                    <path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          className="ml-2 px-3 py-2 rounded-md bg-[#bfa76a] text-white text-sm font-medium hover:bg-[#a8905d] transition-colors shadow-sm flex items-center gap-1"
          onClick={handleAddWorksheet}
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="text-white">
            <circle cx="10" cy="10" r="9" fill="currentColor" fillOpacity="0.18" />
            <path d="M10 6v8M6 10h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Add Sheet
        </button>
      </div>
    </div>
  );
} 