// =======================
// SUPABASE INIT
// =======================
const sb = supabase.createClient(
"https://nyywcxcahalxazienuav.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55eXdjeGNhaGFseGFseGF6aWVudWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNjMwNzcsImV4cCI6MjA5MTYzOTA3N30._98bpQLnWA6fBiEgbWYPH8RGaWFRj8zIfMGgZe_KopM"
);

let user = null;

// =======================
// DEBUG START
// =======================
console.log("🚀 App loaded");

// =======================
// LOGIN
// =======================
async function login() {
const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

console.log("LOGIN TRY", email);

const { data, error } = await sb.auth.signInWithPassword({
email,
password
});

console.log("LOGIN RESULT", data, error);

if (error) {
alert("Login error: " + error.message);
return;
}

if (!data?.user) {
alert("User null");
return;
}

user = data.user;
enter();
}

// =======================
// SIGNUP
// =======================
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

alert("Compte créé → regarde email Supabase si confirmation activée");
}

// =======================
// ENTER APP
// =======================
function enter() {
document.getElementById("auth").style.display = "none";
document.getElementById("app").style.display = "block";

console.log("✅ USER CONNECTED:", user);

loadTx();
}

// =======================
// ADD TX
// =======================
async function addTx() {
if (!user) {
alert("Pas connecté");
return;
}

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
alert("DB error: " + error.message);
return;
}

loadTx();
}

// =======================
// LOAD TX
// =======================
async function loadTx() {
if (!user) return;

const list = document.getElementById("list");
list.innerHTML = "";

const { data, error } = await sb
.from("transactions")
.select("*")
.eq("user_id", user.id)
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

// =======================
// PDF HANDLER
// =======================
async function handleFile(input){
const file = input.files[0];
if(!file) return;

if(file.name.endsWith(".pdf")){
await parsePDF(file);
} else {
alert("CSV pas encore activé");
}
}

// =======================
// PDF PARSER
// =======================
async function parsePDF(file){

pdfjsLib.GlobalWorkerOptions.workerSrc =
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const buffer = await file.arrayBuffer();
const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

let text = "";

for(let i=1;i<=pdf.numPages;i++){
const page = await pdf.getPage(i);
const content = await page.getTextContent();
text += content.items.map(i => i.str).join(" ") + "\n";
}

console.log("PDF TEXT:", text.slice(0,1000));

alert("PDF chargé ✔ (Claude option à brancher)");
}