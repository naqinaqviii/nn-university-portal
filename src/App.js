import React, { useState, useRef, Component } from "react";
import { supabase } from "./supabaseClient";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    this.setState({ error, info });
    // keep the error visible in console as well
    console.error("Uncaught error in App:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, fontFamily: "sans-serif" }}>
          <h2 style={{ color: "#b5451b" }}>Something went wrong</h2>
          <div style={{ whiteSpace: "pre-wrap", marginTop: 12, color: "#333" }}>{String(this.state.error && this.state.error.message ? this.state.error.message : this.state.error)}</div>
          <details style={{ marginTop: 12, color: "#666" }}>
            {this.state.info && this.state.info.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

const STEPS = ["Personal Info", "Academic", "Program", "Documents", "Submit"];

const DEPARTMENTS = [
  "Computer Science", "Business Administration", "Medicine", "Law",
  "Engineering", "Arts & Humanities", "Natural Sciences", "Education",
  "Architecture", "Economics",
];

const PROVINCES = [
  "Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan",
  "Gilgit-Baltistan", "Azad Kashmir", "Islamabad Capital Territory",
];

const initialForm = {
  photo: null, photoURL: null,
  firstName: "", lastName: "", fatherName: "", cnic: "",
  email: "", phone: "", dob: "", gender: "", province: "", address: "",
  institution: "", degree: "", major: "", graduationYear: "", grade: "", gpa: "",
  department: "", intakeYear: "", shift: "",
  transcript: null, domicile: null, matricCert: null,
};

const validate = (step, form) => {
  const e = {};
  if (step === 0) {
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.fatherName.trim()) e.fatherName = "Required";
    if (!form.cnic.trim()) e.cnic = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (!/^\d{10,11}$/.test(form.phone.replace(/\D/g, ""))) e.phone = "10–11 digits required";
    if (!form.dob) e.dob = "Required";
    if (!form.gender) e.gender = "Required";
    if (!form.province) e.province = "Required";
  }
  if (step === 1) {
    if (!form.institution.trim()) e.institution = "Required";
    if (!form.degree.trim()) e.degree = "Required";
    if (!form.graduationYear) e.graduationYear = "Required";
    if (!form.grade) e.grade = "Required";
  }
  if (step === 2) {
    if (!form.department) e.department = "Required";
    if (!form.intakeYear) e.intakeYear = "Required";
  }
  if (step === 3) {
    if (!form.transcript) e.transcript = "Required";
  }
  return e;
};

// ── palette ──────────────────────────────────────────────────────────────────
const G = {
  darkGreen:   "#1b3a2d",
  deepGreen:   "#163323",
  midGreen:    "#2d6a4f",
  accent:      "#52b788",
  lightAccent: "#74c69d",
  ivory:       "#f8f4ec",
  ivoryDark:   "#ede8dc",
  ivoryMid:    "#e8e0d0",
  text:        "#1b2e24",
  muted:       "#6b7c74",
  error:       "#b5451b",
};

// ── primitives ───────────────────────────────────────────────────────────────
const inputBase = (err) => ({
  width: "100%", boxSizing: "border-box", padding: "11px 14px", borderRadius: 7,
  border: `1.5px solid ${err ? G.error : "#cdc8bb"}`,
  background: "#fff", color: G.text, fontSize: 14,
  outline: "none", fontFamily: "inherit", transition: "border-color 0.2s",
});

const Field = ({ label, required, error, children, half }) => (
  <div style={{ flex: half ? "0 0 calc(50% - 8px)" : "1 1 100%", minWidth: 0 }}>
    <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: G.midGreen, textTransform: "uppercase", marginBottom: 6, display: "block" }}>
      {label}{required && <span style={{ color: G.error, marginLeft: 2 }}>*</span>}
    </label>
    {children}
    {error && <div style={{ fontSize: 11, color: G.error, marginTop: 4 }}>{error}</div>}
  </div>
);

const Input = ({ name, value, onChange, errors, type = "text", placeholder }) => (
  <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
    style={inputBase(errors[name])}
    onFocus={e => e.target.style.borderColor = G.accent}
    onBlur={e => e.target.style.borderColor = errors[name] ? G.error : "#cdc8bb"}
  />
);

