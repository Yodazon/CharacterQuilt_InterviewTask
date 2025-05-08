import WorksheetsManager from "../components/worksheetsManager";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f8e9d2] via-[#f5f3ee] to-[#e6d3b3] font-sans flex flex-col">
      {/* Header */}
      <header className="w-full flex flex-col items-center py-3 mb-1 shadow-sm bg-white/80 backdrop-blur z-10">
        <div className="flex items-center gap-3">
          {/* Sand-inspired logo (SVG) */}
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[#e2c290] to-[#f5e9d2] shadow-md">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain rounded-lg" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#bfa76a] drop-shadow-sm">Sand</h1>
            <div className="text-sm text-[#7c6a4d] font-medium tracking-wide">Be granular with your data</div>
          </div>
        </div>
      </header>
      {/* Main worksheet area */}
      <main className="flex-1 flex flex-col items-center px-0 pt-2 pb-4">
        <div className="w-full max-w-[100vw] xl:max-w-[1800px] flex flex-col items-stretch">
          
            {/* Tabs/toolbar flush with card top edge */}
            <WorksheetsManager />
          
        </div>
      </main>
      {/* Footer */}
      <footer className="w-full text-center text-xs text-[#bfa76a] py-2 mt-auto bg-white/60">
        <span className="inline-flex items-center gap-1">
          <svg width="16" height="16" viewBox="0 0 32 32" fill="none" className="inline-block align-middle"><ellipse cx="16" cy="24" rx="10" ry="4" fill="#e2c290" /></svg>
          &copy; {new Date().getFullYear()} Sand. Be granular with your data.
        </span>
      </footer>
    </div>
  );
}
