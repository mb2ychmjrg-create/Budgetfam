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

if(error){
log(error.message);
alert(error.message);
return;
}

user=data.user;
log("connected");
go("home");
loadTx();
}

async function signup(){
const email=document.getElementById("email").value;
const password=document.getElementById("password").value;

const {error}=await sb.auth.signUp({email,password});

if(error){
log(error.message);
return;
}

alert("account created");
}

// ADD TX
async function addTx(){
const label=document.getElementById("label").value;
const amount=document.getElementById("amount").value;
const cat=document.getElementById("cat").value;

const {error}=await sb.from("transactions").insert({
user_id:user.id,
label,
amount:+amount,
category:cat
});

if(error){
log(error.message);
return;
}

loadTx();
go("home");
}

// LOAD TX
async function loadTx(){
if(!user) return;

const list=document.getElementById("list");
list.innerHTML="";

const {data,error}=await sb
.from("transactions")
.select("*")
.eq("user_id",user.id)
.order("id",{ascending:false});

if(error){
log(error.message);
return;
}

let total=0;

data.forEach(tx=>{
total+=tx.amount;

const div=document.createElement("div");
div.className="tx";
div.innerHTML=`<b>${tx.label}</b><br>${tx.amount} ₪`;
list.appendChild(div);
});

document.getElementById("summary").innerHTML =
"Total: " + total + " ₪";
}

// PDF HANDLER
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

log("PDF raw extracted");

// CLEAN STEP
const parsed = parsePDF(text);

log("PDF parsed: "+parsed.length);

displayPDF(parsed);
}

// PARSER (IMPORTANT)
function parsePDF(text){

let lines=text.split(/\n|\r/);

let result=[];

lines.forEach(l=>{

let amountMatch=l.match(/-?\d+[.,]?\d*/);
if(!amountMatch) return;

let amount=parseFloat(amountMatch[0].replace(",","."));
if(isNaN(amount)) return;

let label=l.replace(amountMatch[0],"").trim();
if(label.length<2) return;

result.push({label,amount});
});

return result;
}

// DISPLAY PDF CLEAN
function displayPDF(data){

const list=document.getElementById("list");
list.innerHTML="";

let total=0;

data.forEach(t=>{
total+=t.amount;

const div=document.createElement("div");
div.className="tx";
div.innerHTML=`<b>${t.label}</b><br>${t.amount} ₪`;
list.appendChild(div);
});

document.getElementById("summary").innerHTML =
"PDF total: " + total + " ₪";
}