const Select = ({ name, value, onChange, errors, options, placeholder }) => (
  <select name={name} value={value} onChange={onChange}
    style={{ ...inputBase(errors[name]), cursor: "pointer" }}
    onFocus={e => e.target.style.borderColor = G.accent}
    onBlur={e => e.target.style.borderColor = errors[name] ? G.error : "#cdc8bb"}
  >
    <option value="">{placeholder}</option>
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);

// ── photo upload ──────────────────────────────────────────────────────────────
const PhotoUpload = ({ form, setForm }) => {
  const ref = useRef();
  return (
    <div onClick={() => ref.current.click()} style={{
      border: `2px dashed ${G.accent}`, borderRadius: 12, padding: "28px 20px",
      textAlign: "center", cursor: "pointer",
      background: "linear-gradient(135deg,#f0f7f3,#e8f5ee)",
      marginBottom: 24, transition: "background 0.2s",
    }}>
      <input ref={ref} type="file" accept="image/*" hidden
        onChange={e => { const f = e.target.files[0]; if (f) setForm(p => ({ ...p, photo: f, photoURL: URL.createObjectURL(f) })); }} />
      {form.photoURL
        ? <img src={form.photoURL} alt="passport" style={{ width: 80, height: 80, borderRadius: 10, objectFit: "cover", marginBottom: 8, display: "block", margin: "0 auto 10px", border: `3px solid ${G.accent}` }} />
        : <div style={{ fontSize: 38, marginBottom: 8 }}>📷</div>}
      <div style={{ fontSize: 14, fontWeight: 700, color: G.darkGreen }}>{form.photo ? form.photo.name : "Upload Passport Photo"}</div>
      <div style={{ fontSize: 12, color: G.muted, marginTop: 4 }}>JPG or PNG, white background, max 2MB</div>
    </div>
  );
};

// ── step components ───────────────────────────────────────────────────────────
const Step1 = ({ form, onChange, setForm, errors }) => (
  <div>
    <PhotoUpload form={form} setForm={setForm} />
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
      <Field label="First Name" required error={errors.firstName} half><Input name="firstName" value={form.firstName} onChange={onChange} errors={errors} placeholder="Muhammad" /></Field>
      <Field label="Last Name" required error={errors.lastName} half><Input name="lastName" value={form.lastName} onChange={onChange} errors={errors} placeholder="Ahmed" /></Field>
      <Field label="Father's Name" required error={errors.fatherName} half><Input name="fatherName" value={form.fatherName} onChange={onChange} errors={errors} placeholder="Muhammad Javed" /></Field>
      <Field label="CNIC / B-Form No." required error={errors.cnic} half><Input name="cnic" value={form.cnic} onChange={onChange} errors={errors} placeholder="42301-6447178-4" /></Field>
      <Field label="Email Address" required error={errors.email} half><Input name="email" type="email" value={form.email} onChange={onChange} errors={errors} placeholder="example@email.com" /></Field>
      <Field label="Phone Number" required error={errors.phone} half><Input name="phone" value={form.phone} onChange={onChange} errors={errors} placeholder="0300-1234567" /></Field>
      <Field label="Date of Birth" required error={errors.dob} half><Input name="dob" type="date" value={form.dob} onChange={onChange} errors={errors} /></Field>
      <Field label="Gender" required error={errors.gender} half><Select name="gender" value={form.gender} onChange={onChange} errors={errors} options={["Male","Female","Other"]} placeholder="Select gender" /></Field>
      <Field label="Province" required error={errors.province} half><Select name="province" value={form.province} onChange={onChange} errors={errors} options={PROVINCES} placeholder="Select province" /></Field>
      <Field label="Permanent Address" error={errors.address}><Input name="address" value={form.address} onChange={onChange} errors={errors} placeholder="Street, City, District" /></Field>
    </div>
  </div>
);

