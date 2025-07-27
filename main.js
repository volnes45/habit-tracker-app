// Firebase Auth and Firestore
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    loadHabits();
  } else {
    window.location.href = "login.html";
  }
});

const habitInput = document.getElementById("habit-input");
const addHabitBtn = document.getElementById("add-habit");
const habitList = document.getElementById("habit-list");
const weeklyScoreEl = document.getElementById("weekly-score");
const monthlyScoreEl = document.getElementById("monthly-score");

let currentUser = null;

// Add a new habit
addHabitBtn.addEventListener("click", async () => {
  const title = habitInput.value.trim();
  if (!title || !currentUser) {
    alert("Enter a habit name and make sure you're logged in.");
    return;
  }

  try {
    await db.collection("users").doc(currentUser.uid).collection("habits").add({
      title: title,         // <- the field must be "title"
      logs: {}
    });

    habitInput.value = "";
    loadHabits();
  } catch (err) {
    alert("Error adding habit: " + err.message);
    console.error(err);
  }
});

// Load all habits
async function loadHabits() {
  habitList.innerHTML = "";

  const snapshot = await db
    .collection("users")
    .doc(currentUser.uid)
    .collection("habits")
    .get();

  let allLogs = [];

  snapshot.forEach(doc => {
    const data = doc.data();
    const habitId = doc.id;

    if (data.title && data.logs) {
      renderHabit(habitId, data);
      allLogs.push(...Object.entries(data.logs));
    }
  });

  const groupedLogs = groupLogs(allLogs);
  const scores = calculateScores(groupedLogs);
  weeklyScoreEl.textContent = `${scores.weeklyScore}%`;
  monthlyScoreEl.textContent = `${scores.monthlyScore}%`;
}

// Render habit item
function renderHabit(habitId, data) {
  const habitEl = document.createElement("div");
  habitEl.classList.add("habit");

  const titleEl = document.createElement("span");
  titleEl.textContent = data.title;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";

  const today = new Date().toISOString().split("T")[0];
  checkbox.checked = data.logs && data.logs[today];

  checkbox.addEventListener("change", async () => {
    await db
      .collection("users")
      .doc(currentUser.uid)
      .collection("habits")
      .doc(habitId)
      .update({
        [`logs.${today}`]: checkbox.checked
      });

    loadHabits(); // Refresh scores
  });

  habitEl.appendChild(titleEl);
  habitEl.appendChild(checkbox);
  habitList.appendChild(habitEl);
}

// Group logs from multiple habits
function groupLogs(entries) {
  const logMap = {};
  for (const [date, value] of entries) {
    if (!logMap[date]) logMap[date] = 0;
    if (value === true) logMap[date]++;
  }
  return logMap;
}

// Calculate weekly and monthly scores
function calculateScores(logMap) {
  const now = new Date();
  let weeklyTotal = 0;
  let weeklyDone = 0;
  let monthlyTotal = 0;
  let monthlyDone = 0;

  for (const [dateStr, count] of Object.entries(logMap)) {
    const date = new Date(dateStr);
    const daysAgo = (now - date) / (1000 * 60 * 60 * 24);

    if (daysAgo <= 7) {
      weeklyTotal++;
      if (count > 0) weeklyDone++;
    }

    if (daysAgo <= 30) {
      monthlyTotal++;
      if (count > 0) monthlyDone++;
    }
  }

  return {
    weeklyScore: weeklyTotal ? Math.round((weeklyDone / weeklyTotal) * 100) : 0,
    monthlyScore: monthlyTotal ? Math.round((monthlyDone / monthlyTotal) * 100) : 0
  };
}

// Logout handler
document.getElementById("logout-btn")?.addEventListener("click", () => {
  firebase.auth().signOut().then(() => {
    window.location.href = "login.html";
  });
});