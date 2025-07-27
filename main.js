import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBf5K3WcnK7ETfnpwt_OjR14PrTElzg82c",
  authDomain: "habit-tracker-76114.firebaseapp.com",
  projectId: "habit-tracker-76114",
  storageBucket: "habit-tracker-76114.appspot.com",
  messagingSenderId: "1048914443296",
  appId: "1:1048914443296:web:8c8fa02e9ebafd9d069045"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let localMode = false;
let currentUser = null;
let habits = [];

function renderHabits() {
  const container = document.getElementById("habits");
  container.innerHTML = "";
  habits.forEach((habit, index) => {
    const div = document.createElement("div");
    div.className = "habit";

    const label = document.createElement("label");
    label.textContent = habit.title;
    if (habit.doneToday) label.classList.add("checked");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = habit.doneToday;
    checkbox.onchange = () => {
      habit.doneToday = checkbox.checked;
      saveHabits();
      renderHabits();
    };

    div.append(label, checkbox);
    container.appendChild(div);
  });

  updateScore();
}

function updateScore() {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  let weekly = 0, monthly = 0;
  habits.forEach(habit => {
    habit.history?.forEach(dateStr => {
      const date = new Date(dateStr);
      if (date >= weekStart) weekly++;
      if (date >= monthStart) monthly++;
    });
  });

  document.getElementById("weekly-score").textContent = weekly;
  document.getElementById("monthly-score").textContent = monthly;
}

async function saveHabits() {
  if (localMode || !currentUser) {
    localStorage.setItem("habits", JSON.stringify(habits));
  } else {
    await setDoc(doc(db, "users", currentUser.uid), { habits });
  }
}

async function loadHabits() {
  if (localMode || !currentUser) {
    const local = localStorage.getItem("habits");
    habits = local ? JSON.parse(local) : [];
  } else {
    const snap = await getDoc(doc(db, "users", currentUser.uid));
    habits = snap.exists() ? snap.data().habits : [];
  }
  renderHabits();
}

document.getElementById("toggle-dark").onclick = () =>
  document.body.classList.toggle("dark");

window.addHabit = function () {
  const input = document.getElementById("habit-input");
  if (!input.value.trim()) return;
  habits.push({ title: input.value.trim(), doneToday: false, history: [] });
  input.value = "";
  saveHabits();
  renderHabits();
};

window.togglePrivacy = function () {
  localMode = !localMode;
  loadHabits();
  alert(`Privacy mode ${localMode ? "enabled" : "disabled"}`);
};

window.exportPDF = function () {
  const win = window.open();
  win.document.write(`<h1>Your Habits</h1><ul>${habits.map(h => `<li>${h.title} - ${h.doneToday ? "✔" : "✘"}</li>`).join("")}</ul>`);
  win.print();
};

window.signup = async function () {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  await createUserWithEmailAndPassword(auth, email, pass);
};

window.login = async function () {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  await signInWithEmailAndPassword(auth, email, pass);
};

window.logout = async function () {
  await signOut(auth);
};

window.resetPassword = async function () {
  const email = document.getElementById("email").value;
  if (email) await sendPasswordResetEmail(auth, email);
  else alert("Enter your email first.");
};

onAuthStateChanged(auth, async user => {
  currentUser = user;
  document.getElementById("app-section").classList.toggle("hidden", !user);
  if (user) {
    await loadHabits();
  } else {
    habits = [];
    renderHabits();
  }
});