const Step2 = ({ form, onChange, errors }) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
    <Field label="Previous Institution" required error={errors.institution}><Input name="institution" value={form.institution} onChange={onChange} errors={errors} placeholder="Name of school/college/university" /></Field>
    <Field label="Degree / Certificate" required error={errors.degree} half><Input name="degree" value={form.degree} onChange={onChange} errors={errors} placeholder="e.g. FSc, A-Levels" /></Field>
    <Field label="Major / Field of Study" error={errors.major} half><Input name="major" value={form.major} onChange={onChange} errors={errors} placeholder="e.g. Pre-Medical" /></Field>
    <Field label="Graduation Year" required error={errors.graduationYear} half><Select name="graduationYear" value={form.graduationYear} onChange={onChange} errors={errors} options={Array.from({ length: 15 }, (_, i) => String(2024 - i))} placeholder="Select year" /></Field>
    <Field label="Grade / Division" required error={errors.grade} half><Select name="grade" value={form.grade} onChange={onChange} errors={errors} options={["A+","A","A-","B+","B","B-","C+","C","D","Distinction","Merit"]} placeholder="Select grade" /></Field>
    <Field label="Percentage / CGPA" error={errors.gpa} half><Input name="gpa" value={form.gpa} onChange={onChange} errors={errors} placeholder="e.g. 85% or 3.7" /></Field>
  </div>
);

const Step3 = ({ form, onChange, errors }) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
    <Field label="Select Department" required error={errors.department}><Select name="department" value={form.department} onChange={onChange} errors={errors} options={DEPARTMENTS} placeholder="Choose your department" /></Field>
    <Field label="Intake Year" required error={errors.intakeYear} half><Select name="intakeYear" value={form.intakeYear} onChange={onChange} errors={errors} options={["2025","2026"]} placeholder="Select year" /></Field>
    <Field label="Shift Preference" error={errors.shift} half><Select name="shift" value={form.shift} onChange={onChange} errors={errors} options={["Morning","Evening"]} placeholder="Select shift" /></Field>
    <div style={{ flex: "1 1 100%", background: "#edf7f1", border: `1px solid ${G.lightAccent}`, borderRadius: 10, padding: "16px 20px" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: G.darkGreen, marginBottom: 6 }}>🌿 Eligibility Note</div>
      <div style={{ fontSize: 13, color: G.muted, lineHeight: 1.75 }}>Minimum 50% marks required for most programs. Merit-based admission for Medical & Law. Please ensure your selected department aligns with your academic background.</div>
    </div>
  </div>
);

const DocBox = ({ name, label, icon, form, setForm, errors }) => {
  const ref = useRef();
  const file = form[name];
  return (
    <div onClick={() => ref.current.click()} style={{
      border: `2px dashed ${errors[name] ? G.error : file ? G.accent : "#cdc8bb"}`,
      borderRadius: 12, padding: "24px 16px", textAlign: "center", cursor: "pointer",
      background: file ? "#edf7f1" : "#fafaf6",
      flex: "0 0 calc(33% - 11px)", minWidth: 140, transition: "all 0.2s",
    }}>
      <input ref={ref} type="file" hidden onChange={e => setForm(f => ({ ...f, [name]: e.target.files[0] || null }))} />
      <div style={{ fontSize: 30, marginBottom: 8 }}>{file ? "✅" : icon}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: file ? G.midGreen : G.muted }}>{file ? file.name : label}</div>
      {!file && <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>Click to upload</div>}
      {errors[name] && <div style={{ fontSize: 11, color: G.error, marginTop: 4 }}>{errors[name]}</div>}
    </div>
  );
};

const Step4 = ({ form, setForm, errors }) => (
  <div>
    <div style={{ fontSize: 13, color: G.muted, marginBottom: 20, lineHeight: 1.6 }}>Upload clear scanned copies. Accepted formats: PDF, JPG, PNG (max 5MB each).</div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
      <DocBox name="transcript" label="Academic Transcript" icon="📄" form={form} setForm={setForm} errors={errors} />
      <DocBox name="domicile" label="Domicile Certificate" icon="🏠" form={form} setForm={setForm} errors={errors} />
      <DocBox name="matricCert" label="Matric Certificate" icon="🎓" form={form} setForm={setForm} errors={errors} />
    </div>
  </div>
);

