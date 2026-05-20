import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { 
  Users, 
  ArrowUpRight, 
  Activity, 
  Settings, 
  Download, 
  UserMinus, 
  UserPlus, 
  BookOpen, 
  ShieldCheck, 
  ArrowLeft,
  Search,
  CheckCircle,
  FileSpreadsheet,
  Edit,
  Mail,
  X
} from "lucide-react";
import { PhoneShell } from "@/components/PhoneShell";
import { ScreenHeader } from "@/components/ScreenHeader";
import { getCollection, updateDocument } from "@/lib/database";
import { sendWelcomeEmail } from "@/lib/email";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Panel — Attendify" }] }),
  component: AdminPanel,
});

function AdminPanel() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<any[]>([]);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"students" | "lecturers">("students");

  // View/Edit User states
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [selectedUserType, setSelectedUserType] = useState<"students" | "lecturers">("students");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [resendingEmail, setResendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      const s = await getCollection("students");
      const l = await getCollection("lecturers");
      const a = await getCollection("attendance");
      setStudents(s);
      setLecturers(l);
      setAttendance(a);
    }
    loadData();
  }, []);

  const openUserModal = (user: any, type: "students" | "lecturers") => {
    setSelectedUser(user);
    setSelectedUserType(type);
    setIsEditing(false);
    setEditForm({ ...user });
    setEmailStatus(null);
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.surname || !editForm.otherNames || !editForm.personalEmail || !editForm.course) {
      alert("Please fill out all required fields.");
      return;
    }
    
    const userId = selectedUser.uid || selectedUser.id;
    await updateDocument(selectedUserType, userId, editForm);
    
    // Live update state
    if (selectedUserType === "students") {
      setStudents(prev => prev.map(u => (u.uid === userId || u.id === userId) ? { ...u, ...editForm } : u));
    } else {
      setLecturers(prev => prev.map(u => (u.uid === userId || u.id === userId) ? { ...u, ...editForm } : u));
    }
    
    setSelectedUser({ ...selectedUser, ...editForm });
    setIsEditing(false);
  };

  const handleResendCredentials = async () => {
    setResendingEmail(true);
    setEmailStatus(null);
    try {
      const email = editForm.personalEmail || editForm.studentEmail;
      if (!email) {
        throw new Error("No email address found for this user.");
      }
      
      const success = await sendWelcomeEmail({
        data: {
          email: email,
          name: `${editForm.otherNames} ${editForm.surname}`,
          username: editForm.generatedUsername,
          password: editForm.generatedPassword
        }
      });
      
      if (success) {
        setEmailStatus({ type: "success", message: "Login details resent successfully!" });
      } else {
        setEmailStatus({ type: "error", message: "Failed to resend details. Check SMTP/Resend API config." });
      }
    } catch (err: any) {
      setEmailStatus({ type: "error", message: err.message || "Failed to resend login details." });
    } finally {
      setResendingEmail(false);
    }
  };

  const toggleUserStatus = async (collection: "students" | "lecturers", userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "suspended" ? "active" : "suspended";
    await updateDocument(collection, userId, { status: newStatus });
    
    // Live update state
    if (collection === "students") {
      setStudents(prev => prev.map(u => u.uid === userId ? { ...u, status: newStatus } : u));
    } else {
      setLecturers(prev => prev.map(u => u.uid === userId ? { ...u, status: newStatus } : u));
    }
  };

  const exportAttendanceCSV = () => {
    if (attendance.length === 0) return;
    
    // Build CSV contents
    const headers = ["Check-in ID", "Student Name", "Student ID", "Class Code", "Subject", "Time", "Date", "Status"];
    const rows = attendance.map(a => [
      a.id,
      a.studentName,
      a.studentId,
      a.classCode,
      a.className,
      a.time,
      a.date,
      a.status
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendify_Attendance_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredStudents = students.filter(s => 
    `${s.surname} ${s.otherNames} ${s.matricNumber} ${s.studentEmail}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLecturers = lecturers.filter(l => 
    `${l.surname} ${l.otherNames} ${l.studentEmail}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PhoneShell hideNav>
      <ScreenHeader title="Admin Dashboard" subtitle="Control Center" back="/login" showBell={false} showTheme />

      <div className="px-5 pb-10">
        {/* Quick Statistics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="glass-card rounded-3xl p-4">
            <div className="flex items-center justify-between">
              <span className="size-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center"><Users className="size-4" /></span>
              <span className="text-[9px] font-semibold text-muted-foreground uppercase">active</span>
            </div>
            <p className="text-2xl font-bold mt-3">{students.length}</p>
            <p className="text-[11px] text-muted-foreground">Total Students</p>
          </div>
          
          <div className="glass-card rounded-3xl p-4">
            <div className="flex items-center justify-between">
              <span className="size-9 rounded-xl bg-success/15 text-success flex items-center justify-center"><ShieldCheck className="size-4" /></span>
              <span className="text-[9px] font-semibold text-muted-foreground uppercase">staff</span>
            </div>
            <p className="text-2xl font-bold mt-3">{lecturers.length}</p>
            <p className="text-[11px] text-muted-foreground">Total Lecturers</p>
          </div>
        </div>

        {/* CSV Export Action Card */}
        <div className="glass-card rounded-3xl p-5 mb-6 text-left relative overflow-hidden">
          <div className="absolute -top-10 -right-10 size-32 rounded-full bg-success/10 blur-2xl pointer-events-none" />
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-success/15 text-success flex items-center justify-center shrink-0">
              <FileSpreadsheet className="size-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm">Attendance Logging Reports</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Export all university attendance logs as CSV.</p>
            </div>
            <button 
              onClick={exportAttendanceCSV}
              className="gradient-success size-10 rounded-xl flex items-center justify-center text-white shadow-glow shrink-0 hover:scale-105 transition"
            >
              <Download className="size-4" />
            </button>
          </div>
        </div>

        {/* Section Management Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Manage Directory</h3>
          <div className="flex p-0.5 rounded-xl bg-secondary border border-border">
            <button
              onClick={() => setActiveTab("students")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition ${
                activeTab === "students" ? "bg-background text-primary shadow-soft" : "text-muted-foreground"
              }`}
            >
              Students
            </button>
            <button
              onClick={() => setActiveTab("lecturers")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition ${
                activeTab === "lecturers" ? "bg-background text-primary shadow-soft" : "text-muted-foreground"
              }`}
            >
              Lecturers
            </button>
          </div>
        </div>

        {/* Search filter */}
        <div className="mb-4 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-secondary/70 border border-border">
          <Search className="size-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder={`Search ${activeTab}...`} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none flex-1 text-xs"
          />
        </div>

        {/* Users list directory */}
        <div className="glass-card rounded-3xl divide-y divide-border overflow-hidden">
          {activeTab === "students" ? (
            filteredStudents.length > 0 ? (
              filteredStudents.map(s => (
                <div 
                  key={s.matricNumber} 
                  onClick={() => openUserModal(s, "students")}
                  className="flex items-center justify-between px-4 py-3.5 hover:bg-secondary/40 cursor-pointer transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-9 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0">
                      {s.otherNames[0]}{s.surname[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{s.otherNames} {s.surname}</p>
                      <p className="text-[10px] text-muted-foreground">{s.matricNumber} · {s.course} · L{s.level}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${
                      s.status === "suspended" ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success"
                    }`}>
                      {s.status === "suspended" ? "Suspended" : "Active"}
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleUserStatus("students", s.uid || s.id, s.status);
                      }}
                      className={`size-8 rounded-lg flex items-center justify-center border transition ${
                        s.status === "suspended" 
                          ? "bg-success/10 border-success/30 text-success" 
                          : "bg-destructive/10 border-destructive/30 text-destructive"
                      }`}
                    >
                      {s.status === "suspended" ? <UserPlus className="size-3.5" /> : <UserMinus className="size-3.5" />}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-5 text-center text-xs text-muted-foreground">No students found.</p>
            )
          ) : (
            filteredLecturers.length > 0 ? (
              filteredLecturers.map(l => (
                <div 
                  key={l.uid} 
                  onClick={() => openUserModal(l, "lecturers")}
                  className="flex items-center justify-between px-4 py-3.5 hover:bg-secondary/40 cursor-pointer transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-9 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0">
                      {l.otherNames[0]}{l.surname[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">Dr. {l.otherNames} {l.surname}</p>
                      <p className="text-[10px] text-muted-foreground">{l.studentEmail} · {l.course}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${
                      l.status === "suspended" ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success"
                    }`}>
                      {l.status === "suspended" ? "Suspended" : "Active"}
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleUserStatus("lecturers", l.uid || l.id, l.status);
                      }}
                      className={`size-8 rounded-lg flex items-center justify-center border transition ${
                        l.status === "suspended" 
                          ? "bg-success/10 border-success/30 text-success" 
                          : "bg-destructive/10 border-destructive/30 text-destructive"
                      }`}
                    >
                      {l.status === "suspended" ? <UserPlus className="size-3.5" /> : <UserMinus className="size-3.5" />}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="p-5 text-center text-xs text-muted-foreground">No lecturers found.</p>
            )
          )}
        </div>
      </div>

      {/* Detailed Modal overlay */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-background/80 backdrop-blur-md">
          <div className="glass-card max-w-[420px] w-full rounded-3xl p-6 shadow-elegant relative overflow-y-auto max-h-[90vh] border border-border/80 animate-scale-up">
            
            <div className="flex items-center justify-between mb-4 border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="size-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                  {selectedUserType === "students" ? <Users className="size-4" /> : <ShieldCheck className="size-4" />}
                </span>
                <h3 className="text-sm font-bold text-foreground">
                  {isEditing ? "Edit Profile" : "User Details"}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="size-8 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground transition"
              >
                <X className="size-4" />
              </button>
            </div>

            {emailStatus && (
              <div className={`p-3.5 mb-4 rounded-2xl border text-xs font-medium ${
                emailStatus.type === "success" 
                  ? "bg-success/15 border-success/30 text-success" 
                  : "bg-destructive/15 border-destructive/30 text-destructive"
              }`}>
                {emailStatus.message}
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleSaveChanges} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3 text-left">
                  <div>
                    <label className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Surname *</label>
                    <input 
                      type="text"
                      required
                      value={editForm.surname || ""}
                      onChange={(e) => setEditForm({ ...editForm, surname: e.target.value })}
                      className="mt-1 w-full px-3 py-2 rounded-xl bg-secondary/80 border border-border text-xs focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Other Names *</label>
                    <input 
                      type="text"
                      required
                      value={editForm.otherNames || ""}
                      onChange={(e) => setEditForm({ ...editForm, otherNames: e.target.value })}
                      className="mt-1 w-full px-3 py-2 rounded-xl bg-secondary/80 border border-border text-xs focus:border-primary outline-none"
                    />
                  </div>
                </div>

                {selectedUserType === "students" && (
                  <div className="text-left">
                    <label className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Matric Number *</label>
                    <input 
                      type="text"
                      required
                      value={editForm.matricNumber || ""}
                      onChange={(e) => setEditForm({ ...editForm, matricNumber: e.target.value })}
                      className="mt-1 w-full px-3 py-2 rounded-xl bg-secondary/80 border border-border text-xs focus:border-primary outline-none"
                    />
                  </div>
                )}

                <div className="text-left">
                  <label className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Personal Email *</label>
                  <input 
                    type="email"
                    required
                    value={editForm.personalEmail || editForm.studentEmail || ""}
                    onChange={(e) => setEditForm({ ...editForm, personalEmail: e.target.value, studentEmail: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-secondary/80 border border-border text-xs focus:border-primary outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 text-left">
                  <div>
                    <label className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Gender</label>
                    <select
                      value={editForm.gender || "Male"}
                      onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                      className="mt-1.5 w-full px-3 py-2 rounded-xl bg-secondary/80 border border-border text-xs focus:border-primary outline-none text-foreground"
                    >
                      <option value="Male" className="bg-background">Male</option>
                      <option value="Female" className="bg-background">Female</option>
                      <option value="Prefer not to say" className="bg-background">Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Mobile</label>
                    <input 
                      type="text"
                      value={editForm.mobile || ""}
                      onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                      className="mt-1 w-full px-3 py-2 rounded-xl bg-secondary/80 border border-border text-xs focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-left">
                  <div>
                    <label className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Course *</label>
                    <input 
                      type="text"
                      required
                      value={editForm.course || ""}
                      onChange={(e) => setEditForm({ ...editForm, course: e.target.value })}
                      className="mt-1 w-full px-3 py-2 rounded-xl bg-secondary/80 border border-border text-xs focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Level</label>
                    {selectedUserType === "students" ? (
                      <select
                        value={editForm.level || "300"}
                        onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}
                        className="mt-1.5 w-full px-3 py-2 rounded-xl bg-secondary/80 border border-border text-xs focus:border-primary outline-none text-foreground"
                      >
                        <option value="100" className="bg-background">100 Level</option>
                        <option value="200" className="bg-background">200 Level</option>
                        <option value="300" className="bg-background">300 Level</option>
                        <option value="400" className="bg-background">400 Level</option>
                        <option value="500" className="bg-background">500 Level</option>
                      </select>
                    ) : (
                      <input 
                        type="text"
                        value={editForm.level || ""}
                        onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}
                        className="mt-1 w-full px-3 py-2 rounded-xl bg-secondary/80 border border-border text-xs focus:border-primary outline-none"
                      />
                    )}
                  </div>
                </div>

                <div className="text-left">
                  <label className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Institution</label>
                  <input 
                    type="text"
                    value={editForm.institution || ""}
                    onChange={(e) => setEditForm({ ...editForm, institution: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-secondary/80 border border-border text-xs focus:border-primary outline-none"
                  />
                </div>

                <div className="pt-3 flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 glass py-2.5 rounded-xl text-xs font-semibold hover:bg-secondary transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 gradient-primary text-white py-2.5 rounded-xl text-xs font-semibold shadow-glow hover:opacity-95 transition"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {/* Details layout */}
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="col-span-2 p-3 rounded-2xl bg-secondary/40 border border-border/55">
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Account Status</span>
                    <p className="mt-1 flex items-center gap-1.5 text-xs font-medium">
                      <span className={`size-2 rounded-full ${selectedUser.status === "suspended" ? "bg-destructive animate-pulse" : "bg-success"}`} />
                      {selectedUser.status === "suspended" ? "Suspended (Blocked)" : "Active & Verified"}
                    </p>
                  </div>

                  <div>
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Full Name</span>
                    <p className="text-xs font-semibold text-foreground mt-0.5">{selectedUser.otherNames} {selectedUser.surname}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Role</span>
                    <p className="text-xs font-semibold text-foreground mt-0.5 capitalize">{selectedUserType === "students" ? "Student" : "Lecturer"}</p>
                  </div>

                  {selectedUserType === "students" && (
                    <div>
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Matric Number</span>
                      <p className="text-xs font-semibold text-foreground mt-0.5">{selectedUser.matricNumber || "N/A"}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Gender</span>
                    <p className="text-xs font-semibold text-foreground mt-0.5">{selectedUser.gender || "N/A"}</p>
                  </div>

                  <div className="col-span-2">
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Email Address</span>
                    <p className="text-xs font-semibold text-foreground mt-0.5 break-all">{selectedUser.personalEmail || selectedUser.studentEmail || "N/A"}</p>
                  </div>

                  <div>
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Course</span>
                    <p className="text-xs font-semibold text-foreground mt-0.5 truncate">{selectedUser.course || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{selectedUserType === "students" ? "Level" : "Rank/Level"}</span>
                    <p className="text-xs font-semibold text-foreground mt-0.5">{selectedUser.level || "N/A"}</p>
                  </div>

                  <div>
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Phone Number</span>
                    <p className="text-xs font-semibold text-foreground mt-0.5">{selectedUser.mobile || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Institution</span>
                    <p className="text-xs font-semibold text-foreground mt-0.5">{selectedUser.institution || "N/A"}</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-secondary/40 border border-border/55 text-left space-y-2">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Current Credentials</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[8px] text-muted-foreground">Username:</span>
                      <p className="font-mono font-bold text-primary">{selectedUser.generatedUsername}</p>
                    </div>
                    <div>
                      <span className="text-[8px] text-muted-foreground">Password:</span>
                      <p className="font-mono font-bold text-primary">{selectedUser.generatedPassword || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2.5">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="flex-1 glass py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-secondary transition border border-border/80"
                    >
                      <Edit className="size-3.5" />
                      Edit Profile
                    </button>
                    <button 
                      onClick={handleResendCredentials}
                      disabled={resendingEmail}
                      className="flex-1 gradient-primary text-white py-2.5 rounded-xl text-xs font-semibold shadow-glow flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <Mail className="size-3.5" />
                      {resendingEmail ? "Sending..." : "Resend Credentials"}
                    </button>
                  </div>
                  <button 
                    onClick={() => setSelectedUser(null)}
                    className="w-full glass py-2.5 rounded-xl text-xs font-semibold hover:bg-secondary/60 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </PhoneShell>
  );
}
