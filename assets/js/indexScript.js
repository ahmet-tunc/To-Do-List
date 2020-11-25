var taskList = new Array();
var completedTaskList = new Array();
var checkControl = true;

window.addEventListener('DOMContentLoaded', (event) => {

    $('.loader-wrapper').show();
    let token = JSON.parse(sessionStorage.getItem("token"));
    console.log("bir kere çalıştı");
    if (token !== null) {
        $.ajax({
            url: url + 'list',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            method: 'POST',
            async: false,

        }).done(function (data) {
            for (let i = 0; i < data.data.length; i++){
                if (data.data[i]['task_status']==0)
                {
                    taskList.push({
                        id: data.data[i]['id'],
                        task_name: data.data[i]["task_name"],
                        task_status: data.data[i]["task_status"],
                        updated_at: data.data[i]["updated_at"]
                    });
                }
                else{
                    completedTaskList.push({
                        id: data.data[i]['id'],
                        task_name: data.data[i]["task_name"],
                        task_status: data.data[i]["task_status"],
                        updated_at: data.data[i]["updated_at"]
                    })
                }
            }
            localStorage.setItem("taskList", JSON.stringify(taskList));
            localStorage.setItem("completedTaskList", JSON.stringify(completedTaskList));

            // console.log(taskList);
             console.log(data);
            $('.loader-wrapper').hide();
        }).fail(function (error) {
            swal.fire({
                icon: 'error',
                title: 'Veri çekme işlemi başarısız',
                html: 'Lütfen tekrar deneyiniz..',
                confirmButtonText: 'Tamam'
            });
        });


        for (let i = 0; i < taskList.length; i++) {
            let li = document.createElement("li");
            li.id = taskList[i]['id'];
            li.className = "list-group-item list-group-item-action list-group-item-dark text-white border-bottom border-white";

            let checkBox = document.createElement("input");
            checkBox.type = "checkbox";
            checkBox.id = "check" + taskList[i]['id'];
            checkBox.name = "listItemCheck";

            let label = document.createElement("label");
            label.htmlFor = "check" + taskList[i]['id'];
            label.className="ml-2";
            label.id="label"+taskList[i]['id'];
            label.textContent = taskList[i]["task_name"];

            let update = document.createElement("i");
            update.className = "fa fa-edit fa-2x float-right text-primary mr-2";
            update.id = taskList[i].toString();
            update.addEventListener("click", function listItemDelete() {
                ListItemUpdate(label.innerText, li, li.id);
            });

            let icon = document.createElement("i");
            icon.className = "fa fa-trash-alt fa-2x float-right text-primary";
            icon.id = taskList[i]["id"].toString();
            icon.addEventListener("click", function listItemDelete() {
                ListItemRemove(label.innerText, li, li.id);
            });

            // if (taskList[i]["task_status"] == 0) {
                li.append(checkBox, label, icon, update);
                document.getElementById("ulList1").appendChild(li);
            // } else {
            //     li.appendChild(label);
            //     document.getElementById("ulList2").appendChild(li);
            // }

        }

        for (let i = 0; i<completedTaskList.length; i++){
            let li = document.createElement("li");
            li.id = completedTaskList[i]['id'];
            li.className = "list-group-item list-group-item-action list-group-item-dark text-white border-bottom border-white";

            let checkBox = document.createElement("input");
            checkBox.type = "checkbox";
            checkBox.id = "check" + completedTaskList[i]['id'];
            checkBox.name = "completedCheck";

            let label = document.createElement("label");
            label.htmlFor = "check" + completedTaskList[i]['id'];
            label.className="ml-2";
            label.id="label"+completedTaskList[i]['id'];
            label.textContent = completedTaskList[i]["task_name"];

            li.append(checkBox, label);
            document.getElementById("ulList2").appendChild(li);
        }

        //ZAMANLAMA
        setInterval(function () {
            TimeLimitControl();
        }, 1000);
    } else {
        window.location.href = "login.html";
    }
});

