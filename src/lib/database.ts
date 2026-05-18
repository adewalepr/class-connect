// Firestore wrapper and Offline Local Storage mock database
import { 
  db, 
  isLiveFirebase 
} from "./firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy
} from "firebase/firestore";

// Local Storage initial mock database seeding
const SEED_DATA: Record<string, any[]> = {
  students: [
    {
      uid: "student-alex",
      generatedUsername: "ATTD-2031",
      generatedPassword: "password",
      matricNumber: "S2031",
      surname: "Carter",
      otherNames: "Alex",
      gender: "Male",
      mobile: "+1 (555) 019-2834",
      personalEmail: "alex.carter@gmail.com",
      studentEmail: "alex@university.edu",
      institution: "State University",
      course: "Computer Science",
      level: "300",
      role: "student",
      createdAt: new Date().toISOString()
    },
    {
      uid: "student-maya",
      generatedUsername: "ATTD-2044",
      generatedPassword: "password",
      matricNumber: "S2044",
      surname: "Reed",
      otherNames: "Maya",
      gender: "Female",
      mobile: "+1 (555) 019-5432",
      personalEmail: "maya.reed@gmail.com",
      studentEmail: "maya@university.edu",
      institution: "State University",
      course: "Software Engineering",
      level: "300",
      role: "student",
      createdAt: new Date().toISOString()
    },
    {
      uid: "student-tom",
      generatedUsername: "ATTD-2018",
      generatedPassword: "password",
      matricNumber: "S2018",
      surname: "Liu",
      otherNames: "Tom",
      gender: "Male",
      mobile: "+1 (555) 019-9812",
      personalEmail: "tom.liu@gmail.com",
      studentEmail: "tom@university.edu",
      institution: "State University",
      course: "Data Science",
      level: "300",
      role: "student",
      createdAt: new Date().toISOString()
    }
  ],
  lecturers: [
    {
      uid: "lecturer-mei",
      generatedUsername: "ATTD-L01",
      generatedPassword: "password",
      surname: "Lin",
      otherNames: "Mei",
      gender: "Female",
      mobile: "+1 (555) 019-3311",
      personalEmail: "mei.lin@gmail.com",
      studentEmail: "mei.lin@university.edu",
      institution: "State University",
      course: "Algorithms & Systems",
      level: "Professor",
      role: "lecturer",
      createdAt: new Date().toISOString()
    }
  ],
  attendance: [
    {
      id: "att-1",
      studentId: "S2031",
      studentName: "Alex Carter",
      classCode: "CS301",
      className: "CS301 · Algorithms",
      time: "10:01",
      date: new Date().toISOString().split("T")[0],
      status: "present"
    },
    {
      id: "att-2",
      studentId: "S2044",
      studentName: "Maya Reed",
      classCode: "CS301",
      className: "CS301 · Algorithms",
      time: "10:01",
      date: new Date().toISOString().split("T")[0],
      status: "present"
    },
    {
      id: "att-3",
      studentId: "S2018",
      studentName: "Tom Liu",
      classCode: "CS301",
      className: "CS301 · Algorithms",
      time: "10:03",
      date: new Date().toISOString().split("T")[0],
      status: "late"
    }
  ],
  classes: [
    {
      id: "class-1",
      code: "CS301",
      name: "Algorithms & Complexities",
      lecturerId: "lecturer-mei",
      lecturerName: "Dr. Mei Lin",
      qrCode: "CS301-ALGO-SESSION",
      expiresAt: new Date(Date.now() + 300000).toISOString(), // 5 mins from now
      status: "active",
      createdAt: new Date().toISOString()
    },
    {
      id: "class-2",
      code: "SE302",
      name: "Software Systems Design",
      lecturerId: "lecturer-mei",
      lecturerName: "Dr. Mei Lin",
      qrCode: "SE302-DESIGN",
      expiresAt: new Date(Date.now() - 3600000).toISOString(),
      status: "ended",
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ],
  notifications: [
    {
      id: "notif-1",
      title: "Algorithms Session Active",
      message: "Dr. Mei Lin has activated the QR code for CS301 Algorithms.",
      time: "Just now",
      read: false,
      createdAt: new Date().toISOString()
    },
    {
      id: "notif-2",
      title: "Attendance Milestone",
      message: "Great job! Your current class attendance rate has reached 86%.",
      time: "2 hours ago",
      read: true,
      createdAt: new Date(Date.now() - 7200000).toISOString()
    }
  ],
  analytics: [
    {
      id: "stats",
      averageRate: 86,
      totalClasses: 28,
      presentClasses: 24,
      lateClasses: 2,
      absentClasses: 2
    }
  ]
};

// Local storage helpers
function getLocalDB(): Record<string, any[]> {
  if (typeof window === "undefined") return SEED_DATA;
  const dbStr = window.localStorage.getItem("attendify_db");
  if (!dbStr) {
    window.localStorage.setItem("attendify_db", JSON.stringify(SEED_DATA));
    return SEED_DATA;
  }
  try {
    return JSON.parse(dbStr);
  } catch {
    return SEED_DATA;
  }
}

function saveLocalDB(data: Record<string, any[]>) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("attendify_db", JSON.stringify(data));
    // Trigger custom event for reactivity
    window.dispatchEvent(new Event("attendify_db_update"));
  }
}

