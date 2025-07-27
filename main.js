firebase.initializeApp(firebaseConfig); const db = firebase.firestore(); const auth = firebase.auth();

const logoutBtn = document.getElementById("logout-btn"); logoutBtn.onclick = () => auth.signOut().then(() => location.href = "login.html");

document.getElementById("toggle-dark").onclick = () => { document.body.classList.toggle("dark-mode"); localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light"); };

window.onload = () => { if (localStorage.getItem("theme") === "dark") { document.body.classList.add("dark-mode"); }

auth.onAuthStateChanged(user => { if (!user) return location.href = "login.html"; loadTasks(user.uid); document.getElementById("add-task").onclick = () => addTask(user.uid); }); };

function addTask(uid) { const title = document.getElementById("task-input").value; if (!title.trim()) return; db.collection("users").doc(uid).collection("habits").add({ title, date: new Date().toISOString().split('T')[0], done: false }); document.getElementById("task-input").value = ""; loadTasks(uid); }

function loadTasks(uid) { db.collection("users").doc(uid).collection("habits").orderBy("date", "desc").get().then(snapshot => { const taskList = document.getElementById("task-list"); taskList.innerHTML = ""; snapshot.forEach(doc => { const data = doc.data(); const div = document.createElement("div"); div.className = "task-item"; div.innerHTML = <span>${data.title}</span><input type='checkbox' ${data.done ? 'checked' : ''} />; div.querySelector('input').onchange = e => { db.collection("users").doc(uid).collection("habits").doc(doc.id).update({ done: e.target.checked }); }; taskList.appendChild(div); }); }); }
