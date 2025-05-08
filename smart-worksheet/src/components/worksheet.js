"use client";
import { useState, useRef } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { useWorksheet } from "../hooks/useWorksheet";
import { exportToCSV, exportToExcel, processImportedData } from "../utils/worksheetUtils";
import ColumnHeader from "./ColumnHeader";
import CellEditor from "./CellEditor";
import EnrichModal from "./EnrichModal";
import { columnTypes } from "../constants/columnTypes";

export default function Worksheet({ columns: initialColumns, rows: initialRows, onChange }) {
  const {
    columns,
    rows,
    addColumn,
    removeColumn,
    changeColumnType,
    addRow,
    removeRow,
    updateCell,
    renameColumn,
    updateWorksheet
  } = useWorksheet(initialColumns, initialRows, onChange);

  const [newColName, setNewColName] = useState("");
  const [newColType, setNewColType] = useState("text");
  const [columnColor, setColumnColor] = useState({});
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Enrichment modal state
  const [enrichColId, setEnrichColId] = useState(null);
  const [enrichPrompt, setEnrichPrompt] = useState("");
  const [enrichLoading, setEnrichLoading] = useState(false);
  const [enrichError, setEnrichError] = useState("");
  const [selectedColumns, setSelectedColumns] = useState([]);

  // Export as CSV
  const handleExportCSV = () => {
    const csvData = exportToCSV(rows, columns);
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "worksheet.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export as Excel
  const handleExportExcel = () => {
    const wsData = exportToExcel(rows, columns);
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "worksheet.xlsx");
  };

  // Import handler
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();
    reader.onload = (evt) => {
      let data;
      if (ext === "csv") {
        data = Papa.parse(evt.target.result, { header: true });
      } else if (ext === "xlsx") {
        const workbook = XLSX.read(evt.target.result, { type: "binary" });
        const wsname = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsname];
        data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      } else {
        alert("Unsupported file type. Please upload a CSV or Excel file.");
        return;
      }

      const processed = processImportedData(data, ext);
      if (processed) {
        updateWorksheet(processed.columns, processed.rows);
      } else {
        alert(ext === "csv" ? "Invalid CSV file" : "Empty Excel file");
      }
    };
    if (ext === "csv") {
      reader.readAsText(file);
    } else if (ext === "xlsx") {
      reader.readAsBinaryString(file);
    }
    e.target.value = ""; // reset input
  };

  // Enrich column logic (calls API)
  const handleEnrich = async (colId, prompt) => {
    setEnrichLoading(true);
    setEnrichError("");
    try {
      // Filter out rows that have no data in selected columns
      const rowsToEnrich = rows.filter(row => 
        selectedColumns.some(colId => row[colId]?.trim())
      );

      if (rowsToEnrich.length === 0) {
        throw new Error("No rows with data to enrich. Please add data to the selected columns.");
      }

      const res = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          rows: rowsToEnrich,
          columns: columns.filter(col => selectedColumns.includes(col.id)),
          targetColId: colId,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.values) {
        throw new Error(data.error || "Failed to enrich column.");
      }

      // Update only the rows that were enriched
      const newRows = rows.map((row, i) => {
        const enrichedRow = rowsToEnrich[i];
        if (enrichedRow && enrichedRow.id === row.id) {
          return { ...row, [colId]: data.values[i] };
        }
        return row;
      });

      updateWorksheet(columns, newRows);
      setEnrichColId(null);
      setEnrichPrompt("");
      setSelectedColumns([]);
    } catch (e) {
      setEnrichError(e.message || "Failed to enrich column.");
    } finally {
      setEnrichLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-4">
      <div className="overflow-x-auto w-full h-auto bg-white rounded shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <button
              className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 text-sm"
              onClick={handleExportCSV}
            >
              Export CSV
            </button>
            <button
              className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 text-sm"
              onClick={handleExportExcel}
            >
              Export Excel
            </button>
            <button
              className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 text-sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Import CSV/Excel
            </button>
            <input
              type="file"
              accept=".csv,.xlsx"
              ref={fileInputRef}
              onChange={handleImport}
              style={{ display: "none" }}
            />
          </div>
        </div>
        <div className="relative h-[calc(100vh-360px)] overflow-auto">
          <table className="min-w-full border-collapse">
            <thead className="sticky top-0 z-10">
              <tr>
                {columns.map(col => (
                  <ColumnHeader
                    key={col.id}
                    column={col}
                    columnColor={columnColor}
                    onRename={renameColumn}
                    onTypeChange={changeColumnType}
                    onColorChange={(id, color) => setColumnColor(prev => ({ ...prev, [id]: color }))}
                    onRemove={removeColumn}
                    onDuplicate={(id) => addColumn('right', id)}
                    onInsertLeft={(id) => addColumn('left', id)}
                    onInsertRight={(id) => addColumn('right', id)}
                    onEnrich={setEnrichColId}
                    isEnrichable={!(col.id === "firstName" || col.id === "lastName" || col.id === "major")}
                  />
                ))}
                <th className="px-3 py-2 border border-gray-300 bg-[#f8f9fa] text-left font-semibold min-w-[180px] shadow-sm">
                  <form
                    className="flex gap-2 items-end"
                    onSubmit={e => { e.preventDefault(); addColumn('end', null, newColName, newColType); setNewColName(""); }}
                  >
                    <div>
                      <input
                        className="border px-2 py-1 rounded w-28 text-sm focus:ring-2 focus:ring-[#bfa76a]"
                        value={newColName}
                        onChange={e => setNewColName(e.target.value)}
                        placeholder="Add column"
                        disabled={enrichLoading}
                      />
                    </div>
                    <div className="relative">
                      <button
                        type="button"
                        className="border px-2 py-1 rounded text-sm flex items-center gap-1 min-w-[90px] bg-white hover:bg-gray-50"
                        onClick={() => setTypeDropdownOpen(v => !v)}
                        tabIndex={0}
                      >
                        {columnTypes.find(t => t.value === newColType)?.icon}
                        {columnTypes.find(t => t.value === newColType)?.label}
                        <svg width="12" height="12" viewBox="0 0 20 20" fill="none" className="ml-1">
                          <path d="M6 8l4 4 4-4" stroke="#bfa76a" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </button>
                      {typeDropdownOpen && (
                        <div className="absolute z-20 mt-1 left-0 w-44 bg-white border rounded shadow-lg py-1">
                          {columnTypes.map(type => (
                            <button
                              key={type.value}
                              type="button"
                              className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-[#f8e9d2] ${newColType === type.value ? "bg-[#f3e6c6] font-bold" : ""}`}
                              onClick={() => { setNewColType(type.value); setTypeDropdownOpen(false); }}
                            >
                              {type.icon} {type.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-green-600 text-white hover:bg-green-700 transition"
                      title="Add column"
                      disabled={enrichLoading || !newColName.trim()}
                    >
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="9" fill="currentColor" fillOpacity="0.18" />
                        <path d="M10 6v8M6 10h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </button>
                  </form>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {columns.map(col => (
                    <td key={col.id} className="px-3 py-2 border border-gray-300 w-[200px]">
                      <CellEditor
                        column={col}
                        value={row[col.id]}
                        onChange={value => updateCell(row.id, col.id, value)}
                      />
                    </td>
                  ))}
                  <td className="px-3 py-2 border border-gray-300">
                    <button
                      className="w-6 h-6 flex items-center justify-center rounded-full transition hover:bg-red-100 focus:bg-red-200 group"
                      onClick={() => removeRow(row.id)}
                      title="Remove row"
                      tabIndex={0}
                    >
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="text-red-500 group-hover:text-red-700">
                        <circle cx="10" cy="10" r="9" fill="currentColor" fillOpacity="0.12" />
                        <path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
            onClick={addRow}
          >
            + Add Row
          </button>
        </div>
      </div>

      <EnrichModal
        isOpen={!!enrichColId}
        onClose={() => {
          setEnrichColId(null);
          setSelectedColumns([]);
        }}
        columns={columns}
        selectedColumns={selectedColumns}
        onColumnSelect={setSelectedColumns}
        prompt={enrichPrompt}
        onPromptChange={setEnrichPrompt}
        onEnrich={handleEnrich}
        isLoading={enrichLoading}
        error={enrichError}
        targetColumn={columns.find(c => c.id === enrichColId)}
      />
    </div>
  );
}
