const sb = supabase.createClient(
"https://nyywcxcahalxazienuav.supabase.co",
"TON_ANON_KEY"
);

let user=null;

// LOGIN
async function login(){
const email=email.value;
const password=password.value;

const {data,error}=await sb.auth.signInWithPassword({email,password});

if(error) return alert(error.message);

user=data.user;
enter();
}

// SIGNUP
async function signup(){
const {error}=await sb.auth.signUp({
email:email.value,
password:password.value
});

if(error) return alert(error.message);

alert("Compte créé");
}

// ENTER
function enter(){
auth.style.display="none";
app.style.display="block";
loadTx();
stats();
}

// ADD TX
async function addTx(){
await sb.from("transactions").insert({
user_id:user.id,
label:label.value,
amount:+amount.value,
category:cat.value
});

loadTx();
stats();
}

// LOAD TX
async function loadTx(){
list.innerHTML="";

const {data}=await sb
.from("transactions")
.select("*")
.eq("user_id",user.id)
.order("id",{ascending:false});

data?.forEach(t=>{
list.innerHTML+=`
<div class="tx">
<b>${t.label}</b><br>
${t.amount} ₪ • ${t.category}
</div>`;
});
}

// STATS
async function stats(){
const {data}=await sb
.from("transactions")
.select("amount")
.eq("user_id",user.id);

const total=data?.reduce((a,b)=>a+(b.amount||0),0)||0;

statsBox.innerText="Total: "+total+" ₪";
}

// PDF + IA + INSERT AUTO
async function handleFile(input){

const file=input.files[0];
if(!file) return;

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

// SEND TO BACKEND AI
const res=await fetch("https://TON_SUPABASE_FUNCTION/analyze-pdf",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({text:text.slice(0,6000)})
});

const json=await res.json();

try{
const content=json.content[0].text;
const transactions=JSON.parse(content);

// INSERT AUTO DB
for(const t of transactions){
await sb.from("transactions").insert({
user_id:user.id,
label:t.label,
amount:t.amount,
category:t.category
});
}

alert("PDF importé + analysé ✔");
loadTx();
stats();

}catch(e){
console.log("Parse error",json);
alert("Erreur IA parsing");
}
}