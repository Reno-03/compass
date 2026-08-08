import { useEffect, useState } from "react";
import {
  Folder,
  ExternalLink,
  Loader2,
  School,
} from "lucide-react";
import { supabase } from "./supabaseClient";

const PublicEvidenceVault = ({
  schoolData,
  activeSchoolId,
  setActiveSchoolId,
}) => {
  const [folders, setFolders] = useState([]);
  const [loadingFolders, setLoadingFolders] = useState(false);

  useEffect(() => {
    if (!activeSchoolId) {
      setFolders([]);
      return;
    }

    const loadFolders = async () => {
      setLoadingFolders(true);

      const { data, error } = await supabase
        .from("evidence_vault_folders")
        .select("id, school_id, name, url, created_at")
        .eq("school_id", activeSchoolId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading Evidence Vault:", error);
        setFolders([]);
      } else {
        setFolders(data || []);
      }

      setLoadingFolders(false);
    };

    loadFolders();
  }, [activeSchoolId]);

  return (
    <main className="flex-1 p-4 lg:p-8">
      {/* =====================================================
          Header
      ====================================================== */}
      <div className="mb-6 mt-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Evidence Vault
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Access evidence and supporting documents for each school.
          </p>
        </div>
      </div>

      {/* =====================================================
          School Tabs
      ====================================================== */}
      <div className="mb-6 grid grid-cols-1 gap-2 pb-1 sm:grid-cols-2 lg:flex lg:gap-2 lg:overflow-x-auto">
        {schoolData.map((school) => (
          <button
            key={school.id}
            type="button"
            onClick={() => setActiveSchoolId(school.id)}
            className={`flex items-center justify-start gap-2 rounded-lg px-4 py-2 text-xs font-semibold cursor-pointer sm:gap-3 sm:px-10 sm:py-3 sm:text-sm lg:whitespace-nowrap ${
              activeSchoolId === school.id
                ? "bg-[#0b1c39] text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>
              <School size={20} className="sm:h-6 sm:w-6" />
            </span>

            {school.name}
          </button>
        ))}
      </div>

      {/* =====================================================
          Folder Area
      ====================================================== */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 lg:p-6">
        {loadingFolders ? (
          <div className="flex min-h-50 items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 size={18} className="animate-spin" />
              Loading folders...
            </div>
          </div>
        ) : folders.length === 0 ? (
          <div className="flex min-h-55 flex-col items-center justify-center text-center">
            <Folder size={56} className="mb-3 text-slate-300" />

            <h3 className="text-sm font-semibold text-slate-700">
              No folders added
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-400">
              No evidence folders are available for this school yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="group flex flex-col items-center"
              >
                {/* Clickable Folder */}
                <div className="relative">
                  <a
                    href={folder.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Open ${folder.name}`}
                    className="flex h-28 w-28 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 transition hover:border-blue-300 hover:bg-blue-50 hover:shadow-md cursor-pointer"
                  >
                    <Folder
                      size={62}
                      strokeWidth={1.5}
                      className="text-blue-500 transition group-hover:text-blue-600"
                    />

                    <ExternalLink
                      size={13}
                      className="absolute right-3 top-3 text-slate-300 transition group-hover:text-blue-500"
                    />
                  </a>
                </div>

                {/* Folder Name */}
                <p
                  className="mt-2 w-full truncate px-2 text-center text-sm font-semibold text-slate-700"
                  title={folder.name}
                >
                  {folder.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default PublicEvidenceVault;
