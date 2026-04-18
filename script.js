// =======================
// CONFIG SUPABASE
// =======================
const SUPABASE_URL = "https://nyywcxcahalxazienuav.supabase.co";
const SUPABASE_ANON_KEY = "COLLE_ICI_TA_ANON_KEY_SUPABASE";

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =======================
// DEBUG TOOL
// =======================
function log(msg){
document.getElementById("debug").innerText += "\n" + msg;
console.log(msg);
}

// =======================
// STATE
// =======================
let user = null;

// =======================
// LOGIN
// =======================
async function login(){
log("Login attempt...");

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

const { data, error } = await sb.auth.signInWithPassword({
email,
password
});

if(error){
log("LOGIN ERROR: " + error.message);
alert(error.message);
return;
}

user = data.user;
log("LOGIN OK: " + user.email);
enter();
}

// =======================
// SIGNUP
// =======================
async function signup(){
log("Signup attempt...");

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

const { error } = await sb.auth.signUp({
email,
password
});

if(error){
log("SIGNUP ERROR: " + error.message);
alert(error.message);
return;
}

alert("Compte créé → connecte-toi");
log("SIGNUP OK");
}

// =======================
// ENTER APP
// =======================
function enter(){
document.getElementById("auth").style.display = "none";
document.getElementById("app").style.display = "block";
loadTx();
}

// =======================
// ADD TX
// =======================
async function addTx(){
log("Adding transaction...");

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
log("DB ERROR: " + error.message);
alert(error.message);
return;
}

log("Transaction added");
loadTx();
}

// =======================
// LOAD TX
// =======================
async function loadTx(){
log("Loading transactions...");

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

log("PDF uploaded: " + file.name);

if(file.name.endsWith(".pdf")){
await parsePDF(file);
}else{
alert("CSV non activé encore");
}
}

async function parsePDF(file){

pdfjsLib.GlobalWorkerOptions.workerSrc =
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const buffer = await file.arrayBuffer();
const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

let text = "";

for(let i=1;i<=pdf.numPages;i++){
const page = await pdf.getPage(i);
const content = await page.getTextContent();
text += content.items.map(x=>x.str).join(" ") + "\n";
}

log("PDF parsed, sending AI...");

// ⚠️ Claude API (OPTIONNEL)
log("TEXT SAMPLE: " + text.slice(0,200));
alert("PDF analysé ✔ (voir debug)");
}