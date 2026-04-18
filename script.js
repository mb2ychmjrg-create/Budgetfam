const sb = supabase.createClient(
"https://nyywcxcahalxazienuav.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55eXdjeGNhaGFseGF6aWVudWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNjMwNzcsImV4cCI6MjA5MTYzOTA3N30._98bpQLnWA6fBiEgbWYPH8RGaWFRj8zIfMGgZe_KopM"
);

let user=null;

function log(t){
document.getElementById("debug").innerHTML += "<br>" + t;
}

// AUTH
async function login(){
log("LOGIN...");
const email = emailInput().value;
const password = passInput().value;

const {data,error} = await sb.auth.signInWithPassword({email,password});

if(error){
log("ERROR: "+error.message);
alert(error.message);
return;
}

user = data.user;
log("OK CONNECTED");
enter();
}

async function signup(){
const email = emailInput().value;
const password = passInput().value;

const {error} = await sb.auth.signUp({email,password});

if(error){
log(error.message);
alert(error.message);
return;
}

alert("Compte créé → login");
}

// UI
function enter(){
document.getElementById("auth").classList.add("hidden");
document.getElementById("app").classList.remove("hidden");
loadTx();
}

// TX
async function addTx(){
const label = document.getElementById("label").value;
const amount = document.getElementById("amount").value;
const cat = document.getElementById("cat").value;

const {error} = await sb.from("transactions").insert({
user_id:user.id,
label,
amount:+amount,
category:cat
});

if(error){
log(error.message);
return;
}

log("TX OK");
loadTx();
}

async function loadTx(){
if(!user) return;

const list = document.getElementById("list");
list.innerHTML="";

const {data,error} = await sb
.from("transactions")
.select("*")
.eq("user_id",user.id)
.order("id",{ascending:false});

if(error){
log(error.message);
return;
}

data.forEach(tx=>{
const div=document.createElement("div");
div.className="tx";
div.innerHTML=`<b>${tx.label}</b><br>${tx.amount} ₪ - ${tx.category}`;
list.appendChild(div);
});
}

// PDF
async function handleFile(input){
const file=input.files[0];
if(!file) return;

log("PDF LOADED");

const buffer=await file.arrayBuffer();
const pdf=await pdfjsLib.getDocument({data:buffer}).promise;

let text="";

for(let i=1;i<=pdf.numPages;i++){
const page=await pdf.getPage(i);
const c=await page.getTextContent();
text += c.items.map(x=>x.str).join(" ")+"\n";
}

log("PDF TEXT READY");
log(text.slice(0,300));
alert("PDF traité ✔ (debug en bas)");
}

// helpers
function emailInput(){return document.getElementById("email");}
function passInput(){return document.getElementById("password");}