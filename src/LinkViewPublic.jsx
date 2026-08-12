import { useEffect, useState } from "react";
import {
  FileSpreadsheet,
  ExternalLink,
  X,
  Loader2,
  Pencil,
  Trash2,
  School,
  RefreshCw,
} from "lucide-react";
import { supabase } from "./supabaseClient";
import { useAuth } from "./useAuth";

// Turns a normal Google Sheets edit URL into the embeddable
// read-only /preview URL. Requires the sheet to be shared as
// "Anyone with the link can view" (does not need to be published
// to the web).
const getSheetId = (url) => {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
};

const getEmbedUrl = (url) => {
  const id = getSheetId(url);
  return id ? `https://docs.google.com/spreadsheets/d/${id}/preview` : null;
};

const LinkViewPublic = () => {
  const { profile } = useAuth();

  const [schools, setSchools] = useState([]);
  const [activeSchoolId, setActiveSchoolId] = useState(null);
  const [link, setLink] = useState(null);

  const [loadingSchools, setLoadingSchools] = useState(true);
  const [loadingLink, setLoadingLink] = useState(false);
  const [embedLoaded, setEmbedLoaded] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [linkName, setLinkName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
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
  // Load the school's sheet link whenever school changes
  // =========================================================
  useEffect(() => {
    if (!activeSchoolId) return;

    const loadLink = async () => {
      setLoadingLink(true);
      setEmbedLoaded(false);
      setError("");

      const { data, error } = await supabase
        .from("excel_links")
        .select("id, school_id, name, url, created_at")
        .eq("school_id", activeSchoolId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error loading sheet:", error);
        setError("Unable to load sheet.");
        setLink(null);
      } else {
        setLink(data);
      }

      setLoadingLink(false);
    };

    loadLink();
  }, [activeSchoolId]);

  // =========================================================
  // Add / update link (one per school, so this upserts)
  // =========================================================
  const handleSaveLink = async (e) => {
    e.preventDefault();

    if (!isAdmin) return;

    setError("");

    const name = linkName.trim();
    const url = linkUrl.trim();

    if (!name) {
      setError("Sheet name is required.");
      return;
    }

    if (!url) {
      setError("Google Sheet link is required.");
      return;
    }

    try {
      new URL(url);
    } catch {
      setError("Please enter a valid URL.");
      return;
    }

    if (!getSheetId(url)) {
      setError("Please enter a valid Google Sheets link.");
      return;
    }

    if (!activeSchoolId) {
      setError("Please select a school.");
      return;
    }

    setSaving(true);

    let result;

    if (link) {
      // Existing link for this school -> update it
      result = await supabase
        .from("excel_links")
        .update({ name, url })
        .eq("id", link.id)
        .select()
        .single();
    } else {
      // No link yet for this school -> insert
      result = await supabase
        .from("excel_links")
        .insert({ school_id: activeSchoolId, name, url })
        .select()
        .single();
    }

    if (result.error) {
      console.error("Error saving sheet:", result.error);
      setError(result.error.message || "Unable to save sheet.");
      setSaving(false);
      return;
    }

    setLink(result.data);
    setEmbedLoaded(false);
    setShowModal(false);
    setSaving(false);
  };

  // =========================================================
  // Remove link
  // =========================================================
  const handleRemoveLink = async () => {
    if (!isAdmin || !link) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove this sheet link?"
    );

    if (!confirmed) return;

    setError("");

    const { error } = await supabase
      .from("excel_links")
      .delete()
      .eq("id", link.id);

    if (error) {
      console.error("Error removing sheet:", error);
      setError(error.message || "Unable to remove sheet.");
      return;
    }

    setLink(null);
  };

  // =========================================================
  // Refresh the embedded sheet
  // =========================================================
  const handleRefresh = () => {
    setEmbedLoaded(false);
    setRefreshToken(Date.now());
  };

  // =========================================================
  // Modal
  // =========================================================
  const openModal = () => {
    setError("");
    setLinkName(link?.name || "");
    setLinkUrl(link?.url || "");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
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
            Loading Link...
          </div>
        </div>
      </main>
    );
  }

  const baseEmbedUrl = link ? getEmbedUrl(link.url) : null;
  // Google caches /preview aggressively, so a plain re-render of the same
  // src won't pull in edits made in Sheets. Appending a changing param
  // forces the iframe to actually re-request the page.
  const embedUrl = baseEmbedUrl
    ? `${baseEmbedUrl}?r=${refreshToken}`
    : null;

  return (
    <main className="flex flex-1 flex-col p-4 lg:p-8">
      {/* =====================================================
          Header
      ====================================================== */}
      <div className="mb-6 mt-2">
        <h1 className="text-2xl font-bold text-slate-800">LINK (Leveraging Initiatives in Networking and Key Partnerships)</h1>

        <p className="mt-1 text-sm text-slate-500">
          View each school's LINK via Google Sheet.
        </p>
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
          Error
      ====================================================== */}
      {error && !showModal && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* =====================================================
          Sheet Area
      ====================================================== */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loadingLink ? (
          <div className="flex min-h-100 flex-1 items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 size={18} className="animate-spin" />
              Loading sheet...
            </div>
          </div>
        ) : !link ? (
          <div className="flex min-h-100 flex-1 flex-col items-center justify-center text-center p-6">
            <FileSpreadsheet size={56} className="mb-3 text-slate-300" />

            <h3 className="text-sm font-semibold text-slate-700">
              No sheet linked yet
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-400">
              {isAdmin
                ? "Link a Google Sheet for this school to preview it here."
                : "Once an admin links a Google Sheet for this school, it will appear here."}
            </p>

            {isAdmin && (
              <button
                type="button"
                onClick={openModal}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 cursor-pointer"
              >
                <FileSpreadsheet size={16} />
                Link Sheet
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Sheet Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
              <div className="flex min-w-0 items-center gap-2">
                <FileSpreadsheet size={20} className="shrink-0 text-emerald-600" />
                <h3 className="truncate text-base font-bold text-slate-800">
                  {link.name}
                </h3>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={handleRefresh}
                  title="Refresh sheet preview"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 cursor-pointer sm:text-sm"
                >
                  <RefreshCw size={15} className={embedLoaded ? "" : "animate-spin"} />
                  Refresh
                </button>

                {isAdmin && (
                  <>
                    <button
                      type="button"
                      onClick={openModal}
                      title="Change linked sheet"
                      className="inline-flex items-center justify-center rounded-lg border border-slate-300 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 cursor-pointer"
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={handleRemoveLink}
                      title="Remove linked sheet"
                      className="inline-flex items-center justify-center rounded-lg border border-slate-300 p-2 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Embedded full sheet */}
            <div className="relative flex-1 bg-slate-50">
              {!embedLoaded && embedUrl && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 size={18} className="animate-spin" />
                    Loading sheet preview...
                  </div>
                </div>
              )}

              {embedUrl ? (
                <iframe
                  key={embedUrl}
                  src={embedUrl}
                  title={link.name}
                  onLoad={() => setEmbedLoaded(true)}
                  className="h-full min-h-100 w-full border-0"
                />
              ) : (
                <div className="flex h-full min-h-100 items-center justify-center text-sm text-slate-500">
                  Unable to preview this link.
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* =====================================================
          Add / Edit Sheet Modal
      ====================================================== */}
      {showModal && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 px-4 backdrop-blur-xs"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  {link ? "Change Linked Sheet" : "Link Google Sheet"}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  The sheet must be shared as "Anyone with the link can view"
                  for the preview to load.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="text-slate-400 transition hover:text-slate-600 disabled:opacity-50 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveLink} className="space-y-4">
              {/* School */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-500">
                  School
                </label>

                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700">
                  {schools.find((school) => school.id === activeSchoolId)?.name}
                </div>
              </div>

              {/* Sheet Name */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-500">
                  Sheet Name <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  value={linkName}
                  onChange={(e) => setLinkName(e.target.value)}
                  placeholder="e.g. Enrollment Tracker"
                  autoFocus
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10"
                />
              </div>

              {/* Sheet Link */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-500">
                  Google Sheet Link <span className="text-red-500">*</span>
                </label>

                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
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
                  onClick={closeModal}
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
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {saving ? "Saving..." : link ? "Save Changes" : "Link Sheet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default LinkViewPublic;