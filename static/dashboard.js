// ======================================================
// CYBER WATCH SOC DASHBOARD
// dashboard.js
// PART 1
// Clock • Theme • Charts • Security
// ======================================================



// ======================================================
// GET SYSTEM DATA
// ======================================================


const body = document.body;


const cpuUsage =
Number(body.dataset.cpu) || 0;


const ramUsage =
Number(body.dataset.ram) || 0;


const storageUsed =
Number(body.dataset.used) || 0;


const storageTotal =
Number(body.dataset.total) || 0;





// ======================================================
// LIVE CLOCK
// ======================================================


function updateClock(){


    let time =
    new Date().toLocaleTimeString();


    const clock =
    document.getElementById("clock");


    const digitalClock =
    document.getElementById("digitalClock");



    if(clock){

        clock.innerHTML=time;

    }


    if(digitalClock){

        digitalClock.innerHTML=time;

    }


}



setInterval(updateClock,1000);

updateClock();







// ======================================================
// DARK MODE
// ======================================================


const themeButton =
document.getElementById("themeToggle");



if(localStorage.getItem("theme") === "dark"){

    document.body.classList.add("dark");

}



if(themeButton){


themeButton.addEventListener(
"click",
()=>{


document.body.classList.toggle("dark");



if(
document.body.classList.contains("dark")
){

localStorage.setItem(
"theme",
"dark"
);


}

else{


localStorage.setItem(
"theme",
"light"
);


}



});


}







// ======================================================
// CHART DEFAULT SETTINGS
// ======================================================


Chart.defaults.color="#cbd5e1";


Chart.defaults.font.family=
"Inter";






// ======================================================
// CPU PERFORMANCE CHART
// ======================================================


const cpuCanvas =
document.getElementById("cpuChart");



if(cpuCanvas){


new Chart(cpuCanvas,{


type:"line",



data:{


labels:[

"0s",
"10s",
"20s",
"30s",
"40s",
"50s"

],



datasets:[{


label:"CPU Usage %",


data:[

20,
35,
cpuUsage,
45,
60,
cpuUsage

],



borderColor:"#00f7ff",


backgroundColor:
"rgba(0,247,255,0.12)",


fill:true,


tension:.45,


borderWidth:3,


pointRadius:4



}]


},



options:{


responsive:true,


maintainAspectRatio:false,



plugins:{


legend:{


display:false


}


},



scales:{



x:{


grid:{


color:
"rgba(255,255,255,.05)"


}


},



y:{


beginAtZero:true,


max:100,


grid:{


color:
"rgba(255,255,255,.05)"


}


}


}



}



});



}







// ======================================================
// RAM PERFORMANCE CHART
// ======================================================



const ramCanvas =
document.getElementById("ramChart");



if(ramCanvas){


new Chart(ramCanvas,{


type:"line",



data:{



labels:[

"0s",
"10s",
"20s",
"30s",
"40s",
"50s"

],



datasets:[{


label:"RAM Usage %",


data:[

40,
52,
ramUsage,
60,
55,
ramUsage

],



borderColor:"#a855f7",


backgroundColor:
"rgba(168,85,247,.15)",


fill:true,


tension:.45,


borderWidth:3



}]



},



options:{


responsive:true,


maintainAspectRatio:false,



plugins:{


legend:{


display:false


}


},



scales:{


x:{


grid:{


color:
"rgba(255,255,255,.05)"


}


},


y:{


beginAtZero:true,


max:100,


grid:{


color:
"rgba(255,255,255,.05)"


}


}



}



}



});


}








// ======================================================
// NETWORK TRAFFIC CHART
// ======================================================



const networkCanvas =
document.getElementById("networkChart");



if(networkCanvas){


new Chart(networkCanvas,{


type:"line",



data:{


labels:[

"10s",
"20s",
"30s",
"40s",
"50s",
"60s"

],



datasets:[



{


label:"Download MB/s",


data:[

12,
20,
18,
35,
28,
40

],


borderColor:"#00f7ff",


tension:.4,


borderWidth:3


},




{


label:"Upload MB/s",


data:[

5,
8,
10,
15,
12,
18

],



borderColor:"#9333ea",


tension:.4,


borderWidth:3


}



]



},



options:{


responsive:true,


maintainAspectRatio:false,



plugins:{


legend:{


labels:{


color:"#e2e8f0"


}


}


},



scales:{


x:{


ticks:{


color:"#94a3b8"


}


},



y:{


ticks:{


color:"#94a3b8"


}


}



}



}



});



}









// ======================================================
// SECURITY SCORE
// ======================================================


let securityScore =


100 - ((cpuUsage + ramUsage)/4);



securityScore =
Math.round(securityScore);



const securityCircle =
document.querySelector(
".circle-inner h1"
);



if(securityCircle){


securityCircle.innerHTML =
securityScore+"%";


}







// ======================================================
// THREAT STATUS
// ======================================================


const threatText =
document.querySelector(
".threat-center h1"
);