const Step5 = ({ form }) => {
  const Section = ({ title, rows }) => (
    <div style={{ marginBottom: 16, border: `1px solid ${G.ivoryMid}`, borderRadius: 10, overflow: "hidden" }}>
      <div style={{ background: G.darkGreen, color: G.lightAccent, padding: "9px 16px", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{title}</div>
      {rows.filter(([, v]) => v).map(([l, v]) => (
        <div key={l} style={{ display: "flex", borderBottom: `1px solid ${G.ivoryDark}`, padding: "9px 16px", background: "#fff" }}>
          <span style={{ fontSize: 12, color: G.muted, width: 155, flexShrink: 0 }}>{l}</span>
          <span style={{ fontSize: 13, color: G.text, fontWeight: 600 }}>{v}</span>
        </div>
      ))}
    </div>
  );
  return (
    <div>
      <div style={{ fontSize: 13, color: G.muted, marginBottom: 16 }}>Please review carefully before final submission.</div>
      <Section title="Personal Information" rows={[["Full Name",`${form.firstName} ${form.lastName}`],["Father's Name",form.fatherName],["CNIC",form.cnic],["Email",form.email],["Phone",form.phone],["DOB",form.dob],["Gender",form.gender],["Province",form.province],["Address",form.address]]} />
      <Section title="Academic History" rows={[["Institution",form.institution],["Degree",form.degree],["Major",form.major],["Year",form.graduationYear],["Grade",form.grade],["GPA / %",form.gpa]]} />
      <Section title="Program Selection" rows={[["Department",form.department],["Intake",form.intakeYear],["Shift",form.shift]]} />
      <Section title="Documents Uploaded" rows={[["Transcript",form.transcript?.name],["Domicile",form.domicile?.name],["Matric Cert.",form.matricCert?.name]]} />
      <div style={{ background: "#fef9ec", border: "1px solid #e0c96a", borderRadius: 8, padding: "12px 16px", fontSize: 12, color: "#7a6200" }}>
        ⚠️ By submitting, you confirm all information is accurate. False information may result in disqualification.
      </div>
    </div>
  );
};

const SuccessScreen = ({ reference }) => {
  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(160deg, ${G.deepGreen} 0%, ${G.darkGreen} 50%, #1e4535 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Palatino Linotype', Georgia, serif", padding: 24 }}>
      <div style={{ background: G.ivory, borderRadius: 20, padding: "56px 48px", textAlign: "center", maxWidth: 460, boxShadow: "0 20px 80px rgba(0,0,0,0.25)", border: `1px solid ${G.ivoryMid}`, position: "relative" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg,${G.midGreen},${G.accent})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 36, boxShadow: `0 0 32px rgba(82,183,136,0.4)` }}>🎓</div>
        <h2 style={{ color: G.darkGreen, fontSize: 26, fontWeight: 900, margin: "0 0 12px", fontFamily: "'Palatino Linotype', Georgia, serif" }}>Application Submitted!</h2>
        <p style={{ color: G.muted, fontSize: 14, lineHeight: 1.75, margin: "0 0 32px" }}>Your admission application has been received successfully. A confirmation email will be sent within 24 hours.</p>
        <div style={{ background: "#edf7f1", border: `1px solid ${G.lightAccent}`, borderRadius: 12, padding: "20px 28px", marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: G.muted, marginBottom: 8, letterSpacing: "0.1em", textTransform: "uppercase" }}>Application Reference No.</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: G.midGreen, letterSpacing: "0.08em" }}>{reference}</div>
        </div>
      </div>
    </div>
  );
};

