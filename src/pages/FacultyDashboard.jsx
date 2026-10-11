import { useEffect, useState } from "react";
import api, { errMsg } from "../api";
import Navbar from "../components/Navbar";
import Message from "../components/Message";

const today = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local time

export default function FacultyDashboard() {
  const [tab, setTab] = useState("classes");
  const [classes, setClasses] = useState([]);
  const [msg, setMsg] = useState(null);
  const flash = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3500);
  };
  const loadClasses = () =>
    api.get("/faculty/classes").then((r) => setClasses(r.data)).catch((e) => flash("error", errMsg(e)));
  useEffect(() => { loadClasses(); }, []);

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="tabs">
          {[["classes", "My Classes"], ["mark", "Mark Attendance"], ["reports", "Reports & Low Attendance"]].map(([k, l]) => (
            <button key={k} className={tab === k ? "active" : ""} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
        <Message msg={msg} />
        {tab === "classes" && <ClassesTab classes={classes} reload={loadClasses} flash={flash} />}
        {tab === "mark" && <MarkTab classes={classes} flash={flash} />}
        {tab === "reports" && <ReportsTab classes={classes} flash={flash} />}
      </div>
    </>
  );
}

function ClassesTab({ classes, reload, flash }) {
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ className: "", section: "", subjectId: "" });
  const [err, setErr] = useState("");
  useEffect(() => { api.get("/faculty/subjects").then((r) => setSubjects(r.data)); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.className.trim() || !form.section.trim() || !form.subjectId) return setErr("All fields are required");
    try {
      await api.post("/faculty/classes", { ...form, subjectId: Number(form.subjectId) });
      setForm({ className: "", section: "", subjectId: "" });
      setErr("");
      flash("success", "Class created");
      reload();
    } catch (ex) { setErr(errMsg(ex)); }
  };

  return (
    <>
      <form className="card form-grid" onSubmit={submit}>
        <h3>Create class record</h3>
        {err && <div className="alert error">{err}</div>}
        <input placeholder="Class name (e.g. JFS Theory)" value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} />
        <input placeholder="Section (e.g. ECE-B)" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} />
        <select value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })}>
          <option value="">Select subject</option>
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
        </select>
        <button className="btn btn-primary">Create</button>
      </form>
      <div className="card">
        <h3>My classes</h3>
        <table>
          <thead><tr><th>Class</th><th>Section</th><th>Subject</th></tr></thead>
          <tbody>
            {classes.length === 0 && <tr><td colSpan="3">No classes yet</td></tr>}
            {classes.map((c) => <tr key={c.id}><td>{c.className}</td><td>{c.section}</td><td>{c.subject.name}</td></tr>)}
          </tbody>
        </table>
      </div>
    </>
  );
}

function MarkTab({ classes, flash }) {
  const [classId, setClassId] = useState("");
  const [date, setDate] = useState(today());
  const [roster, setRoster] = useState([]);
  const [search, setSearch] = useState("");
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    if (!classId) return flash("error", "Select a class first");
    if (!date) return flash("error", "Select a date");
    try {
      const { data } = await api.get(`/faculty/classes/${classId}/attendance`, { params: { date } });
      setRoster(data.map((s) => ({ ...s, wasMarked: s.present !== null, present: s.present ?? true })));
      setLoaded(true);
    } catch (ex) { flash("error", errMsg(ex)); }
  };

  const toggle = (id) => setRoster(roster.map((s) => (s.studentId === id ? { ...s, present: !s.present } : s)));
  const setAll = (v) => setRoster(roster.map((s) => ({ ...s, present: v })));

  const save = async () => {
    try {
      const { data } = await api.post(`/faculty/classes/${classId}/attendance`, {
        date,
        records: roster.map((s) => ({ studentId: s.studentId, present: s.present })),
      });
      flash("success", data.message);
      load();
    } catch (ex) { flash("error", errMsg(ex)); }
  };

  const shown = roster.filter((s) => (s.name + s.rollNo).toLowerCase().includes(search.toLowerCase()));
  const presentCount = roster.filter((s) => s.present).length;

  return (
    <div className="card">
      <div className="row gap wrap">
        <select value={classId} onChange={(e) => { setClassId(e.target.value); setLoaded(false); }}>
          <option value="">Select class</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.className} - {c.section} ({c.subject.name})</option>)}
        </select>
        <input type="date" value={date} max={today()} onChange={(e) => { setDate(e.target.value); setLoaded(false); }} />
        <button className="btn btn-primary" onClick={load}>Load students</button>
      </div>

      {loaded && (
        <>
          <div className="row between wrap gap top">
            <input className="search" placeholder="Search name / roll no..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <div className="row gap">
              <button className="btn btn-light" onClick={() => setAll(true)}>All present</button>
              <button className="btn btn-light" onClick={() => setAll(false)}>All absent</button>
            </div>
          </div>
          <table>
            <thead><tr><th>Roll No</th><th>Name</th><th>Status</th></tr></thead>
            <tbody>
              {shown.length === 0 && <tr><td colSpan="3">No students found in this section</td></tr>}
              {shown.map((s) => (
                <tr key={s.studentId}>
                  <td>{s.rollNo}</td>
                  <td>{s.name}</td>
                  <td>
                    <button className={`toggle ${s.present ? "on" : "off"}`} onClick={() => toggle(s.studentId)}>
                      {s.present ? "Present" : "Absent"}
                    </button>
                    {s.wasMarked && <span className="muted"> (already marked)</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="row between top">
            <span className="muted">{presentCount} present / {roster.length - presentCount} absent</span>
            <button className="btn btn-primary" onClick={save} disabled={roster.length === 0}>Save attendance</button>
          </div>
        </>
      )}
    </div>
  );
}

function ReportsTab({ classes, flash }) {
  const [classId, setClassId] = useState("");
  const [threshold, setThreshold] = useState(75);
  const [onlyLow, setOnlyLow] = useState(true);
  const [rows, setRows] = useState(null);

  const load = async () => {
    const t = Number(threshold);
    if (onlyLow && (isNaN(t) || t < 1 || t > 100)) return flash("error", "Threshold must be between 1 and 100");
    try {
      const params = { classId: classId || undefined };
      if (onlyLow) params.threshold = t;
      const { data } = await api.get("/faculty/report", { params });
      setRows(data);
    } catch (ex) { flash("error", errMsg(ex)); }
  };

  return (
    <div className="card">
      <div className="row gap wrap">
        <select value={classId} onChange={(e) => setClassId(e.target.value)}>
          <option value="">All my classes</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.className} - {c.section}</option>)}
        </select>
        <label className="inline"><input type="checkbox" checked={onlyLow} onChange={(e) => setOnlyLow(e.target.checked)} /> Only below</label>
        <input type="number" className="small" value={threshold} disabled={!onlyLow} onChange={(e) => setThreshold(e.target.value)} /> %
        <button className="btn btn-primary" onClick={load}>Generate report</button>
      </div>
      {rows && (
        <table>
          <thead><tr><th>Roll No</th><th>Student</th><th>Subject</th><th>Present / Total</th><th>%</th></tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan="5">No students found 🎉</td></tr>}
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{r.rollNo}</td><td>{r.studentName}</td><td>{r.subject}</td>
                <td>{r.present} / {r.total}</td>
                <td className={r.percentage < 75 ? "red" : "green"}><b>{r.percentage}%</b></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
