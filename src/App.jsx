// App.jsx
// Day 1: Admin creates activities, assigns to schools, view-only submissions list

import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { useAuth } from "./useAuth";

// ============================================
// Compliance calculation — now reads submissions, not activities
// ============================================
const complianceCalculator = (school) => {
  if (!school.submissions || school.submissions.length === 0) {
    return 0;
  }
  const completed = school.submissions.filter(
    (submission) => submission.status === "completed",
  );
  return Math.round((completed.length / school.submissions.length) * 100);
};

const ComplianceBadge = ({ complianceRating }) => {
  const isGood = complianceRating >= 75;
  return (
    <span
      style={{
        opacity: 0.8,
        color: isGood ? "green" : "red",
        fontStyle: "italic",
        fontSize: 15,
      }}
    >
      Compliance: {complianceRating}%
    </span>
  );
};

// ============================================
// School list + card
// ============================================
const SchoolList = ({ schoolData }) => {
  return (
    <div style={{ textAlign: "left", paddingLeft: 16, paddingTop: 35 }}>
      {schoolData.map((school) => (
        <SchoolCard key={school.id} school={school} />
      ))}
    </div>
  );
};

const SchoolCard = ({ school }) => {
  const [showSubmissions, setShowSubmissions] = useState(false);

  return (
    <>
      <h2>{school.name}</h2>
      <ComplianceBadge complianceRating={complianceCalculator(school)} />
      <br />

      {school.submissions.length !== 0 ? (
        <button onClick={() => setShowSubmissions(!showSubmissions)}>
          {showSubmissions ? "Hide Activities" : "Show Activities"}
        </button>
      ) : (
        <p style={{ fontStyle: "italic", opacity: 0.6 }}>
          No activities assigned yet.
        </p>
      )}

      <ul>
        {showSubmissions &&
          school.submissions.map((submission) => (
            <SubmissionRow key={submission.id} submission={submission} />
          ))}
      </ul>
    </>
  );
};

// ============================================
// Submission row — READ ONLY for Day 1
// activity name/due_date come from the nested `activities` object,
// status/remarks come from the submission itself
// ============================================
const SubmissionRow = ({ submission }) => {
  const isCompleted = submission.status === "completed";

  return (
    <li style={{ color: "white" }}>
      {isCompleted ? "✅" : "⏳"} {submission.activities.name}
      {submission.activities.due_date && (
        <span style={{ opacity: 0.6 }}> (due {submission.activities.due_date})</span>
      )}
      {" — "}
      <span style={{ opacity: 0.8 }}>{submission.status}</span>
    </li>
  );
};

// ============================================
// Create Activity — Admin only, assigns to multiple schools at once
// ============================================
const CreateActivity = ({ allSchools, onActivityCreated }) => {
  const [name, setName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedSchoolIds, setSelectedSchoolIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function toggleSchool(id) {
    setSelectedSchoolIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (name.trim() === "" || selectedSchoolIds.length === 0) {
      setError("Activity name and at least one school are required.");
      return;
    }

    setSubmitting(true);

    // Step 1: insert the activity
    const { data: activity, error: activityError } = await supabase
      .from("activities")
      .insert({ name, due_date: dueDate || null })
      .select()
      .single();

    if (activityError) {
      setError(activityError.message);
      setSubmitting(false);
      return;
    }

    // Step 2: bulk-insert submissions for each selected school
    const submissionRows = selectedSchoolIds.map((schoolId) => ({
      activity_id: activity.id,
      school_id: schoolId,
      status: "not_started",
    }));

    const { data: newSubmissions, error: submissionError } = await supabase
      .from("submissions")
      .insert(submissionRows)
      .select("*, activities(*)"); // return with nested activity so parent state matches fetch shape

    if (submissionError) {
      setError(submissionError.message);
      setSubmitting(false);
      return;
    }

    onActivityCreated(newSubmissions);

    setName("");
    setDueDate("");
    setSelectedSchoolIds([]);
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
      <h3>Create Activity</h3>
      <input
        type="text"
        placeholder="Activity name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />

      <fieldset>
        <legend>Assign to schools</legend>
        {allSchools.map((school) => (
          <label key={school.id} style={{ display: "block" }}>
            <input
              type="checkbox"
              checked={selectedSchoolIds.includes(school.id)}
              onChange={() => toggleSchool(school.id)}
            />
            {school.name}
          </label>
        ))}
      </fieldset>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? "Creating..." : "Create Activity"}
      </button>
    </form>
  );
};

// ============================================
// Login
// ============================================
const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) setError(error.message);
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
      />
      <input
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Password"
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button type="submit" disabled={submitting}>
        {submitting ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
};

