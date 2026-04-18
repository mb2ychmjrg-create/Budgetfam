const sb = supabase.createClient(
"https://nyywcxcahalxazienuav.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55eXdjeGNhaGFseGF6aWVudWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNjMwNzcsImV4cCI6MjA5MTYzOTA3N30._98bpQLnWA6fBiEgbWYPH8RGaWFRj8zIfMGgZe_KopM"
);

let user=null;

function log(t){
document.getElementById("debug").innerHTML += "<br>"+t;
}

// NAV
function go(page){
document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
document.getElementById(page).classList.add("active");
}

// AUTH
async function login(){
const email=document.getElementById("email").value;
const password=document.getElementById("password").value;

const {data,error}=await sb.auth.signInWithPassword({email,password});

if(error){log(error.message);return;}

user=data.user;
log("connected");
go("home");
loadTx();
}

async function signup(){
const email=document.getElementById("email").value;
const password=document.getElementById("password").value;

const {error}=await sb.auth.signUp({email,password});

if(error){log(error.message);return;}

alert("account created");
}

// ADD TX (REVENU / DEPENSE)
async function addTx(){

const label=document.getElementById("label").value;
const amount=document.getElementById("amount").value;
const type=document.getElementById("type").value;

let signedAmount = type === "income" ? +amount : -Math.abs(amount);

const {error}=await sb.from("transactions").insert({
user_id:user.id,
label,
amount:signedAmount,
type
});

if(error){log(error.message);return;}

loadTx();
go("home");
}

// LOAD TX + DASHBOARD CLEAN
async function loadTx(){

if(!user) return;

const list=document.getElementById("list");
list.innerHTML="";

const {data,error}=await sb
.from("transactions")
.select("*")
.eq("user_id",user.id)
.order("id",{ascending:false});

if(error){log(error.message);return;}

let income=0;
let expense=0;

data.forEach(tx=>{

if(tx.amount>=0) income+=tx.amount;
else expense+=Math.abs(tx.amount);

const div=document.createElement("div");
div.className="tx";

const badge = tx.amount>=0
? `<span class="badge income">Revenu</span>`
: `<span class="badge expense">Dépense</span>`;

div.innerHTML=`
<b>${tx.label}</b> ${badge}<br>
${tx.amount} ₪
`;

list.appendChild(div);
});

document.getElementById("summary").innerHTML=`
💚 Revenus: ${income} ₪<br>
❤️ Dépenses: ${expense} ₪<br>
💰 Balance: ${income-expense} ₪
`;
}

// PDF
async function handleFile(input){

const file=input.files[0];
if(!file) return;

log("PDF loading...");

const buffer=await file.arrayBuffer();
const pdf=await pdfjsLib.getDocument({data:buffer}).promise;

let text="";

for(let i=1;i<=pdf.numPages;i++){
const page=await pdf.getPage(i);
const content=await page.getTextContent();
text += content.items.map(x=>x.str).join(" ") + "\n";
}

log("PDF extracted");

// simple parse
const parsed=parsePDF(text);

log("parsed: "+parsed.length);

displayPDF(parsed);
}

// PARSER
function parsePDF(text){

let lines=text.split(/\n|\r/);
let res=[];

lines.forEach(l=>{

let m=l.match(/-?\d+[.,]?\d*/);
if(!m) return;

let amount=parseFloat(m[0].replace(",","."));
if(isNaN(amount)) return;

let label=l.replace(m[0],"").trim();
if(label.length<2) return;

res.push({
label,
amount: amount < 0 ? amount : -amount
});
});

return res;
}

// DISPLAY PDF
function displayPDF(data){

const list=document.getElementById("list");
list.innerHTML="";

let income=0;
let expense=0;

data.forEach(t=>{

if(t.amount>=0) income+=t.amount;
else expense+=Math.abs(t.amount);

const div=document.createElement("div");
div.className="tx";

const badge = t.amount>=0
? `<span class="badge income">Revenu</span>`
: `<span class="badge expense">Dépense</span>`;

div.innerHTML=`
<b>${t.label}</b> ${badge}<br>
${t.amount} ₪
`;

list.appendChild(div);
});

document.getElementById("summary").innerHTML=`
📄 Revenus: ${income} ₪<br>
📄 Dépenses: ${expense} ₪<br>
📊 Balance: ${income-expense} ₪
`;
}