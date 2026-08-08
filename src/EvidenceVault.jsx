import { useEffect, useState } from "react";
import {
  Folder,
  Plus,
  ExternalLink,
  X,
  Loader2,
  Trash2,
  School,
} from "lucide-react";
import { supabase } from "./supabaseClient";
import { useAuth } from "./useAuth";

const EvidenceVault = () => {
  const { profile } = useAuth();

  const [schools, setSchools] = useState([]);
  const [activeSchoolId, setActiveSchoolId] = useState(null);
  const [folders, setFolders] = useState([]);

  const [loadingSchools, setLoadingSchools] = useState(true);
  const [loadingFolders, setLoadingFolders] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [folderName, setFolderName] = useState("");
  const [folderLink, setFolderLink] = useState("");
  const [error, setError] = useState("");

  const isAdmin = profile?.role === "admin";

  // =========================================================
  // Load schools
  // =========================================================
  useEffect(() => {
    const loadSchools = async () => {
      setLoadingSchools(true);
      setError("");

      const { data, error } = await supabase
        .from("schools")
        .select("id, name")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error loading schools:", error);
        setError("Unable to load schools.");
        setLoadingSchools(false);
        return;
      }

      setSchools(data || []);

      if (data?.length > 0) {
        setActiveSchoolId(data[0].id);
      }

      setLoadingSchools(false);
    };

    loadSchools();
  }, []);

  // =========================================================
  // Load folders whenever school changes
  // =========================================================
  useEffect(() => {
    if (!activeSchoolId) return;

    const loadFolders = async () => {
      setLoadingFolders(true);
      setError("");

      const { data, error } = await supabase
        .from("evidence_vault_folders")
        .select("id, school_id, name, url, created_at")
        .eq("school_id", activeSchoolId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading folders:", error);
        setError("Unable to load folders.");
        setFolders([]);
      } else {
        setFolders(data || []);
      }

      setLoadingFolders(false);
    };

    loadFolders();
  }, [activeSchoolId]);

  // =========================================================
  // Add folder
  // =========================================================
  const handleAddFolder = async (e) => {
    e.preventDefault();

    if (!isAdmin) return;

    setError("");

    const name = folderName.trim();
    const url = folderLink.trim();

    if (!name) {
      setError("Folder name is required.");
      return;
    }

    if (!url) {
      setError("Folder link is required.");
      return;
    }

    try {
      new URL(url);
    } catch {
      setError("Please enter a valid URL.");
      return;
    }

    if (!activeSchoolId) {
      setError("Please select a school.");
      return;
    }

    setSaving(true);

    const { data, error } = await supabase
      .from("evidence_vault_folders")
      .insert({
        school_id: activeSchoolId,
        name,
        url,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding folder:", error);
      setError(error.message || "Unable to add folder.");
      setSaving(false);
      return;
    }

    setFolders((prev) => [...prev, data]);

    setFolderName("");
    setFolderLink("");
    setShowAddModal(false);
    setSaving(false);
  };

  // =========================================================
  // Delete folder
  // =========================================================
  const handleDeleteFolder = async (folderId) => {
    if (!isAdmin) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove this folder?"
    );

    if (!confirmed) return;

    setError("");

    const { error } = await supabase
      .from("evidence_vault_folders")
      .delete()
      .eq("id", folderId);

    if (error) {
      console.error("Error deleting folder:", error);
      setError(error.message || "Unable to remove folder.");
      return;
    }

    setFolders((prev) =>
      prev.filter((folder) => folder.id !== folderId)
    );
  };

  // =========================================================
  // Open add modal
  // =========================================================
  const openAddModal = () => {
    setError("");
    setFolderName("");
    setFolderLink("");
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    if (saving) return;

    setShowAddModal(false);
    setFolderName("");
    setFolderLink("");
    setError("");
  };

  // =========================================================
  // Loading
  // =========================================================
  if (loadingSchools) {
    return (
      <main className="flex-1 p-4 lg:p-8">
        <div className="flex min-h-75 items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 size={18} className="animate-spin" />
            Loading Evidence Vault...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 lg:p-8">
      {/* =====================================================
          Header
      ====================================================== */}
      <div className="mb-6 mt-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Evidence Vault
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Access evidence and supporting documents for each school.
            </p>
          </div>

          {isAdmin && activeSchoolId && (
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 cursor-pointer"
            >
              <Plus size={18} />
              Add Folder
            </button>
          )}
        </div>
      </div>

     {/* =====================================================
          School Tabs
      ====================================================== */}
      <div className="mb-6 grid grid-cols-1 gap-2 pb-1 sm:grid-cols-2 lg:flex lg:gap-2 lg:overflow-x-auto">
        {schools.map((school) => (
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
          Current School
      ====================================================== */}
      {activeSchoolId && (
        <div className="mb-5 flex items-center gap-2">
          <Folder size={21} className="text-blue-600" />

          <h2 className="text-lg font-bold text-slate-800">
            {schools.find((school) => school.id === activeSchoolId)?.name}
          </h2>
        </div>
      )}

      {/* =====================================================
          Error
      ====================================================== */}
      {error && !showAddModal && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

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
              Add folders to provide quick access to this school's
              evidence and supporting documents.
            </p>

            {isAdmin && (
              <button
                type="button"
                onClick={openAddModal}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 cursor-pointer"
              >
                <Plus size={16} />
                Add Folder
              </button>
            )}
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

                  {/* Admin Delete */}
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDeleteFolder(folder.id)}
                      title="Remove folder"
                      className="absolute -right-2 -top-2 hidden h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 group-hover:flex cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
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

      {/* =====================================================
          Add Folder Modal
      ====================================================== */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 px-4 backdrop-blur-xs"
          onClick={closeAddModal}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  Add Evidence Folder
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Add a folder name and its external link.
                </p>
              </div>

              <button
                type="button"
                onClick={closeAddModal}
                disabled={saving}
                className="text-slate-400 transition hover:text-slate-600 disabled:opacity-50 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddFolder} className="space-y-4">
              {/* School */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-500">
                  School
                </label>

                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700">
                  {
                    schools.find(
                      (school) => school.id === activeSchoolId
                    )?.name
                  }
                </div>
              </div>

              {/* Folder Name */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-500">
                  Folder Name{" "}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="e.g. MOVs"
                  autoFocus
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10"
                />
              </div>

              {/* Folder Link */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-500">
                  Folder Link{" "}
                  <span className="text-red-500">*</span>
                </label>

                <input
                  type="url"
                  value={folderLink}
                  onChange={(e) => setFolderLink(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeAddModal}
                  disabled={saving}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  {saving && (
                    <Loader2 size={16} className="animate-spin" />
                  )}

                  {saving ? "Adding..." : "Add Folder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default EvidenceVault;
