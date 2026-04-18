const sb = supabase.createClient(
"https://nyywcxcahalxazienuav.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55eXdjeGNhaGFseGF6aWVudWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNjMwNzcsImV4cCI6MjA5MTYzOTA3N30._98bpQLnWA6fBiEgbWYPH8RGaWFRj8zIfMGgZe_KopM"
);

let user=null;
let chart=null;

// NAV
function go(p){
document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));
document.getElementById(p).classList.add("active");
}

// AUTH
async function login(){
const email=document.getElementById("email").value;
const password=document.getElementById("password").value;

const {data,error}=await sb.auth.signInWithPassword({email,password});
if(error) return;

user=data.user;
go("home");
loadTx();
}

async function signup(){
const email=document.getElementById("email").value;
const password=document.getElementById("password").value;

await sb.auth.signUp({email,password});
}

// ADD TX
async function addTx(){

const label=document.getElementById("label").value;
const amount=document.getElementById("amount").value;
const type=document.getElementById("type").value;

const signed = type==="income" ? +amount : -Math.abs(amount);

await sb.from("transactions").insert({
user_id:user.id,
label,
amount:signed,
type
});

loadTx();
}

// LOAD
async function loadTx(){

const {data}=await sb
.from("transactions")
.select("*")
.eq("user_id",user.id);

render(data);
analysis(data);
draw(data);
}

// RENDER
function render(data){

let list=document.getElementById("list");
list.innerHTML="";

data.forEach(t=>{

list.innerHTML+=`
<div class="tx">
<b>${t.label}</b><br>
${t.amount} ₪
</div>
`;
});
}

// IA FINANCE CORE
function analysis(data){

let income=0;
let expense=0;

data.forEach(t=>{
if(t.amount>=0) income+=t.amount;
else expense+=Math.abs(t.amount);
});

let balance = income - expense;
let savingsRate = income>0 ? ((balance/income)*100).toFixed(1) : 0;

// IA INSIGHT LOGIC
let advice="";

if(balance < 0){
advice="🚨 Tu dépenses plus que tu gagnes";
}
else if(savingsRate < 20){
advice="⚠️ Faible taux d'épargne (<20%)";
}
else{
advice="📈 Bonne santé financière";
}

document.getElementById("summary").innerHTML=`
💚 Revenus: ${income} ₪<br>
❤️ Dépenses: ${expense} ₪<br>
💰 Balance: ${balance} ₪<br>
📊 Épargne: ${savingsRate}%<br>
`;

document.getElementById("ai").innerHTML=advice;
}

// CHART
function draw(data){

let income=0;
let expense=0;

data.forEach(t=>{
if(t.amount>=0) income+=t.amount;
else expense+=Math.abs(t.amount);
});

const ctx=document.getElementById("chart").getContext("2d");

if(chart) chart.destroy();

chart=new Chart(ctx,{
type:"bar",
data:{
labels:["Revenus","Dépenses"],
datasets:[{
data:[income,expense],
backgroundColor:["#22c55e","#ef4444"]
}]
}
});
}