function ListItemUpdate(labelText, li, liId) { //Burası
    let token = JSON.parse(sessionStorage.getItem("token"));

    Swal.fire({
        title: labelText,
        html: 'Adlı görevi güncellemek için lütfen yeni görev adını giriniz',
        input: 'text',
        showCancelButton: true,
        cancelButtonText: 'Vazgeç',
        confirmButtonText: 'Güncelle',
        showLoaderOnConfirm: true,
        preConfirm: (newTaskName) => {
            if (newTaskName != "") {

            } else {
                Swal.showValidationMessage(
                    `Görev adı boş geçilemez!`
                )
            }
            return newTaskName;
        },
        allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
        if (result.isConfirmed) {
            console.log(labelText);
            console.log(li);
            console.log(liId);
            $.ajax({
                url: url + 'edit-task/' + liId,
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                data: {
                    task_name: result.value
                },
                async: false
            }).done(function (response) {
                document.getElementById("label"+liId).innerText=result.value;
                taskList[liId]['task_name'] = result.value;
                swal.fire({
                    icon: 'success',
                    title: 'Güncelleme işlemi başarıyla gerçekleştirildi',
                    timer: 2000,
                    timerProgressBar: true,
                    confirmButtonText: 'Tamam'
                });
            }).fail(function (error) {
                swal.fire({
                    icon: 'error',
                    title: 'Güncelleme işlemi başarısız',
                    timer: 2000,
                    timerProgressBar: true,
                    confirmButtonText: 'Tamam'
                });
            });
        }

    })
}

function ListItemRemove(labelText, li, liId) {
    let token = JSON.parse(sessionStorage.getItem("token"));
    Swal.fire({
        title: labelText,
        text: "Adlı görevi silmek istediğinize emin misiniz?",
        icon: 'question',
        showCancelButton: true,
        cancelButtonText: 'Vazgeç',
        confirmButtonColor: '#3072d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sil'
    }).then((result) => {
        if (result.isConfirmed) {
            $('.loader-wrapper').show();
            $.ajax({
                url: url + 'delete-task/' + liId,
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                method: 'POST',
                async: true,
            }).done(function (response) {
                console.log(response);
                taskList = taskList.filter(x => x.id != liId);
                localStorage.setItem("taskList", JSON.stringify(taskList));
                document.getElementById("ulList1").removeChild(li);
                Swal.fire({
                    title: labelText,
                    text: "Adlı görev başarıyla silinmiştir.",
                    icon: 'success',
                    confirmButtonColor: '#3072d6',
                    confirmButtonText: 'Tamam'
                });
                $('.loader-wrapper').hide();
            }).fail(function (error) {
                Swal.fire({
                    title: labelText,
                    text: "Adlı görevi silme işlemi başarısız.",
                    icon: 'error',
                    confirmButtonColor: '#3072d6',
                    confirmButtonText: 'Tamam'
                });
                console.log(error);
                $('.loader-wrapper').hide();
            });
        }
    });
}

function logout() {
    sessionStorage.clear();
    window.location.href = "login.html";
}

//YENİ ITEM EKLEME VE DATA ÇEKME
function addListItem() {
    let newItemText = document.getElementById("newItemText").value;
    let token = JSON.parse(sessionStorage.getItem("token"));
    if (newItemText != "") {
        $.ajax({
            url: url + 'add-task',
            type: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            data: {
                task_name: newItemText
            },
            success: function (data) {
                createList(data);
            },
            error: function (error) {
                console.log(error);
            }

        });
    } else {
        Swal.fire({
            icon: 'warning',
            title: 'Uyarı',
            text: 'Lütfen eklemek istediğiniz görevin adını yazıp tekrar deneyiniz.',
            confirmButtonText: 'Tamam'
        });
    }
    $('#newItemText').val("");
}

