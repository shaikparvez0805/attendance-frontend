import { useEffect, useState } from "react";
import api, { errMsg } from "../api";
import Navbar from "../components/Navbar";
import Message from "../components/Message";

export default function AdminDashboard() {
  const [tab, setTab] = useState("users");
  const [stats, setStats] = useState({});
  const [msg, setMsg] = useState(null);
  const flash = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3500);
  };
  const loadStats = () => api.get("/admin/stats").then((r) => setStats(r.data)).catch(() => {});
  useEffect(() => { loadStats(); }, []);

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="stats">
          {[["Students", stats.students], ["Faculty", stats.faculty], ["Subjects", stats.subjects], ["Classes", stats.classes]].map(([l, v]) => (
            <div className="stat" key={l}><b>{v ?? "-"}</b><span>{l}</span></div>
          ))}
        </div>
        <div className="tabs">
          {[["users", "Students & Faculty"], ["subjects", "Subjects"], ["classes", "Classes"]].map(([k, l]) => (
            <button key={k} className={tab === k ? "active" : ""} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
        <Message msg={msg} />
        {tab === "users" && <UsersTab flash={flash} reload={loadStats} />}
        {tab === "subjects" && <SubjectsTab flash={flash} reload={loadStats} />}
        {tab === "classes" && <ClassesTab flash={flash} reload={loadStats} />}
      </div>
    </>
  );
}

const emptyUser = { name: "", email: "", password: "", role: "STUDENT", rollNo: "", section: "" };

function UsersTab({ flash, reload }) {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(emptyUser);
  const [editId, setEditId] = useState(null);
  const [role, setRole] = useState("");
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");

  const load = () =>
    api.get("/admin/users", { params: { role: role || undefined, q: q || undefined } })
      .then((r) => setList(r.data)).catch((e) => flash("error", errMsg(e)));
  useEffect(() => { load(); }, [role, q]);

  const set = (k, v) => setForm({ ...form, [k]: v });
  const cancel = () => { setEditId(null); setForm(emptyUser); setErr(""); };

  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Enter a valid email";
    if (!editId && form.password.length < 6) return "Password must be at least 6 characters";
    if (editId && form.password && form.password.length < 6) return "New password must be at least 6 characters";
    if (form.role === "STUDENT" && (!form.rollNo.trim() || !form.section.trim()))
      return "Roll number and section are required for students";
    return "";
  };

  const submit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) return setErr(v);
    try {
      if (editId) await api.put(`/admin/users/${editId}`, form);
      else await api.post("/admin/users", form);
      flash("success", editId ? "User updated" : "User created");
      cancel(); load(); reload();
    } catch (ex) { setErr(errMsg(ex)); }
  };

  const edit = (u) => {
    setEditId(u.id);
    setForm({ name: u.name, email: u.email, password: "", role: u.role, rollNo: u.rollNo || "", section: u.section || "" });
    window.scrollTo(0, 0);
  };

  const del = async (u) => {
    if (!window.confirm(`Delete ${u.name}?`)) return;
    try { await api.delete(`/admin/users/${u.id}`); flash("success", "User deleted"); load(); reload(); }
    catch (ex) { flash("error", errMsg(ex)); }
  };

  return (
    <>
      <form className="card form-grid" onSubmit={submit} noValidate>
        <h3>{editId ? "Edit user" : "Add student / faculty / admin"}</h3>
        {err && <div className="alert error">{err}</div>}
        <input placeholder="Full name" value={form.name} onChange={(e) => set("name", e.target.value)} />
        <input type="email" placeholder="Email" value={form.email} onChange={(e) => set("email", e.target.value)} />
        <input type="password" placeholder={editId ? "New password (optional)" : "Password"} value={form.password} onChange={(e) => set("password", e.target.value)} />
        <select value={form.role} onChange={(e) => set("role", e.target.value)}>
          <option value="STUDENT">Student</option><option value="FACULTY">Faculty</option><option value="ADMIN">Admin</option>
        </select>
        {form.role === "STUDENT" && (
          <>
            <input placeholder="Roll number" value={form.rollNo} onChange={(e) => set("rollNo", e.target.value)} />
            <input placeholder="Section (e.g. ECE-B)" value={form.section} onChange={(e) => set("section", e.target.value)} />
          </>
        )}
        <div className="row gap">
          <button className="btn btn-primary">{editId ? "Update" : "Add user"}</button>
          {editId && <button type="button" className="btn btn-light" onClick={cancel}>Cancel</button>}
        </div>
      </form>

      <div className="card">
        <div className="row gap wrap">
          <input className="search" placeholder="Search name, email, roll no, section..." value={q} onChange={(e) => setQ(e.target.value)} />
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">All roles</option><option value="STUDENT">Students</option><option value="FACULTY">Faculty</option><option value="ADMIN">Admins</option>
          </select>
        </div>
        <div className="scroll">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Roll No</th><th>Section</th><th></th></tr></thead>
            <tbody>
              {list.length === 0 && <tr><td colSpan="6">No users found</td></tr>}
              {list.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td><td>{u.email}</td><td>{u.role}</td><td>{u.rollNo || "-"}</td><td>{u.section || "-"}</td>
                  <td className="actions">
                    <button className="btn btn-sm" onClick={() => edit(u)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => del(u)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function useFaculty() {
  const [faculty, setFaculty] = useState([]);
  useEffect(() => { api.get("/admin/users", { params: { role: "FACULTY" } }).then((r) => setFaculty(r.data)); }, []);
  return faculty;
}

function SubjectsTab({ flash, reload }) {
  const faculty = useFaculty();
  const empty = { name: "", code: "", facultyId: "" };
  const [list, setList] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [err, setErr] = useState("");

  const load = () => api.get("/admin/subjects").then((r) => setList(r.data)).catch((e) => flash("error", errMsg(e)));
  useEffect(() => { load(); }, []);
  const cancel = () => { setEditId(null); setForm(empty); setErr(""); };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) return setErr("Subject name and code are required");
    const body = { ...form, facultyId: form.facultyId ? Number(form.facultyId) : null };
    try {
      if (editId) await api.put(`/admin/subjects/${editId}`, body);
      else await api.post("/admin/subjects", body);
      flash("success", editId ? "Subject updated" : "Subject created");
      cancel(); load(); reload();
    } catch (ex) { setErr(errMsg(ex)); }
  };

  const del = async (s) => {
    if (!window.confirm(`Delete subject ${s.name}?`)) return;
    try { await api.delete(`/admin/subjects/${s.id}`); flash("success", "Subject deleted"); load(); reload(); }
    catch (ex) { flash("error", errMsg(ex)); }
  };

  return (
    <>
      <form className="card form-grid" onSubmit={submit}>
        <h3>{editId ? "Edit subject" : "Add subject"}</h3>
        {err && <div className="alert error">{err}</div>}
        <input placeholder="Subject name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Code (e.g. JFS101)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        <select value={form.facultyId} onChange={(e) => setForm({ ...form, facultyId: e.target.value })}>
          <option value="">Faculty (optional)</option>
          {faculty.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        <div className="row gap">
          <button className="btn btn-primary">{editId ? "Update" : "Add subject"}</button>
          {editId && <button type="button" className="btn btn-light" onClick={cancel}>Cancel</button>}
        </div>
      </form>
      <div className="card">
        <table>
          <thead><tr><th>Code</th><th>Name</th><th>Faculty</th><th></th></tr></thead>
          <tbody>
            {list.length === 0 && <tr><td colSpan="4">No subjects yet</td></tr>}
            {list.map((s) => (
              <tr key={s.id}>
                <td>{s.code}</td><td>{s.name}</td><td>{s.faculty?.name || "-"}</td>
                <td className="actions">
                  <button className="btn btn-sm" onClick={() => { setEditId(s.id); setForm({ name: s.name, code: s.code, facultyId: s.faculty?.id || "" }); }}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => del(s)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ClassesTab({ flash, reload }) {
  const faculty = useFaculty();
  const empty = { className: "", section: "", subjectId: "", facultyId: "" };
  const [list, setList] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [err, setErr] = useState("");

  const load = () => api.get("/admin/classes").then((r) => setList(r.data)).catch((e) => flash("error", errMsg(e)));
  useEffect(() => { load(); api.get("/admin/subjects").then((r) => setSubjects(r.data)); }, []);
  const cancel = () => { setEditId(null); setForm(empty); setErr(""); };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.className.trim() || !form.section.trim() || !form.subjectId || !form.facultyId)
      return setErr("Class name, section, subject and faculty are required");
    const body = { ...form, subjectId: Number(form.subjectId), facultyId: Number(form.facultyId) };
    try {
      if (editId) await api.put(`/admin/classes/${editId}`, body);
      else await api.post("/admin/classes", body);
      flash("success", editId ? "Class updated" : "Class created");
      cancel(); load(); reload();
    } catch (ex) { setErr(errMsg(ex)); }
  };

  const del = async (c) => {
    if (!window.confirm(`Delete class ${c.className}? Its attendance records will also be deleted.`)) return;
    try { await api.delete(`/admin/classes/${c.id}`); flash("success", "Class deleted"); load(); reload(); }
    catch (ex) { flash("error", errMsg(ex)); }
  };

  return (
    <>
      <form className="card form-grid" onSubmit={submit}>
        <h3>{editId ? "Edit class" : "Create class & assign faculty"}</h3>
        {err && <div className="alert error">{err}</div>}
        <input placeholder="Class name" value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} />
        <input placeholder="Section (e.g. ECE-B)" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} />
        <select value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })}>
          <option value="">Select subject</option>
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
        </select>
        <select value={form.facultyId} onChange={(e) => setForm({ ...form, facultyId: e.target.value })}>
          <option value="">Assign faculty</option>
          {faculty.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        <div className="row gap">
          <button className="btn btn-primary">{editId ? "Update" : "Create class"}</button>
          {editId && <button type="button" className="btn btn-light" onClick={cancel}>Cancel</button>}
        </div>
      </form>
      <div className="card">
        <table>
          <thead><tr><th>Class</th><th>Section</th><th>Subject</th><th>Faculty</th><th></th></tr></thead>
          <tbody>
            {list.length === 0 && <tr><td colSpan="5">No classes yet</td></tr>}
            {list.map((c) => (
              <tr key={c.id}>
                <td>{c.className}</td><td>{c.section}</td><td>{c.subject.name}</td><td>{c.faculty.name}</td>
                <td className="actions">
                  <button className="btn btn-sm" onClick={() => { setEditId(c.id); setForm({ className: c.className, section: c.section, subjectId: c.subject.id, facultyId: c.faculty.id }); window.scrollTo(0, 0); }}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => del(c)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
