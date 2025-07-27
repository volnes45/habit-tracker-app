// Firestore and Auth
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("mainSection").style.display = "block";
    loadHabits(user.uid);
  } else {
    document.getElementById("loginSection").style.display = "block";
    document.getElementById("mainSection").style.display = "none";
  }
});

const db = firebase.firestore();

// Login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = e.target.email.value;
  const password = e.target.password.value;
  try {
    await firebase.auth().signInWithEmailAndPassword(email, password);
  } catch (err) {
    alert("Login error: " + err.message);
  }
});

// Signup
document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = e.target.email.value;
  const password = e.target.password.value;
  try {
    await firebase.auth().createUserWithEmailAndPassword(email, password);
  } catch (err) {
    alert("Signup error: " + err.message);
  }
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  firebase.auth().signOut();
});

// Add Habit
document.getElementById("addHabitBtn").addEventListener("click", async () => {
  const habitInput = document.getElementById("habitInput");
  const title = habitInput.value.trim();
  const user = firebase.auth().currentUser;

  if (!title || !user) return alert("Enter habit or login first.");

  await db.collection("users").doc(user.uid).collection("habits").add({
    title,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    completed: {} // { '2025-07-25': true }
  });

  habitInput.value = "";
  loadHabits(user.uid);
});

// Load Habits
async function loadHabits(uid) {
  const list = document.getElementById("habitList");
  list.innerHTML = "";

  const today = new Date().toISOString().split("T")[0];
  const habitsSnap = await db.collection("users").doc(uid).collection("habits").get();

  habitsSnap.forEach((doc) => {
    const data = doc.data();
    const li = document.createElement("li");
    li.className = "habit-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = data.completed?.[today] || false;
    checkbox.addEventListener("change", () => toggleHabit(uid, doc.id, today, checkbox.checked));

    const label = document.createElement("label");
    label.textContent = data.title;

    li.appendChild(checkbox);
    li.appendChild(label);
    list.appendChild(li);
  });

  // Optional: loadScores(uid); // if weekly/monthly stats needed
}

// Toggle today's habit
async function toggleHabit(uid, habitId, date, isChecked) {
  const habitRef = db.collection("users").doc(uid).collection("habits").doc(habitId);
  const update = {};
  update[`completed.${date}`] = isChecked;

  await habitRef.update(update);
}