function createList(data) {
    localStorage.removeItem("completedTaskList");
    localStorage.removeItem("taskList");
    taskList = new Array();
    completedTaskList = new Array();
    document.getElementById("ulList1").innerHTML = "";
    document.getElementById("ulList2").innerHTML = "";
    data["data"].forEach(function (item) {
        let li = document.createElement("li");
        li.id = item['id'];
        li.className = "list-group-item list-group-item-action list-group-item-dark text-white border-bottom border-white";

        let checkBox = document.createElement("input");
        checkBox.type = "checkbox";
        checkBox.id = "check" + item['id'];

        let label = document.createElement("label");
        label.className="ml-2";
        label.htmlFor = "check" + item['id'];
        label.textContent = item["task_name"];
        label.id="label"+item["id"];



        let update = document.createElement("i");
        update.className = "fa fa-edit fa-2x float-right text-primary mr-2";
        update.id = item["id"].toString();
        update.addEventListener("click", function listItemDelete() {
            ListItemUpdate(label.innerText, li, li.id);
        });

        let icon = document.createElement("i");
        icon.className = "fa fa-trash-alt fa-2x float-right text-primary";
        icon.id = item["id"].toString();
        icon.addEventListener("click", function listItemDelete() {
            ListItemRemove(label.innerText, li, li.id);
        });

        if (item['task_status'] ==0){
            checkBox.name = "listItemCheck";
            taskList.push({
                id: item['id'],
                task_name: item["task_name"],
                task_status: item["task_status"],
                updated_at: item["updated_at"]
            });
            li.append(checkBox, label, icon, update);
            document.getElementById("ulList1").appendChild(li);
        }else{
            checkBox.name = "completedCheck";
            completedTaskList.push({
                id: item['id'],
                task_name: item["task_name"],
                task_status: item["task_status"],
                updated_at: item["updated_at"]
            });
            li.append(checkBox, label);
            document.getElementById("ulList2").appendChild(li);
        }



    });
    localStorage.setItem("taskList", JSON.stringify(taskList));
    localStorage.setItem("completedTaskList", JSON.stringify(completedTaskList));
}


function selectAll() {
    let selectAllButton = document.getElementById("selectAllButton");
    let check = document.getElementsByName("listItemCheck");
    if (check.length > 0) {
        if (checkControl) {
            for (let i = 0; i < check.length; i++) {
                check[i].checked = true;
            }
            selectAllButton.className = "btn btn-danger btn-block";
            selectAllButton.innerText = "Tümünü Kaldır";
            checkControl = false;
        } else {
            for (let i = 0; i < check.length; i++) {
                check[i].checked = false;
            }
            selectAllButton.className = "btn btn-primary btn-block";
            selectAllButton.innerText = "Tümünü Seç";
            checkControl = true;
        }
    } else {
        Swal.fire({
            icon: 'warning',
            title: 'Uyarı',
            text: 'Listede seçilecek eleman bulunmamaktadır.',
            confirmButtonText: 'Tamam'
        });
    }
}

