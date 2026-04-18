// ================= SUPABASE =================

const sb = supabase.createClient(
"https://nyywcxcahalxazienuav.supabase.co",
"TON_SUPABASE_ANON_KEY"
);

let user = null;
let chart = null;

// ================= LOGIN =================

async function login(){
const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

const { data, error } = await sb.auth.signInWithPassword({email,password});

if(error){
document.getElementById("msg").innerText = error.message;
return;
}

user = data.user;
enter();
}

async function signup(){
const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

const { error } = await sb.auth.signUp({email,password});

if(error){
document.getElementById("msg").innerText = error.message;
return;
}

document.getElementById("msg").innerText = "Compte créé ✔";
}

// ================= ENTER =================

function enter(){
document.getElementById("auth").style.display="none";
document.getElementById("app").style.display="block";
loadTx();
}

// ================= ADD =================

async function addTx(){

await sb.from("transactions").insert({
user_id:user.id,
label:label.value,
amount:+amount.value,
category:cat.value
});

loadTx();
}

// ================= LOAD =================

async function loadTx(){

const { data } = await sb
.from("transactions")
.select("*")
.eq("user_id",user.id);

render(data);
stats(data);
drawChart(data);
}

// ================= UI =================

function render(data){
const list=document.getElementById("list");
list.innerHTML="";

data.forEach(t=>{
list.innerHTML+=`
<div class="tx">
<b>${t.label}</b><br>
${t.amount} ₪ - ${t.category}
</div>
`;
});
}

// ================= STATS =================

function stats(data){
let total=data.reduce((a,b)=>a+Number(b.amount),0);

document.getElementById("total").innerText=total;
document.getElementById("count").innerText=data.length;
}

// ================= CHART =================

function drawChart(data){

let c={};

data.forEach(t=>{
c[t.category]=(c[t.category]||0)+Number(t.amount);
});

if(chart)chart.destroy();

chart=new Chart(document.getElementById("chart"),{
type:"doughnut",
data:{
labels:Object.keys(c),
datasets:[{data:Object.values(c)}]
}
});
}

// ================= PDF =================

async function handleFile(input){

const file=input.files[0];
if(!file)return;

pdfjsLib.GlobalWorkerOptions.workerSrc =
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const buffer=await file.arrayBuffer();
const pdf=await pdfjsLib.getDocument({data:buffer}).promise;

let text="";

for(let i=1;i<=pdf.numPages;i++){
const page=await pdf.getPage(i);
const content=await page.getTextContent();
text+=content.items.map(x=>x.str).join(" ")+"\n";
}

document.getElementById("pdfOut").innerText=text.slice(0,2000);
}