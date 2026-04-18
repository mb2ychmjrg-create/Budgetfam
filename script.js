// =======================
// DEBUG AFFICHAGE À L'ÉCRAN
// =======================
function debug(msg){
  const el = document.getElementById("debug");
  if(el) el.innerText += "\n" + msg;
  console.log(msg);
}

// =======================
// SUPABASE CONFIG
// =======================
const SUPABASE_URL = "https://nyywcxcahalxazienuav.supabase.co";

// ⚠️ COLLE TA VRAIE ANON KEY ICI
const SUPABASE_ANON_KEY = "COLLE_TA_CLE_ICI";

debug("Init Supabase...");

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

debug("Supabase OK");

// =======================
// USER STATE
// =======================
let user = null;

// =======================
// LOGIN
// =======================
async function login(){
  debug("Login...");

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await sb.auth.signInWithPassword({
    email,
    password
  });

  if(error){
    debug("LOGIN ERROR: " + error.message);
    alert(error.message);
    return;
  }

  user = data.user;
  debug("LOGIN OK: " + user.email);
  enter();
}

// =======================
// SIGNUP
// =======================
async function signup(){
  debug("Signup...");

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await sb.auth.signUp({
    email,
    password
  });

  if(error){
    debug("SIGNUP ERROR: " + error.message);
    alert(error.message);
    return;
  }

  alert("Compte créé → connecte-toi");
  debug("Signup OK");
}

// =======================
// ENTER APP
// =======================
function enter(){
  document.getElementById("auth").style.display = "none";
  document.getElementById("app").style.display = "block";
  loadTx();
}

// =======================
// ADD TRANSACTION
// =======================
async function addTx(){
  debug("Add TX...");

  const label = document.getElementById("label").value;
  const amount = document.getElementById("amount").value;
  const cat = document.getElementById("cat").value;

  const { error } = await sb.from("transactions").insert({
    user_id: user.id,
    label,
    amount: +amount,
    category: cat
  });

  if(error){
    debug("DB ERROR: " + error.message);
    alert(error.message);
    return;
  }

  debug("TX added");
  loadTx();
}

// =======================
// LOAD TRANSACTIONS
// =======================
async function loadTx(){
  debug("Loading TX...");

  const list = document.getElementById("list");
  list.innerHTML = "";

  const { data, error } = await sb
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("id", { ascending:false });

  if(error){
    debug("LOAD ERROR: " + error.message);
    return;
  }

  data.forEach(tx=>{
    const div = document.createElement("div");
    div.className = "tx";
    div.innerHTML = `<b>${tx.label}</b><br>${tx.amount} ₪ - ${tx.category}`;
    list.appendChild(div);
  });

  debug("TX loaded: " + data.length);
}

// =======================
// PDF IMPORT (BASIC)
// =======================
async function handleFile(input){
  const file = input.files[0];
  if(!file) return;

  debug("File: " + file.name);

  if(file.name.endsWith(".pdf")){
    await parsePDF(file);
  } else {
    alert("CSV pas encore activé");
  }
}

async function parsePDF(file){

  pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  let text = "";

  for(let i=1;i<=pdf.numPages;i++){
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(x=>x.str).join(" ") + "\n";
  }

  debug("PDF PARSED");
  debug(text.slice(0,300));

  alert("PDF analysé ✔");
}