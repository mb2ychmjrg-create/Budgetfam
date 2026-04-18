// ================= SUPABASE INIT =================

const sb = supabase.createClient(
"https://nyywcxcahalxazienuav.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55eXdjeGNhaGFseGF6ZW50YXZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNjMwNzcsImV4cCI6MjA5MTYzOTA3N30._98bpQLnWA6fBiEgbWYPH8RGaWFRj8zIfMGgZe_KopM"
);

let user = null;

// ================= LOGIN =================

async function login(){
const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

document.getElementById("msg").innerText = "Connexion...";

const { data, error } = await sb.auth.signInWithPassword({
email,
password
});

if(error){
document.getElementById("msg").innerText = "❌ " + error.message;
return;
}

user = data.user;
enter();
}

// ================= SIGNUP =================

async function signup(){
const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

const { error } = await sb.auth.signUp({ email, password });

if(error){
document.getElementById("msg").innerText = "❌ " + error.message;
return;
}

document.getElementById("msg").innerText = "✔ Compte créé";
}

// ================= ENTER APP =================

function enter(){
document.getElementById("auth").style.display="none";
document.getElementById("app").style.display="block";
loadTx();
}

// ================= ADD TX =================

async function addTx(){

const label = document.getElementById("label").value;
const amount = document.getElementById("amount").value;
const cat = document.getElementById("cat").value;

await sb.from("transactions").insert({
user_id:user.id,
label,
amount:+amount,
category:cat
});

loadTx();
}

// ================= LOAD TX =================

async function loadTx(){

const list = document.getElementById("list");
list.innerHTML="";

const { data, error } = await sb
.from("transactions")
.select("*")
.eq("user_id", user.id)
.order("id", { ascending:false });

if(error){
list.innerHTML="Erreur chargement";
return;
}

data.forEach(t=>{
const div=document.createElement("div");
div.className="tx";
div.innerHTML=`
<b>${t.label}</b><br>
${t.amount} ₪ - ${t.category}
`;
list.appendChild(div);
});
}