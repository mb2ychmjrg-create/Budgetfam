const sb = supabase.createClient(
"https://nyywcxcahalxazienuav.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55eXdjeGNhaGFseGF6aWVudWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNjMwNzcsImV4cCI6MjA5MTYzOTA3N30._98bpQLnWA6fBiEgbWYPH8RGaWFRj8zIfMGgZe_KopM"
);

let user = null;

function log(msg){
document.getElementById("debug").innerText += "\n" + msg;
}

// LOGIN
async function login(){
log("login...");

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

const { data, error } = await sb.auth.signInWithPassword({
email,
password
});

if(error){
log("ERROR LOGIN: " + error.message);
alert(error.message);
return;
}

user = data.user;
log("connected: " + user.email);
enter();
}

// SIGNUP
async function signup(){
const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

const { error } = await sb.auth.signUp({
email,
password
});

if(error){
log("ERROR SIGNUP: " + error.message);
alert(error.message);
return;
}

alert("Compte créé → login maintenant");
}

// ENTER APP
function enter(){
document.getElementById("auth").style.display="none";
document.getElementById("app").style.display="block";
loadTx();
}

// ADD TX
async function addTx(){
if(!user) return log("no user");

const label = document.getElementById("label").value;
const amount = document.getElementById("amount").value;
const cat = document.getElementById("cat").value;

const { error } = await sb.from("transactions").insert({
user_id: user.id,
label,
amount: +amount,
category: cat
});

if(error){
log("INSERT ERROR: " + error.message);
return;
}

log("transaction added");
loadTx();
}

// LOAD TX
async function loadTx(){

if(!user) return;

const list = document.getElementById("list");
list.innerHTML = "";

const { data, error } = await sb
.from("transactions")
.select("*")
.eq("user_id", user.id)
.order("id", { ascending:false });

if(error){
log("LOAD ERROR: " + error.message);
return;
}

data.forEach(tx=>{
const div = document.createElement("div");
div.className="tx";
div.innerHTML = `
<b>${tx.label}</b><br>
${tx.amount} ₪ - ${tx.category}
`;
list.appendChild(div);
});
}

// PDF UPLOAD
async function handleFile(input){
const file = input.files[0];
if(!file) return;

log("file loaded: " + file.name);

if(file.name.endsWith(".pdf")){
await parsePDF(file);
} else {
log("CSV not implemented yet");
}
}

async function parsePDF(file){

pdfjsLib.GlobalWorkerOptions.workerSrc =
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const buffer = await file.arrayBuffer();
const pdf = await pdfjsLib.getDocument({data:buffer}).promise;

let text = "";

for(let i=1;i<=pdf.numPages;i++){
const page = await pdf.getPage(i);
const content = await page.getTextContent();
text += content.items.map(x=>x.str).join(" ") + "\n";
}

log("PDF text extracted");

log(text.slice(0,300));

alert("PDF chargé ✔ (debug visible en bas)");
}