// ============================================
// Admin Dashboard
// ============================================
const AdminDashboard = () => {
  const [schoolData, setSchoolData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadSchools() {
      const { data, error } = await supabase
        .from("schools")
        .select("*, submissions(*, activities(*))")
        .order("name");

      if (error) {
        setError(error.message);
      } else {
        setSchoolData(data);
      }
      setLoading(false);
    }
    loadSchools();
  }, []);

  // Called after CreateActivity successfully inserts submissions.
  // newSubmissions is an array — one row per school that was assigned.
  function handleActivityCreated(newSubmissions) {
    console.log(newSubmissions);
    setSchoolData((prev) =>
      prev.map((school) => {
        const matchingSubmission = newSubmissions.find(
          (s) => s.school_id === school.id,
        );

        // if there's no school match, jsut keep the school data
        if (!matchingSubmission) return school; 

        // if there's a school match, add a submission
        return {
          ...school,
          submissions: [...school.submissions, matchingSubmission],
        };
      }),
    );
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const filteredSchools = schoolData.filter((school) =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const isEmptySchools = filteredSchools.length === 0;

  return (
    <>
      <div>
        <h1>School Compliance Dashboard</h1>
        <LogoutButton />
      </div>

      <CreateActivity
        allSchools={schoolData}
        onActivityCreated={handleActivityCreated}
      />

      <input
        type="text"
        placeholder="Search Schools..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div>
        {isEmptySchools && (
          <p style={{ fontStyle: "italic", paddingTop: 100 }}>
            No Schools Found.
          </p>
        )}
        <SchoolList schoolData={filteredSchools} />
      </div>
    </>
  );
};

// ============================================
// Placeholder — built out Day 2
// ============================================
// Add this near your other components, replacing the Day 1 placeholder

const SchoolHeadDashboard = ({ profile }) => {
  const [submissions, setSubmissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadSubmissions() {
      const { data, error } = await supabase
        .from("submissions")
        .select("*, activities(*)")
        .eq("school_id", profile.school_id)
        .order("updated_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setSubmissions(data);
      }
      setLoading(false);
    }
    loadSubmissions();
  }, [profile.school_id]);

  function handleSubmissionUpdated(updatedSubmission) {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === updatedSubmission.id ? { ...s, ...updatedSubmission } : s)),
    );
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ padding: 16 }}>
      <h1>My School's Activities</h1>
      <LogoutButton />
      {submissions.length === 0 ? (
        <p style={{ fontStyle: "italic" }}>No activities assigned yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {submissions.map((submission) => (
            <SubmissionEditRow
              key={submission.id}
              submission={submission}
              onUpdated={handleSubmissionUpdated}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

const SubmissionEditRow = ({ submission, onUpdated }) => {
  const [status, setStatus] = useState(submission.status);
  const [remarks, setRemarks] = useState(submission.remarks || "");
  const [dateConducted, setDateConducted] = useState(submission.date_conducted || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSave() {
    setSaving(true);
    setError(null);

    const { data, error } = await supabase
      .from("submissions")
      .update({
        status,
        remarks,
        date_conducted: dateConducted || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", submission.id)
      .select("*, activities(*)")
      .single();

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    onUpdated(data);
    setSaving(false);
  }

  return (
    <li
      style={{
        border: "1px solid #444",
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
      }}
    >
      <strong>{submission.activities.name}</strong>
      {submission.activities.due_date && (
        <span style={{ opacity: 0.6 }}> (due {submission.activities.due_date})</span>
      )}
      <br />

      <label>
        Status:{" "}
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="not_started">Not Started</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
        </select>
      </label>
      <br />

      <label>
        Date conducted:{" "}
        <input
          type="date"
          value={dateConducted}
          onChange={(e) => setDateConducted(e.target.value)}
        />
      </label>
      <br />

      <label>
        Remarks:
        <br />
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          rows={2}
          style={{ width: "100%" }}
        />
      </label>
      <br />

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save"}
      </button>
    </li>
  );
};

const LogoutButton = () => {
  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error(error.message);
    }
    // no need to manually reset state — onAuthStateChange in useAuth()
    // will pick up session becoming null, and App() will re-render LoginPage
  }

  return <button onClick={handleLogout}>Log Out</button>;
};

// ============================================
// App root — routes by auth + role
// ============================================
function App() {
  const { session, profile, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!session) return <LoginPage />;
  if (!profile) return <p>Setting up your account...</p>;

  return profile.role === "admin" ? <AdminDashboard /> : <SchoolHeadDashboard profile={profile}/>;
}

export default App;