function RemoveFromList() {
    $('#loader-wrapper').show();
    let token = JSON.parse(sessionStorage.getItem('token'));
    let selectButton = document.getElementById("selectAllButton");
    let select = document.getElementsByName("listItemCheck");
    if (select.length > 0) {
        let sayac = 0;
        let silinecek = new Array();
        for (let i = select.length - 1; i >= 0; i--) {
            if (select[i].checked) {
                let li = select[i].parentElement;
                silinecek.push({
                    id: li.id,
                    li: li
                });
                selectButton.innerText = "Tümünü Seç";
                selectButton.className = "btn btn-primary btn-block"
                checkControl = true;
            } else {
                sayac++;
                if (sayac == select.length) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Uyarı',
                        text: 'Seçili liste elemanı bulunmamaktadır.',
                        confirmButtonText: 'Tamam'
                    });
                    $('.loader-wrapper').hide();
                }
            }
        }
        if (silinecek.length > 0) {
            swal.fire({
                icon: 'question',
                html: 'Seçili ' + silinecek.length + ' görevi silmek istediğinize emin misiniz?',
                cancelButtonText: 'Vazgeç',
                showCancelButton: true,
                showConfirmButton: true,
                confirmButtonText: 'Sil'
            }).then((result) => {
                if (result.isConfirmed) {
                    for (let i = 0; i < silinecek.length; i++) {
                        console.log(silinecek[i]['id']);
                        console.log(silinecek[i]['li']);
                        $.ajax({
                            url: url + 'delete-task/' + silinecek[i]['id'],
                            headers: {
                                'Authorization': 'Bearer ' + token
                            },
                            method: 'POST',
                            async: true,
                        }).done(function (response) {
                            console.log(response);
                            taskList = taskList.filter(x => x.id != silinecek[i]['id']);
                            localStorage.setItem("taskList", JSON.stringify(taskList));
                            document.getElementById("ulList1").removeChild(silinecek[i]['li']);
                            $('.loader-wrapper').hide();
                        }).fail(function (error) {
                            $('.loader-wrapper').hide();
                        });
                    }
                }else{
                    $('.loader-wrapper').hide();
                }
            });
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Uyarı',
                text: 'Seçili liste elemanı bulunmamaktadır.',
                confirmButtonText: 'Tamam'
            });
            $('.loader-wrapper').hide();
        }
    } else {
        Swal.fire({
            icon: 'warning',
            title: 'Uyarı',
            text: 'Çıkarılacak liste elemanı bulunmamaktadır.',
            confirmButtonText: 'Tamam'
        });
        $('.loader-wrapper').hide();
    }
}


function completedButton(){
    $('#loader-wrapper').show();
    let token = JSON.parse(sessionStorage.getItem('token'));
    let selectButton = document.getElementById("selectAllButton");
    let select = document.getElementsByName("listItemCheck");
    if (select.length > 0) {
        console.log("girdi");
        let getId = new Array();
        let getLi = new Array();
        for (let i = 0; i<select.length; i++) {
            if (select[i].checked) {
                let li = select[i].parentElement;
                let paragraphText = li.childNodes.item(1).textContent;
                getId.push(li.id);
                getLi.push({
                    id:li.id,
                    li:li,
                    paragraphText:paragraphText
                });
                console.log(getId);
                console.log(getLi);
                selectButton.innerText = "Tümünü Seç";
                selectButton.className = "btn btn-primary btn-block"
                checkControl = true;
            }else{
                Swal.fire({
                    icon: 'warning',
                    title: 'Uyarı',
                    text: 'Seçili liste elemanı bulunmamaktadır.',
                    confirmButtonText: 'Tamam'
                });
                $('.loader-wrapper').hide();
            }
        }

        $.ajax({
           url: url+'completed-task',
           headers:{
               'Authorization':'Bearer '+token
           },
           method:'POST',
           data:{
               completedTaskList : getId
           },
           async:false
        }).done(function(response){
            for(let i = getLi.length-1; i>=0; i--){
                let li = document.createElement("li");
                li.id = getId[i];
                li.className = "list-group-item list-group-item-action list-group-item-dark text-white border-bottom border-white";

                let checkBox = document.createElement("input");
                checkBox.type = "checkbox";
                checkBox.id = "check" + getId[i];
                checkBox.name = "completedCheck";

                let label = document.createElement("label");
                label.htmlFor = "check" + getId[i];
                label.className="ml-2";
                label.id="label"+getId[i];
                label.textContent = getLi[i]['paragraphText'];
                li.append(checkBox,label);
                document.getElementById("ulList2").appendChild(li)
                console.log(getId[i]);
                document.getElementById("ulList1").removeChild(getLi[i]['li']);
                completedTaskList.push({
                    id:getId[i],
                    li:li
                });
                taskList=taskList.filter(x=>x.id != getId[i]);
                localStorage.setItem("taskList",JSON.stringify(taskList));
                localStorage.setItem("completedTaskList",JSON.stringify(completedTaskList));
                $('.loader-wrapper').hide();
            }

        }).fail(function(error){
            console.log(error);
        });

    } else {
        Swal.fire({
            icon: 'warning',
            title: 'Uyarı',
            text: 'Çıkarılacak liste elemanı bulunmamaktadır.',
            confirmButtonText: 'Tamam'
        });
        $('.loader-wrapper').hide();
    }
}