// ── main ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [finalRef, setFinalRef] = useState("");

  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 1. Generate unique Reference Number
      const refNumber = `NN-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      setFinalRef(refNumber);

      // 2. Files upload function
      const uploadFile = async (file, folder) => {
        if (!file) return null;
        const fileName = `${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
          .from('admissions_docs')
          .upload(`${folder}/${fileName}`, file);
        
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('admissions_docs').getPublicUrl(data.path);
        return publicUrl;
      };

      const photoUrl = await uploadFile(form.photo, 'photos');
      const transcriptUrl = await uploadFile(form.transcript, 'transcripts');
      const domicileUrl = await uploadFile(form.domicile, 'domicile');
      const matricUrl = await uploadFile(form.matricCert, 'certificates');

      // 3. Database entry
      const { error } = await supabase.from('admissions').insert([{
        application_id: refNumber,
        first_name: form.firstName,
        last_name: form.lastName,
        father_name: form.fatherName,
        cnic: form.cnic,
        email: form.email,
        phone: form.phone,
        dob: form.dob,
        gender: form.gender,
        province: form.province,
        address: form.address,
        institution: form.institution,
        degree: form.degree,
        major: form.major,
        graduation_year: form.graduationYear,
        grade: form.grade,
        gpa: form.gpa,
        department: form.department,
        intake_year: form.intakeYear,
        shift: form.shift, // Fixed: changed from 'shift' to 'form.shift'
        photo_url: photoUrl,
        transcript_url: transcriptUrl,
        domicile_url: domicileUrl,
        matric_cert_url: matricUrl
      }]);

      if (error) throw error;
      setSubmitted(true);

    } catch (err) {
      alert("Submission Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const next = async () => {
    const errs = validate(step, form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    
    if (step === STEPS.length - 1) {
      await handleSubmit();
      return;
    }
    setStep(s => s + 1);
  };

  const back = () => { setErrors({}); setStep(s => s - 1); };

  if (submitted) return <SuccessScreen reference={finalRef} />;

  const titles = ["Personal Information","Academic History","Program Selection","Document Upload","Review & Submit"];
  const subs = [
    "Fill in your accurate personal details as per your official ID.",
    "Provide details of your most recent academic qualifications.",
    "Select your preferred program and department.",
    "Upload required documents in clear scanned format.",
    "Carefully review all information before final submission.",
  ];

  return (
    <ErrorBoundary>
      <div style={{ minHeight: "100vh", background: G.ivory, fontFamily: "'Palatino Linotype', 'Book Antiqua', Georgia, serif" }}>
      <div style={{ background: `linear-gradient(160deg, ${G.deepGreen} 0%, ${G.darkGreen} 55%, #224d38 100%)`, padding: "48px 24px 64px", textAlign: "center", position: "relative" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: `linear-gradient(135deg, ${G.midGreen}, ${G.accent})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 32 }}>🎓</div>
        <h1 style={{ margin: "0 0 6px", fontSize: 36, fontWeight: 900 }}><span style={{ color: "#fff" }}>NN</span><span style={{ color: G.lightAccent }}>-University</span></h1>
        
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", maxWidth: 640, margin: "44px auto 0" }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "initial" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", border: `2px solid ${G.accent}`, background: i <= step ? G.accent : "transparent", color: i <= step ? G.darkGreen : G.accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>{i < step ? "✓" : i + 1}</div>
              </div>
              {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: i < step ? G.accent : "rgba(82,183,136,0.2)" }} />}
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: "-32px auto 52px", padding: "0 16px" }}>
        <div style={{ background: "#fff", borderRadius: 18, boxShadow: "0 12px 60px rgba(0,0,0,0.1)", overflow: "hidden" }}>
          <div style={{ padding: "28px 32px", borderBottom: `1px solid ${G.ivoryDark}` }}>
            <h2 style={{ fontSize: 22, color: G.darkGreen }}>{titles[step]}</h2>
            <p style={{ fontSize: 13, color: G.muted }}>{subs[step]}</p>
          </div>
          <div style={{ padding: "28px 32px", maxHeight: "50vh", overflowY: "auto" }}>
            {step === 0 && <Step1 form={form} onChange={onChange} setForm={setForm} errors={errors} />}
            {step === 1 && <Step2 form={form} onChange={onChange} errors={errors} />}
            {step === 2 && <Step3 form={form} onChange={onChange} errors={errors} />}
            {step === 3 && <Step4 form={form} setForm={setForm} errors={errors} />}
            {step === 4 && <Step5 form={form} />}
          </div>
          <div style={{ padding: "20px 32px", borderTop: `1px solid ${G.ivoryDark}`, display: "flex", justifyContent: "space-between", background: G.ivory }}>
            <button onClick={back} disabled={step === 0 || loading} style={{ padding: "10px 20px", borderRadius: 8, cursor: "pointer", opacity: step === 0 ? 0 : 1 }}>Back</button>
            <button onClick={next} disabled={loading} style={{ padding: "11px 30px", borderRadius: 8, background: G.darkGreen, color: "#fff", cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Submitting..." : (step === 4 ? "Submit Application" : "Continue")}
            </button>
          </div>
        </div>
      </div>
      </div>
    </ErrorBoundary>
  );
}