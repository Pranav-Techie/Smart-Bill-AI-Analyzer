import { useState, useEffect } from "react";
import "./App.css";

function App() {

    const clearHistory = ()=>{
        localStorage.removeItem("billHistory");
        setHistory([]);
    }

const [text,setText] = useState("");
const [result,setResult] = useState(null);
const [image,setImage] = useState(null);
const [reminder,setReminder] = useState(null);
const [history,setHistory] = useState([]);
const [showHistory,setShowHistory] = useState(false);

useEffect(()=>{

const savedBills = localStorage.getItem("billHistory");

if(savedBills){
setHistory(JSON.parse(savedBills));
}

},[]);


useEffect(()=>{

const today = new Date();
today.setHours(0,0,0,0);

history.forEach(bill=>{

if(bill.dueDate !== "Not Detected"){

const parts = bill.dueDate.split(" ");

let day;
let month;

if(isNaN(parts[0])){
month = parts[0];
day = parts[1];
}
else{
day = parts[0];
month = parts[1];
}

const monthMap = {
january:0,february:1,march:2,april:3,may:4,june:5,
july:6,august:7,september:8,october:9,november:10,december:11
}

const due = new Date(2026,monthMap[month.toLowerCase()],day);
due.setHours(0,0,0,0);

const diffDays = (due - today)/(1000*60*60*24);

if(diffDays === 0){
setReminder(`⚠ ${bill.billType} is due TODAY`);
}

if(diffDays <=3 && diffDays >0){
setReminder(`⚠ ${bill.billType} is due in ${diffDays} day(s)`);
}

}

});

},[history]);



const analyze = ()=>{

const lower = text.toLowerCase();

let billType = "Unknown Bill";
let Amount = "Not Detected";
let dueDate = "Not Detected";

if(lower.includes("water")) billType = "Water Bill";
if(lower.includes("electricity")) billType = "Electricity Bill";
if(lower.includes("internet")) billType = "Internet Bill";
if(lower.includes("gas")) billType = "Gas Bill";
if(lower.includes("rent")) billType = "Rent Bill";
if(lower.includes("maintenance")) billType = "Maintenance Bill";

const amountMatch = text.match(/(\d{3,6})/);
if(amountMatch){
Amount = amountMatch[1];
}

const dateMatch = text.match(/(\d{1,2}\s(january|february|march|april|may|june|july|august|september|october|november|december))|((january|february|march|april|may|june|july|august|september|october|november|december)\s\d{1,2})/i);

if(dateMatch){
dueDate = dateMatch[0];
}

const response = {
billType,
amount:Amount,
dueDate,
suggestion:"Pay the bill before the due date to avoid late fees"
};

let warning = ""

const lastBill = history.find(b => b.billType === billType)

if(lastBill){
const prev = parseInt(lastBill.amount)
const curr = parseInt(Amount)

if(curr > prev){
const percent = Math.round(((curr - prev)/prev)*100)
warning = `⚠ Spending increased by ${percent}% compared to last ${billType}`
}
}

response.warning = warning

const newBill = {
billType,
amount:Amount,
dueDate
};

const updatedHistory = [newBill,...history];

setHistory(updatedHistory);

localStorage.setItem("billHistory",JSON.stringify(updatedHistory));

setResult(response);

}



const startVoiceInput = ()=>{

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if(!SpeechRecognition){
alert("Speech Recognition not supported in this browser");
return;
}

const recognition = new SpeechRecognition();

recognition.lang = "en-US";
recognition.start();

recognition.onresult = (event)=>{

const voiceText = event.results[0][0].transcript;

setText(voiceText);

};

recognition.onerror = (event)=>{
console.log(event.error);
}

}



return(

<div className="container">

<h1 className="title">Smart Bill AI Analyzer</h1>

<div style={{
display:"grid",
gridTemplateColumns:"repeat(3,1fr)",
gap:"15px",
marginBottom:"25px"
}}>

<div style={{
background:"#1E293B",
padding:"20px",
borderRadius:"12px",
textAlign:"center"
}}>
<h3 style={{color:"#A5B4FC"}}>Total Bills</h3>
<p style={{fontSize:"24px",color:"#fff"}}>{history.length}</p>
</div>

<div style={{
background:"#1E293B",
padding:"20px",
borderRadius:"12px",
textAlign:"center"
}}>
<h3 style={{color:"#A5B4FC"}}>Upcoming</h3>
<p style={{fontSize:"24px",color:"#FACC15"}}>
{reminder ? "1" : "0"}
</p>
</div>

<div style={{
background:"#1E293B",
padding:"20px",
borderRadius:"12px",
textAlign:"center"
}}>
<h3 style={{color:"#A5B4FC"}}>Total Amount</h3>
<p style={{fontSize:"24px",color:"#22C55E"}}>
₹{history.reduce((sum,b)=>sum+(parseInt(b.amount)||0),0)}
</p>
</div>

</div>


<div style={{position:"absolute",top:"30px",right:"40px"}}>

<button
onClick={()=>setShowHistory(!showHistory)}
style={{
background:"#6366F1",
color:"#fff",
border:"none",
padding:"8px 12px",
borderRadius:"8px",
cursor:"pointer"
}}
>
📜 History
</button>

<button
onClick={clearHistory}
style={{
background:"#EF4444",
color:"#fff",
border:"none",
padding:"8px 12px",
borderRadius:"8px",
cursor:"pointer",
marginLeft:"10px"
}}
>
🗑 Clear
</button>

</div>


<div className="card">

<textarea
placeholder="Paste your bill text here..."
value={text}
onChange={(e)=>setText(e.target.value)}
/>


<button
onClick={startVoiceInput}
style={{
marginLeft:"10px",
padding:"10px 15px",
borderRadius:"8px",
border:"none",
background:"#9333EA",
color:"#fff",
cursor:"pointer"
}}
>
Speak Bill
</button>

<br/>


<div
style={{
marginTop:"20px",
padding:"25px",
borderRadius:"12px",
border:"2px dashed #6366F1",
color:"#A5B4FC",
textAlign:"center",
background:"#020617"
}}
>

<p style={{fontSize:"18px",marginBottom:"10px"}}>

Upload Bill Image (AI Vision)

</p>


<input
type="file"
accept="image/*"
onChange={(e)=>setImage(e.target.files[0])}
/>


<p style={{fontSize:"12px",marginTop:"10px"}}>

Supported: JPG, PNG

</p>

</div>


<button onClick={analyze}>

Analyze Bill

</button>

</div>


{image &&(

<div style={{marginTop:"20px"}}>

<p>Uploaded Bill Image:</p>

<img
src={URL.createObjectURL(image)}
alt="Bill"
style={{maxWidth:"100%",maxHeight:"300px"}}
/>

</div>

)}



{reminder &&(

<div
style={{
background:"linear-gradient(90deg,#FACC15,#FB923C)",
color:"#111",
padding:"18px",
borderRadius:"12px",
marginBottom:"20px",
fontWeight:"bold"
}}
>

⚠ Upcoming Bill Reminder

<p style={{marginTop:"6px"}}>

{reminder}

</p>

</div>

)}



{showHistory && history.length >0 &&(

<div
style={{
marginTop:"30px",
background:"#020617",
padding:"20px",
borderRadius:"12px",
boxShadow:"0 0 15px rgba(0,0,0,0.3)"
}}
>

<h2 style={{color:"#A5B4FC",marginBottom:"15px"}}>

Bill History

</h2>

{history.map((bill,index)=>(

<div
key={index}
style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
padding:"12px",
borderBottom:"1px solid #1E293B"
}}
>

<div>

<strong style={{color:"#E2E8F0"}}>

{bill.billType}

</strong>

<br/>

<span style={{color:"#94A3B8",fontSize:"14px"}}>

Due: {bill.dueDate}

</span>

</div>

<div style={{color:"#22C55E",fontWeight:"bold"}}>

₹{bill.amount}

</div>

</div>

))}

</div>

)}



{result &&(

<div className="resultCard">

<h2>Bill Analysis</h2>

<div className="resultItem">

<strong>Bill Type:</strong> {result.billType}

</div>


<div className="resultItem">

<strong>Amount:</strong> {result.amount}

</div>


<div className="resultItem">

<strong>Due Date:</strong> {result.dueDate}

</div>


<div className="resultItem">

<strong>Suggestion:</strong> {result.suggestion}

{result.warning && (
    <p style={{color:"red"}}>{result.warning}</p>
)}


</div>

</div>

)}

<div style={{
    marginTop:"40px",
    background:"#020617",
    padding:"20px",
    borderRadius:"12px",
}}>

<p style={{color:"#94A3B8",fontSize:"14px"}}>Made with ❤️ by Pranav</p>
<div style={{marginTop:"20px", color:"#FACC15"}}>
    <h3>AI Spending Insight</h3>
    <p>
        Total spend: ₹{history.reduce((sum,b)=>sum+(parseInt(b.amount)||0),0)}
    </p>
    {history.length >1 && (
        <p>
            Average bill amount: ₹{Math.round(history.reduce((sum,b)=>sum+(parseInt(b.amount)||0),0)/history.length)}
        </p>
    )}
</div>

</div>

</div>

);

}

export default App;