function clearList() {

    let token = JSON.parse(sessionStorage.getItem("token"));
    let list = document.getElementById("ulList2");


    $.ajax({
        method: "POST",
        url: url + "clear-task-list",
        dataType: "json",
        headers: {
            'Authorization': 'Bearer ' + token
        },
        async: false

    }).done(function (response) {
        list.innerHTML = "";
        completedTaskList=[];
        localStorage.setItem("completedTaskList",JSON.stringify(completedTaskList));
    })
}




function undoList(){
    $('#loader-wrapper').show();
    let token = JSON.parse(sessionStorage.getItem('token'));
    let selectButton = document.getElementById("selectAllButton");
    let select = document.getElementsByName("completedCheck");
    if (select.length > 0) {
        let getId = new Array();
        let getLi = new Array();
        for (let i = 0; i<select.length; i++) {
            if (select[i].checked) {
                let li = select[i].parentElement;
                let paragraphText = li.childNodes.item(1).textContent;
                getId.push(li.id);
                getLi.push({
                    id:li.id,
                    li:li,
                    paragraphText:paragraphText
                });
                console.log(getId);
                console.log(getLi);
                selectButton.innerText = "Tümünü Seç";
                selectButton.className = "btn btn-primary btn-block"
                checkControl = true;
            }else{
                Swal.fire({
                    icon: 'warning',
                    title: 'Uyarı',
                    text: 'Seçili liste elemanı bulunmamaktadır.',
                    confirmButtonText: 'Tamam'
                });
                $('.loader-wrapper').hide();
            }
        }

        $.ajax({
            url: url+'undo-completed-task',
            headers:{
                'Authorization':'Bearer '+token
            },
            method:'POST',
            data:{
                undoCompletedTaskList : getId
            },
            async:false
        }).done(function(response){
            for(let i = getLi.length-1; i>=0; i--){
                let li = document.createElement("li");
                li.id = getId[i];
                li.className = "list-group-item list-group-item-action list-group-item-dark text-white border-bottom border-white";

                let checkBox = document.createElement("input");
                checkBox.type = "checkbox";
                checkBox.id = "check" + getId[i];
                checkBox.name = "listItemCheck";

                let label = document.createElement("label");
                label.htmlFor = "check" + getId[i];
                label.className="ml-2";
                label.id="label"+getId[i];
                label.textContent = getLi[i]['paragraphText'];

                let update = document.createElement("i");
                update.className = "fa fa-edit fa-2x float-right text-primary mr-2";
                update.id = getId[i].toString();
                update.addEventListener("click", function listItemDelete() {
                    ListItemUpdate(label.innerText, li, li.id);
                });

                let icon = document.createElement("i");
                icon.className = "fa fa-trash-alt fa-2x float-right text-primary";
                icon.id = getId[i].toString();
                icon.addEventListener("click", function listItemDelete() {
                    ListItemRemove(label.innerText, li, li.id);
                });
                li.append(checkBox,label,icon,update);
                document.getElementById("ulList1").appendChild(li);
                console.log(getId[i]);
                document.getElementById("ulList2").removeChild(getLi[i]['li']);
                taskList.push({
                    id: getId[i],
                    task_name: getLi[i]['paragraphText'],
                    task_status: 0,
                    updated_at: new Date()
                });
                completedTaskList=completedTaskList.filter(x=>x.id != getId[i]);
                localStorage.setItem("completedTaskList",JSON.stringify(taskList));
                localStorage.setItem("taskList",JSON.stringify(taskList));
                $('.loader-wrapper').hide();
            }

        }).fail(function(error){
            console.log(error);
        });

    } else {
        Swal.fire({
            icon: 'warning',
            title: 'Uyarı',
            text: 'Çıkarılacak liste elemanı bulunmamaktadır.',
            confirmButtonText: 'Tamam'
        });
        $('.loader-wrapper').hide();
    }
}

