const form=document.getElementById("activityForm");
const tbody=document.getElementById("tableBody");

const total=document.getElementById("total");
const completed=document.getElementById("completed");
const pending=document.getElementById("pending");

const search=document.getElementById("search");
const filter=document.getElementById("filter");

let activities=JSON.parse(localStorage.getItem("activities"))||[];

function save(){
    localStorage.setItem("activities",JSON.stringify(activities));
}

function dashboard(){

    total.textContent=activities.length;

    completed.textContent=
    activities.filter(x=>x.status==="Completed").length;

    pending.textContent=
    activities.filter(x=>x.status==="Pending").length;

}

function render(){

    tbody.innerHTML="";

    let keyword=search.value.toLowerCase();
    let statusFilter=filter.value;

    activities
    .filter(item=>{

        let ok1=item.activity.toLowerCase().includes(keyword)||
                item.subject.toLowerCase().includes(keyword);

        let ok2=statusFilter==="All"||
                item.status===statusFilter;

        return ok1&&ok2;

    })

    .forEach((item,index)=>{

        tbody.innerHTML+=`

        <tr>

        <td>${item.activity}</td>

        <td>${item.subject}</td>

        <td>${item.date}</td>

        <td class="${item.status==="Completed"?"completed":"pending"}">
        ${item.status}
        </td>

        <td>

        <button
        class="btn btn-success btn-sm action-btn"
        onclick="toggle(${index})">
        ✔
        </button>

        <button
        class="btn btn-danger btn-sm action-btn"
        onclick="removeItem(${index})">
        Delete
        </button>

        </td>

        </tr>

        `;

    });

    dashboard();

}

form.addEventListener("submit",e=>{

    e.preventDefault();

    activities.push({

        activity:activity.value,

        subject:subject.value,

        date:date.value,

        status:status.value

    });

    save();

    render();

    form.reset();

});

function removeItem(i){

    if(confirm("Delete Activity?")){

        activities.splice(i,1);

        save();

        render();

    }

}

function toggle(i){

    activities[i].status=
    activities[i].status==="Pending"?
    "Completed":
    "Pending";

    save();

    render();

}

search.onkeyup=render;

filter.onchange=render;

document.getElementById("themeBtn").onclick=()=>{

    document.body.classList.toggle("dark");

};

render();