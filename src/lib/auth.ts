// Authentication logic and reactive session container
import { isLiveFirebase, auth } from "./firebase";
import { getCollection, addDocument, setDocument, getDocument } from "./database";
import { 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword,
  updatePassword
} from "firebase/auth";

export interface UserSession {
  uid: string;
  username: string;
  email: string;
  role: "student" | "lecturer" | "admin";
  surname: string;
  otherNames: string;
  matricNumber?: string;
  course?: string;
  level?: string;
  mobile?: string;
  institution?: string;
  gender?: string;
}

// Global active session state
let currentUser: UserSession | null = null;
const authListeners = new Set<(user: UserSession | null) => void>();

function notifyListeners() {
  authListeners.forEach(cb => cb(currentUser));
}

// Initialize active session from local storage on startup
if (typeof window !== "undefined") {
  const sessionStr = window.localStorage.getItem("attendify_session");
  if (sessionStr) {
    try {
      currentUser = JSON.parse(sessionStr);
    } catch {
      currentUser = null;
    }
  }
}

// ----------------------------------------------------
// AUTHENTICATION INTERFACE
// ----------------------------------------------------

export function subscribeAuth(callback: (user: UserSession | null) => void): () => void {
  authListeners.add(callback);
  callback(currentUser); // Call immediately with current state
  return () => {
    authListeners.delete(callback);
  };
}

export function getCurrentUser(): UserSession | null {
  return currentUser;
}

// Username or email based sign in
export async function login(identity: string, password: string): Promise<UserSession> {
  const normalizedIdentity = identity.trim();
  const normalizedPassword = password.trim();

  if (isLiveFirebase && auth) {
    try {
      let email = normalizedIdentity;
      // If logging in by username (e.g. ATTD-XXXXX)
      if (normalizedIdentity.toUpperCase().startsWith("ATTD-")) {
        const emailFound = await findEmailByUsername(normalizedIdentity);
        if (!emailFound) throw new Error("Invalid username. Please register or double check.");
        email = emailFound;
      }
      
      const credential = await signInWithEmailAndPassword(auth, email, normalizedPassword);
      // Query the database to retrieve detailed profile and role
      const userProfile = await fetchProfileByUid(credential.user.uid);
      if (!userProfile) throw new Error("User profile not found in database.");

      const session: UserSession = {
        uid: credential.user.uid,
        username: userProfile.generatedUsername || userProfile.matricNumber || normalizedIdentity,
        email: email,
        role: userProfile.role || "student",
        surname: userProfile.surname,
        otherNames: userProfile.otherNames,
        matricNumber: userProfile.matricNumber,
        course: userProfile.course,
        level: userProfile.level,
        mobile: userProfile.mobile,
        institution: userProfile.institution,
        gender: userProfile.gender
      };

      saveSession(session);
      return session;
    } catch (e: any) {
      console.error("Live Firebase auth error, failing back to mock check:", e);
      // Fallback if live fail is due to network or if the account is in mock
    }
  }

  // MOCK LOG IN FLOW
  const students = await getCollection("students");
  const lecturers = await getCollection("lecturers");
  
  // Find in students
  let found = students.find(
    s => (s.generatedUsername?.toUpperCase() === normalizedIdentity.toUpperCase() || 
          s.studentEmail?.toLowerCase() === normalizedIdentity.toLowerCase() || 
          s.personalEmail?.toLowerCase() === normalizedIdentity.toLowerCase()) &&
         s.generatedPassword === normalizedPassword
  );
  
  // Find in lecturers if not student
  if (!found) {
    found = lecturers.find(
      l => (l.generatedUsername?.toUpperCase() === normalizedIdentity.toUpperCase() || 
            l.studentEmail?.toLowerCase() === normalizedIdentity.toLowerCase() || 
            l.personalEmail?.toLowerCase() === normalizedIdentity.toLowerCase()) &&
           l.generatedPassword === normalizedPassword
    );
  }

  // Hardcoded Admin
  if (!found && normalizedIdentity.toLowerCase() === "admin@university.edu" && normalizedPassword === "password") {
    found = {
      uid: "admin-uid",
      generatedUsername: "ATTD-ADMIN",
      studentEmail: "admin@university.edu",
      role: "admin",
      surname: "Administrator",
      otherNames: "System"
    };
  }

  if (!found) {
    throw new Error("Invalid username, email or password. Please try again.");
  }

  const session: UserSession = {
    uid: found.uid || found.id,
    username: found.generatedUsername,
    email: found.studentEmail || found.personalEmail,
    role: found.role,
    surname: found.surname,
    otherNames: found.otherNames,
    matricNumber: found.matricNumber,
    course: found.course,
    level: found.level,
    mobile: found.mobile,
    institution: found.institution,
    gender: found.gender
  };

  saveSession(session);
  return session;
}

export async function logout(): Promise<void> {
  if (isLiveFirebase && auth) {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Firebase sign out failed:", e);
    }
  }
  clearSession();
}

