console.log("🚀 Script chargé OK");

const sb = supabase.createClient(
"https://nyywcxcahalxazienuav.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55eXdjeGNhaGFseGF6aWVudWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNjMwNzcsImV4cCI6MjA5MTYzOTA3N30._98bpQLnWA6fBiEgbWYPH8RGaWFRj8zIfMGgZe_KopM"
);

let user = null;

/* ================= LOGIN ================= */

async function login() {
console.log("➡️ login click");

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

const { data, error } = await sb.auth.signInWithPassword({
email,
password
});

if (error) {
console.log(error);
alert(error.message);
return;
}

user = data.user;
enterApp();
}

/* ================= SIGNUP ================= */

async function signup() {
const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

const { error } = await sb.auth.signUp({
email,
password
});

if (error) {
alert(error.message);
return;
}

alert("Compte créé ✔ connecte-toi maintenant");
}

/* ================= ENTER APP ================= */

function enterApp() {
document.getElementById("auth").style.display = "none";
document.getElementById("app").style.display = "block";
loadTx();
}

/* ================= ADD TX ================= */

async function addTx() {
if (!user) return alert("Pas connecté");

const label = document.getElementById("label").value;
const amount = document.getElementById("amount").value;
const cat = document.getElementById("cat").value;

const { error } = await sb.from("transactions").insert({
user_id: user.id,
label,
amount: +amount,
category: cat
});

if (error) {
console.log(error);
alert(error.message);
return;
}

loadTx();
}

/* ================= LOAD TX ================= */

async function loadTx() {
const list = document.getElementById("list");
list.innerHTML = "";

const { data, error } = await sb
.from("transactions")
.select("*")
.order("id", { ascending: false });

if (error) {
console.log(error);
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

/* ================= PDF IMPORT ================= */

async function handleFile(input) {
const file = input.files[0];
if (!file) return;

alert("📄 PDF chargé");

const buffer = await file.arrayBuffer();
const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

let text = "";

for (let i = 1; i <= pdf.numPages; i++) {
const page = await pdf.getPage(i);
const content = await page.getTextContent();
text += content.items.map(i => i.str).join(" ") + "\n";
}

console.log("📄 TEXTE PDF :", text);

window.pdfText = text;

alert("PDF analysé ✔ (regarde console)");
}