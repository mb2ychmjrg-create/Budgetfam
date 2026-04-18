const sb = supabase.createClient(
"https://nyywcxcahalxazienuav.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55eXdjeGNhaGFseGF6aWVudWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNjMwNzcsImV4cCI6MjA5MTYzOTA3N30._98bpQLnWA6fBiEgbWYPH8RGaWFRj8zIfMGgZe_KopM"
);

let user=null;

function log(t){
document.getElementById("debug").innerHTML += "<br>"+t;
}

// LOGIN
async function login(){
log("login...");
const email=document.getElementById("email").value;
const password=document.getElementById("password").value;

const {data,error}=await sb.auth.signInWithPassword({email,password});

if(error){
log(error.message);
alert(error.message);
return;
}

user=data.user;
log("OK logged");
enter();
}

// SIGNUP
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
}

// LOAD
async function loadTx(){
const list=document.getElementById("list");
list.innerHTML="";

const {data,error}=await sb
.from("transactions")
.select("*")
.eq("user_id",user.id);

if(error){
log(error.message);
return;
}

data.forEach(tx=>{
const div=document.createElement("div");
div.className="tx";
div.innerHTML=`${tx.label} - ${tx.amount}`;
list.appendChild(div);
});
}