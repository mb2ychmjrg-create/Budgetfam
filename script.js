const sb = supabase.createClient(
"https://nyywcxcahalxazienuav.supabase.co",
"TON_ANON_KEY"
);

let user=null;

// ================= LOGIN =================
async function login(){
const email=emailInput.value;
const password=passwordInput.value;

const {data,error}=await sb.auth.signInWithPassword({
email,password
});

if(error){
alert(error.message);
return;
}

user=data.user;
enter();
}

// ================= SIGNUP =================
async function signup(){
const email=emailInput.value;
const password=passwordInput.value;

const {error}=await sb.auth.signUp({email,password});

if(error){
alert(error.message);
return;
}

alert("Compte créé");
}

// ================= ENTER =================
function enter(){
auth.style.display="none";
app.style.display="block";
loadTx();
calcStats();
}

// ================= ADD TX =================
async function addTx(){

await sb.from("transactions").insert({
user_id:user.id,
label:label.value,
amount:+amount.value,
category:cat.value
});

loadTx();
calcStats();
}

// ================= LOAD =================
async function loadTx(){

list.innerHTML="";

const {data}=await sb
.from("transactions")
.select("*")
.eq("user_id",user.id)
.order("id",{ascending:false});

data?.forEach(t=>{
const div=document.createElement("div");
div.className="tx";
div.innerHTML=`${t.label} — ${t.amount} ₪`;
list.appendChild(div);
});
}

// ================= STATS =================
async function calcStats(){

const {data}=await sb
.from("transactions")
.select("amount")
.eq("user_id",user.id);

const total=data?.reduce((a,b)=>a+(b.amount||0),0)||0;

stats.innerText="Total dépenses: "+total+" ₪";
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

// envoi vers backend (CLAUDE sécurisé)
const res=await fetch("https://TON_SUPABASE_FUNCTION/analyze-pdf",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({text:text.slice(0,6000)})
});

const json=await res.json();

console.log("AI RESULT:",json);
alert("PDF analysé ✔ (voir console)");
}