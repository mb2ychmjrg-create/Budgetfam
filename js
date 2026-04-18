const sb = supabase.createClient(
"https://nyywcxcahalxazienuav.supabase.co",
"YOUR_ANON_KEY"
);

let user=null;

async function login(){
const {data,error}=await sb.auth.signInWithPassword({
email:email.value,
password:password.value
});
if(error)return alert(error.message);
user=data.user;
enter();
}

async function signup(){
const {error}=await sb.auth.signUp({
email:email.value,
password:password.value
});
if(error)return alert(error.message);
alert("Compte créé");
}

function enter(){
auth.style.display="none";
app.style.display="block";
loadTx();
}

async function addTx(){
await sb.from("transactions").insert({
user_id:user.id,
label:label.value,
amount:+amount.value,
category:cat.value
});
loadTx();
}