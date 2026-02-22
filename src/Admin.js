import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export default function Admin() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdmissions();
  }, []);

  async function fetchAdmissions() {
    const { data, error } = await supabase
      .from("admissions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) alert(error.message);
    else setData(data);
    setLoading(false);
  }

  if (loading) return <div style={{ padding: 40 }}>Loading Admissions...</div>;

  return (
    <div style={{ padding: "40px 20px", fontFamily: "serif", background: "#f8f4ec", minHeight: "100vh" }}>
      <h1 style={{ color: "#1b3a2d" }}>Admin Admissions Dashboard</h1>
      <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 8, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <thead style={{ background: "#1b3a2d", color: "#fff" }}>
          <tr>
            <th style={{ padding: 12, textAlign: "left" }}>App ID</th>
            <th style={{ padding: 12, textAlign: "left" }}>Student Name</th>
            <th style={{ padding: 12, textAlign: "left" }}>Department</th>
            <th style={{ padding: 12, textAlign: "left" }}>Documents</th>
            <th style={{ padding: 12, textAlign: "left" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: 12, fontWeight: "bold" }}>{item.application_id}</td>
              <td style={{ padding: 12 }}>{item.first_name} {item.last_name}</td>
              <td style={{ padding: 12 }}>{item.department}</td>
              <td style={{ padding: 12 }}>
                <a href={item.photo_url} target="_blank" rel="noreferrer">Photo</a> | 
                <a href={item.transcript_url} target="_blank" rel="noreferrer"> Transcript</a>
              </td>
              <td style={{ padding: 12 }}>
                <span style={{ padding: "4px 8px", borderRadius: 4, background: item.status === "Pending" ? "#fef9ec" : "#edf7f1", color: item.status === "Pending" ? "#7a6200" : "#2d6a4f", fontSize: 12 }}>
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}