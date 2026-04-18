console.log("BudgetFam V3 loaded");

const sb = supabase.createClient(
"https://nyywcxcahalxazienuav.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55eXdjeGNhaGFseGF6aWVudWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNjMwNzcsImV4cCI6MjA5MTYzOTA3N30._98bpQLnWA6fBiEgbWYPH8RGaWFRj8zIfMGgZe_KopM"
);

let user=null;

// AUTH
async function login(){

const email=document.getElementById("email").value;
const password=document.getElementById("password").value;

const {data,error}=await sb.auth.signInWithPassword({
email,password
});

if(error){
alert(error.message);
console.log(error);
return;
}

user=data.user;
enter();
}

async function signup(){

const email=document.getElementById("email").value;
const password=document.getElementById("password").value;

const {error}=await sb.auth.signUp({email,password});

if(error){
alert(error.message);
return;
}

alert("Compte créé !");
}

// ENTER
function enter(){
document.getElementById("auth").classList.add("hidden");
document.getElementById("app").classList.remove("hidden");
loadTx();
}

// ADD
async function addTx(){

const label=document.getElementById("label").value;
const amount=document.getElementById("amount").value;
const cat=document.getElementById("cat").value;

await sb.from("transactions").insert({
user_id:user.id,
label,
amount:+amount,
category:cat
});

loadTx();
}

// LOAD
async function loadTx(){

const list=document.getElementById("list");
list.innerHTML="";

const {data}=await sb
.from("transactions")
.select("*")
.eq("user_id",user.id)
.order("id",{ascending:false});

data?.forEach(tx=>{
const div=document.createElement("div");
div.className="tx";
div.innerHTML=`<b>${tx.label}</b><br>${tx.amount} ₪ • ${tx.category}`;
list.appendChild(div);
});
}

// PDF (debug simple)
async function handleFile(input){

const file=input.files[0];
if(!file)return;

console.log("PDF:",file.name);

alert("PDF chargé ✔ (mode debug)");
}