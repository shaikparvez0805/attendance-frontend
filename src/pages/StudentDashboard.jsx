import { useEffect, useState } from "react";
import api, { errMsg } from "../api";
import Navbar from "../components/Navbar";
import Message from "../components/Message";

const LIMIT = 75;
const colorOf = (p, total) => (total === 0 ? "grey" : p >= LIMIT ? "green" : "red");

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [msg, setMsg] = useState(null);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(null);

  useEffect(() => {
    api.get("/student/attendance").then((r) => setData(r.data)).catch((e) => setMsg({ type: "error", text: errMsg(e) }));
  }, []);

  const subjects = (data?.subjects || []).filter((s) =>
    (s.subject + s.className + s.subjectCode).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="container">
        <Message msg={msg} />
        {data && (
          <>
            <div className="card row between">
              <div>
                <h2>{data.name}</h2>
                <div className="muted">Roll No: {data.rollNo} &nbsp;|&nbsp; Section: {data.section}</div>
              </div>
              <div className={`big-pct ${colorOf(data.overallPercentage, data.subjects.length ? 1 : 0)}`}>
                {data.overallPercentage}%<small>Overall attendance</small>
              </div>
            </div>

            <div className="card">
              <div className="row between">
                <h3>Subject-wise attendance</h3>
                <input className="search" placeholder="Search subject..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              {subjects.length === 0 && <p className="muted">No subjects found.</p>}
              {subjects.map((s) => (
                <div key={s.classId} className="subject">
                  <div className="row between">
                    <div>
                      <b>{s.subject}</b> <span className="muted">({s.subjectCode})</span>
                      <div className="muted">{s.className} · {s.faculty}</div>
                    </div>
                    <div className="right">
                      <b className={colorOf(s.percentage, s.total)}>{s.percentage}%</b>
                      <div className="muted">{s.present}/{s.total} classes</div>
                    </div>
                  </div>
                  <div className="bar"><div className={`fill ${colorOf(s.percentage, s.total)}`} style={{ width: `${s.percentage}%` }} /></div>
                  {s.total > 0 && s.percentage < LIMIT && <div className="warn">⚠ Below {LIMIT}% - attendance shortage</div>}
                  <button className="link" onClick={() => setOpen(open === s.classId ? null : s.classId)}>
                    {open === s.classId ? "Hide records" : "View daily records"}
                  </button>
                  {open === s.classId && (
                    <table>
                      <thead><tr><th>Date</th><th>Status</th></tr></thead>
                      <tbody>
                        {s.records.length === 0 && <tr><td colSpan="2">No records yet</td></tr>}
                        {s.records.map((r) => (
                          <tr key={r.date}><td>{r.date}</td><td className={r.present ? "green" : "red"}>{r.present ? "Present" : "Absent"}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
