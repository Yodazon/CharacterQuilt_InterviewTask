export default function CellEditor({ column, value, onChange }) {
  switch (column.type) {
    case "checkbox":
      return (
        <input
          type="checkbox"
          checked={!!value}
          onChange={e => onChange(e.target.checked)}
          className="w-5 h-5 accent-[#bfa76a]"
        />
      );
    case "url":
      return value ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
          {value}
        </a>
      ) : (
        <input
          type="url"
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-transparent outline-none px-1 py-0.5"
        />
      );
    case "email":
      return value ? (
        <a href={`mailto:${value}`} className="text-blue-600 underline">
          {value}
        </a>
      ) : (
        <input
          type="email"
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-transparent outline-none px-1 py-0.5"
        />
      );
    case "date":
      return (
        <input
          type="date"
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-transparent outline-none px-1 py-0.5"
        />
      );
    case "number":
      return (
        <input
          type="number"
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-transparent outline-none px-1 py-0.5"
        />
      );
    case "image":
      return value ? (
        <img src={value} alt="img" className="max-h-10 max-w-[80px] object-contain rounded" />
      ) : (
        <input
          type="url"
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-transparent outline-none px-1 py-0.5"
          placeholder="Enter image URL"
        />
      );
    default:
      return (
        <input
          type="text"
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-transparent outline-none px-1 py-0.5"
        />
      );
  }
} 