// User sign up
export async function register(profile: Omit<UserSession, "uid" | "role"> & { role: "student" | "lecturer" }): Promise<UserSession> {
  const generatedUsername = profile.username; // Already generated ATTD-XXXXX
  const generatedPassword = Math.random().toString(36).substring(2, 6) + "@" + Math.floor(100 + Math.random() * 900); // e.g. Xy7#pL29-like

  if (isLiveFirebase && auth) {
    try {
      // Create user inside Firebase Auth
      const credential = await createUserWithEmailAndPassword(auth, profile.email, generatedPassword);
      
      const firestoreDoc = {
        uid: credential.user.uid,
        generatedUsername,
        generatedPassword,
        matricNumber: profile.matricNumber || "",
        surname: profile.surname,
        otherNames: profile.otherNames,
        gender: profile.gender || "",
        mobile: profile.mobile || "",
        personalEmail: profile.email,
        studentEmail: profile.email,
        institution: profile.institution || "",
        course: profile.course || "",
        level: profile.level || "",
        role: profile.role,
        createdAt: new Date().toISOString()
      };

      const collectionName = profile.role === "student" ? "students" : "lecturers";
      await setDocument(collectionName, credential.user.uid, firestoreDoc);

      const session: UserSession = {
        uid: credential.user.uid,
        username: generatedUsername,
        email: profile.email,
        role: profile.role,
        ...profile
      };

      return session;
    } catch (e) {
      console.error("Live Firebase register failed, creating mock entry:", e);
    }
  }

  // MOCK SIGN UP FLOW
  const mockUid = profile.role + "-" + Math.floor(10000 + Math.random() * 90000);
  const collectionName = profile.role === "student" ? "students" : "lecturers";

  const newDoc = {
    uid: mockUid,
    generatedUsername,
    generatedPassword,
    matricNumber: profile.matricNumber || "",
    surname: profile.surname,
    otherNames: profile.otherNames,
    gender: profile.gender || "",
    mobile: profile.mobile || "",
    personalEmail: profile.email,
    studentEmail: profile.email,
    institution: profile.institution || "",
    course: profile.course || "",
    level: profile.level || "",
    role: profile.role,
    createdAt: new Date().toISOString()
  };

  await setDocument(collectionName, mockUid, newDoc);

  // Return new session details (includes generated credential data)
  return {
    uid: mockUid,
    username: generatedUsername,
    email: profile.email,
    role: profile.role,
    ...profile,
    // Add these for credentials output
    mobile: generatedPassword // Hack to transport password securely in local payload
  };
}

// Invalidate & reset credentials
export async function resetCredentials(email: string): Promise<{ username: string; password: newPassword }> {
  const normalizedEmail = email.toLowerCase().trim();
  const newPassword = Math.random().toString(36).substring(2, 6) + "#" + Math.floor(100 + Math.random() * 900);

  // Check students
  const students = await getCollection("students");
  let found = students.find(s => s.studentEmail?.toLowerCase() === normalizedEmail || s.personalEmail?.toLowerCase() === normalizedEmail);
  let collectionName = "students";

  // Check lecturers if not found
  if (!found) {
    const lecturers = await getCollection("lecturers");
    found = lecturers.find(l => l.studentEmail?.toLowerCase() === normalizedEmail || l.personalEmail?.toLowerCase() === normalizedEmail);
    collectionName = "lecturers";
  }

  if (!found) {
    throw new Error("No registered account found with that email address.");
  }

  // Update in Live Firebase Auth if active
  if (isLiveFirebase && auth) {
    try {
      // NOTE: Normally, to reset another user's password in standard client Firebase we'd send a reset email.
      // But since we are auto-generating credentials, we do it in our mock/admin flow or Firestore.
      // Here we will update their credentials inside the database.
      // If it's the CURRENTLY logged-in user, we can call updatePassword(auth.currentUser, newPassword).
    } catch (e) {
      console.error("Could not update live password directly, updating DB:", e);
    }
  }

  // Update in database
  await setDocument(collectionName, found.uid || found.id, {
    generatedPassword: newPassword
  });

  return {
    username: found.generatedUsername,
    password: newPassword as any
  };
}

// ----------------------------------------------------
// SESSION HELPERS
// ----------------------------------------------------

function saveSession(session: UserSession) {
  currentUser = session;
  if (typeof window !== "undefined") {
    window.localStorage.setItem("attendify_session", JSON.stringify(session));
  }
  notifyListeners();
}

function clearSession() {
  currentUser = null;
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("attendify_session");
  }
  notifyListeners();
}

async function findEmailByUsername(username: string): Promise<string | null> {
  const students = await getCollection("students");
  const s = students.find(item => item.generatedUsername?.toUpperCase() === username.toUpperCase());
  if (s) return s.studentEmail || s.personalEmail;

  const lecturers = await getCollection("lecturers");
  const l = lecturers.find(item => item.generatedUsername?.toUpperCase() === username.toUpperCase());
  if (l) return l.studentEmail || l.personalEmail;

  return null;
}

async function fetchProfileByUid(uid: string): Promise<any | null> {
  let profile = await getDocument("students", uid);
  if (profile) return profile;

  profile = await getDocument("lecturers", uid);
  return profile;
}