if(threatText){



if(securityScore >=80){


threatText.innerHTML="LOW";


threatText.style.color=
"#22c55e";


}



else if(securityScore >=50){


threatText.innerHTML="MEDIUM";


threatText.style.color=
"#f97316";


}



else{


threatText.innerHTML="HIGH";


threatText.style.color=
"#ef4444";


}



}

// ======================================================
// PART 2
// Software • Process Monitor • Search • Storage
// ======================================================





// ======================================================
// INSTALLED SOFTWARE
// ======================================================


const softwareTable =
document.getElementById(
"softwareTable"
);



let softwareData = [];



async function loadSoftware(){


if(!softwareTable) return;



try{


const response =
await fetch("/api/software");



const data =
await response.json();



softwareData =
data.software || [];



displaySoftware(
softwareData
);



}

catch(error){


console.log(
"Software API Error:",
error
);



softwareTable.innerHTML = `

<tr>

<td colspan="3">

Failed to load software

</td>

</tr>

`;

}



}





function displaySoftware(apps){



if(!softwareTable)
return;



softwareTable.innerHTML="";



if(apps.length===0){


softwareTable.innerHTML=`

<tr>

<td colspan="3">

No software found

</td>

</tr>

`;

return;


}





apps.forEach(app=>{



softwareTable.innerHTML += `

<tr>

<td>

${app.name || "Unknown"}

</td>


<td>

${app.publisher || "Unknown"}

</td>


<td>

${app.version || "N/A"}

</td>


</tr>

`;



});



}



loadSoftware();







// ======================================================
// SOFTWARE SEARCH
// ======================================================



const softwareSearch =

document.getElementById(
"softwareSearch"
);



if(softwareSearch){



softwareSearch.addEventListener(
"keyup",
function(){



let value =
this.value.toLowerCase();



let filtered =

softwareData.filter(app=>{


return (

app.name
?.toLowerCase()
.includes(value)

||

app.publisher
?.toLowerCase()
.includes(value)

);



});



displaySoftware(filtered);



});



}









// ======================================================
// LIVE PROCESS MONITOR
// ======================================================



const processTable =

document.getElementById(
"processTable"
);



let processData=[];



async function loadProcesses(){



if(!processTable)
return;



try{


const response =

await fetch(
"/api/processes"
);



const data =

await response.json();



processData =
data.processes || [];



displayProcesses(
processData
);



}



catch(error){



console.log(
"Process API Error:",
error
);



processTable.innerHTML=`

<tr>

<td colspan="3">

Process monitoring unavailable

</td>

</tr>

`;

}


}






function displayProcesses(processes){



if(!processTable)
return;



processTable.innerHTML="";



if(processes.length===0){


processTable.innerHTML=`

<tr>

<td colspan="3">

No process data

</td>

</tr>

`;

return;

}



processes.slice(0,20)
.forEach(proc=>{



processTable.innerHTML += `

<tr>


<td>

${proc.name || "Unknown"}

</td>



<td>

${proc.cpu || 0}%

</td>



<td>

<span class="running">

● Running

</span>

</td>


</tr>

`;



});



}





loadProcesses();



// Update every 5 seconds

setInterval(
loadProcesses,
5000
);








// ======================================================
// PROCESS SEARCH
// ======================================================


const processSearch =

document.getElementById(
"processSearch"
);



if(processSearch){


processSearch.addEventListener(
"keyup",
function(){


let value =
this.value.toLowerCase();



let filtered =

processData.filter(proc=>{


return proc.name

?.toLowerCase()

.includes(value);



});



displayProcesses(
filtered
);



});


}







// ======================================================
// STORAGE HEALTH
// ======================================================


const storageStatus =

document.getElementById(
"storageStatus"
);



if(storageStatus && storageTotal > 0){



let percentage =

(storageUsed/storageTotal)*100;



percentage =
Math.round(
percentage
);




if(percentage >=80){


storageStatus.innerHTML =

`
⚠ Storage Usage High
(${percentage}%)
`;

storageStatus.style.color =
"#ef4444";


}

else{


storageStatus.innerHTML =

`
✓ Storage Normal
(${percentage}%)
`;

storageStatus.style.color =
"#22c55e";


}


}







// ======================================================
// LIVE SYSTEM UPDATE
// ======================================================


async function updateSystem(){


try{


const response =

await fetch(
"/api/system"
);



const data =

await response.json();



const cpuElement =

document.querySelector(
".metric-card.cpu h2"
);



const ramElement =

document.querySelector(
".metric-card.ram h2"
);



if(cpuElement){

cpuElement.innerHTML =
data.cpu+"%";

}



if(ramElement){

ramElement.innerHTML =
data.ram+"%";

}



}


catch(error){


console.log(
"System update error:",
error
);


}


}




// Update every 10 seconds

setInterval(

updateSystem,

10000

);





// ======================================================
// PAGE LOAD EFFECT
// ======================================================


window.addEventListener(
"load",
()=>{


document
.querySelectorAll(
".metric-card,.analytics-card,.security-card"
)
.forEach(
(card,index)=>{


card.style.animationDelay =
(index*0.1)+"s";


});


});