// ----------------------------------------------------
// DATABASE API INTERFACES
// ----------------------------------------------------

export async function getCollection(name: string): Promise<any[]> {
  if (isLiveFirebase && db) {
    try {
      const snap = await getDocs(collection(db, name));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error(`Firestore getCollection (${name}) error, falling back to Mock:`, e);
    }
  }
  return getLocalDB()[name] || [];
}

export async function getDocument(name: string, docId: string): Promise<any | null> {
  if (isLiveFirebase && db) {
    try {
      const snap = await getDoc(doc(db, name, docId));
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (e) {
      console.error(`Firestore getDocument (${name}/${docId}) error, falling back to Mock:`, e);
    }
  }
  const list = getLocalDB()[name] || [];
  return list.find((item: any) => item.id === docId || item.uid === docId) || null;
}

export async function setDocument(name: string, docId: string, data: any): Promise<void> {
  if (isLiveFirebase && db) {
    try {
      await setDoc(doc(db, name, docId), data, { merge: true });
      return;
    } catch (e) {
      console.error(`Firestore setDocument (${name}/${docId}) error, falling back to Mock:`, e);
    }
  }
  const dbData = getLocalDB();
  if (!dbData[name]) dbData[name] = [];
  
  const index = dbData[name].findIndex((item: any) => item.id === docId || item.uid === docId);
  const updatedDoc = { ...(index >= 0 ? dbData[name][index] : {}), ...data, id: docId };
  
  if (index >= 0) {
    dbData[name][index] = updatedDoc;
  } else {
    dbData[name].push(updatedDoc);
  }
  saveLocalDB(dbData);
}

export async function addDocument(name: string, data: any): Promise<string> {
  if (isLiveFirebase && db) {
    try {
      const ref = await addDoc(collection(db, name), data);
      return ref.id;
    } catch (e) {
      console.error(`Firestore addDocument (${name}) error, falling back to Mock:`, e);
    }
  }
  const dbData = getLocalDB();
  if (!dbData[name]) dbData[name] = [];
  
  const newId = name.slice(0, 3) + "-" + Math.floor(1000 + Math.random() * 9000);
  const newDoc = { ...data, id: newId };
  dbData[name].push(newDoc);
  saveLocalDB(dbData);
  return newId;
}

export async function updateDocument(name: string, docId: string, data: any): Promise<void> {
  if (isLiveFirebase && db) {
    try {
      await updateDoc(doc(db, name, docId), data);
      return;
    } catch (e) {
      console.error(`Firestore updateDocument (${name}/${docId}) error, falling back to Mock:`, e);
    }
  }
  const dbData = getLocalDB();
  if (!dbData[name]) return;
  
  const index = dbData[name].findIndex((item: any) => item.id === docId || item.uid === docId);
  if (index >= 0) {
    dbData[name][index] = { ...dbData[name][index], ...data };
    saveLocalDB(dbData);
  }
}

export async function deleteDocument(name: string, docId: string): Promise<void> {
  if (isLiveFirebase && db) {
    try {
      await deleteDoc(doc(db, name, docId));
      return;
    } catch (e) {
      console.error(`Firestore deleteDocument (${name}/${docId}) error, falling back to Mock:`, e);
    }
  }
  const dbData = getLocalDB();
  if (!dbData[name]) return;
  
  const index = dbData[name].findIndex((item: any) => item.id === docId || item.uid === docId);
  if (index >= 0) {
    dbData[name].splice(index, 1);
    saveLocalDB(dbData);
  }
}

// Live Reactivity Subscriptions
export function subscribeCollection(name: string, callback: (data: any[]) => void): () => void {
  if (isLiveFirebase && db) {
    try {
      return onSnapshot(collection(db, name), (snap) => {
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(data);
      }, (err) => {
        console.error(`Firestore onSnapshot subscribe collection (${name}) error:`, err);
      });
    } catch (e) {
      console.error(`Firestore subscribe error, using reactive local poll fallback:`, e);
    }
  }
  
  // Custom localStorage update event listener
  const handler = () => {
    callback(getLocalDB()[name] || []);
  };
  
  if (typeof window !== "undefined") {
    window.addEventListener("attendify_db_update", handler);
  }
  
  // Send initial data immediately
  handler();
  
  return () => {
    if (typeof window !== "undefined") {
      window.removeEventListener("attendify_db_update", handler);
    }
  };
}
