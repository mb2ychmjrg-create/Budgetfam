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
const email=emailInput().value;
const password=passInput().value;

const {data,error}=await sb.auth.signInWithPassword({email,password});

if(error){log(error.message);return;}

user=data.user;
log("connected");
go("homePage");
loadTx();
}

async function signup(){
const email=emailInput().value;
const password=passInput().value;

const {error}=await sb.auth.signUp({email,password});

if(error){log(error.message);return;}

alert("account created");
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

if(error){log(error.message);return;}

loadTx();
go("homePage");
}

// LOAD
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

// helpers
function emailInput(){return document.getElementById("email");}
function passInput(){return document.getElementById("password");}