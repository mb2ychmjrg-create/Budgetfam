const sb = supabase.createClient(
"https://nyywcxcahalxazienuav.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55eXdjeGNhaGFseGF6aWVudWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNjMwNzcsImV4cCI6MjA5MTYzOTA3N30._98bpQLnWA6fBiEgbWYPH8RGaWFRj8zIfMGgZe_KopM"
);

let user = null;

/* ================= LOGIN ================= */

async function login() {
const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

document.getElementById("authMsg").innerText = "Connexion...";

const { data, error } = await sb.auth.signInWithPassword({
email,
password
});

if (error) {
document.getElementById("authMsg").innerHTML = "<span class='error'>" + error.message + "</span>";
return;
}

user = data.user;
enter();

document.getElementById("authMsg").innerHTML = "<span class='success'>Connecté ✔</span>";
}

/* ================= SIGNUP ================= */

async function signup() {
const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

const { error } = await sb.auth.signUp({ email, password });

if (error) {
document.getElementById("authMsg").innerHTML = "<span class='error'>" + error.message + "</span>";
return;
}

document.getElementById("authMsg").innerHTML =
"<span class='success'>Compte créé ✔ Connecte-toi</span>";
}

/* ================= ENTER APP ================= */

function enter() {
document.getElementById("auth").style.display = "none";
document.getElementById("app").style.display = "block";
loadTx();
}

/* ================= TRANSACTIONS ================= */

async function addTx() {
const label = document.getElementById("label").value;
const amount = document.getElementById("amount").value;
const cat = document.getElementById("cat").value;

await sb.from("transactions").insert({
user_id: user.id,
label,
amount: +amount,
category: cat
});

loadTx();
}

async function loadTx() {
const list = document.getElementById("list");
list.innerHTML = "";

const { data, error } = await sb
.from("transactions")
.select("*")
.eq("user_id", user.id)
.order("id", { ascending: false });

if (error) {
list.innerHTML = "<span class='error'>Erreur chargement</span>";
return;
}

data.forEach(tx => {
const div = document.createElement("div");
div.className = "tx";
div.innerHTML = `
<b>${tx.label}</b><br>
${tx.amount} ₪ - ${tx.category}
`;
list.appendChild(div);
});
}

/* ================= PDF ================= */

async function handleFile(input) {
const file = input.files[0];
if (!file) return;

document.getElementById("pdfStatus").innerText = "Lecture du PDF...";

pdfjsLib.GlobalWorkerOptions.workerSrc =
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const buffer = await file.arrayBuffer();
const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

let text = "";

for (let i = 1; i <= pdf.numPages; i++) {
const page = await pdf.getPage(i);
const content = await page.getTextContent();
text += content.items.map(i => i.str).join(" ") + "\n";
}

document.getElementById("pdfStatus").innerText = "PDF lu ✔ Analyse IA...";

const result = await askClaude(text.slice(0, 6000));

document.getElementById("pdfStatus").innerText = "Analyse terminée ✔";

document.getElementById("pdfResult").innerText =
typeof result === "string" ? result : JSON.stringify(result, null, 2);
}

/* ================= CLAUDE ================= */

async function askClaude(text) {
try {
const r = await fetch("https://api.anthropic.com/v1/messages", {
method: "POST",
headers: {
"Content-Type": "application/json",
"x-api-key": "YOUR_CLAUDE_KEY",
"anthropic-version": "2023-06-01"
},
body: JSON.stringify({
model: "claude-sonnet-4-20250514",
max_tokens: 1500,
messages: [{
role: "user",
content: `
Analyse ce relevé bancaire.

Retourne JSON:
[
{"date":"YYYY-MM-DD","label":"merchant","amount":-123}
]

TEXTE:
${text}
`
}]
})
});

const d = await r.json();

if (!d?.content?.[0]?.text) {
console.log("Erreur Claude:", d);
return "Erreur analyse IA";
}

return d.content[0].text;

} catch (e) {
console.log("Erreur API:", e);
return "Erreur API Claude";
}
}