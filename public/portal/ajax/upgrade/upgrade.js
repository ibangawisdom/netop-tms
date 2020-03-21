var record;
var edit = false;
var gId = 0;

$("#newclicked").click(function(){
    $("#netopform").show();
    $("#netoptable").hide();
 });

 $("#backclicked").click(function(){
    $("#netopform").hide();
    $("#netoptable").show();
    $("#name").val("");
    $("#ip").val("");
    $("#port").val("");
    $("#interval").val("");
    $("#downloadtime").val("");
    $("#count").val("");
 });

function gotoEdit(id)
{
    edit = true;
    gId = record[id].id;
    $("#netopform").show();
    $("#netoptable").hide();
}

$("#demo-form2" ).submit(function( event ) {
    event.preventDefault();
    $("#btnsend").hide();
    var fd = new FormData();
    fd.append('version', $("#version").val());
    fd.append('brand', $("#brand").val());
    fd.append('description', $("#description").val());
    fd.append('model', $("#model").val());
    fd.append('fix', $("#fix").val());
    fd.append('upload', upload.files[0]);
    fd.append('remarks', $("#remarks").val());

    var terminals = $("#terminals").val();
    var bnd = $("#brand").val();
    var txt = "";
    if(terminals)
    {
        txt = terminals;
    }else
    {
        txt = "ALL " + bnd + " TERMINALS";
    }
    fd.append('terminals', txt);

    swal({
        title: 'Application',
        text: "Are you sure you want to add application update for " + txt,
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#001e33',
        cancelButtonColor: '#800080',
        confirmButtonText: 'Yes, Add!'
    }).then(function (result) {
        if (result.value)
        {
            swal({
                title: "Processing...",
                text: "Please wait",
                //imageUrl: "images/ajaxloader.gif",
                showConfirmButton: false,
                allowOutsideClick: false
            });
            $.ajax({
                type: "POST",
                url : "/netop/upgrade/upgrade",
                data : fd,
                processData: false,
                contentType: false,
        
                success : function(json) {
                    swal({
                        title: "Successful!",
                        showConfirmButton: false,
                        timer: 1000
                    });
                    if(json.status == 200)
                    {
                        location.reload();
                    }
                },
        
                complete: function(){
                    $("#btnsend").show();
                },
                
                error : function(xhr,errmsg,err) {
                    swal({
                        title: "Error!",
                        showConfirmButton: false,
                        timer: 1000
                    });
                    var json = JSON.parse(xhr.responseText);
                    swal(
                        'Error!',
                        json.message,
                        'error'
                    );
                }
            });
        }else
        {
            $("#btnsend").show();
        }
    });
});

function gotoDelete(id)
{
    swal({
        title: "Delete?",
        text: "Are you sure you want to delete application for " + record[id].brand + " " + record[id].model + "?",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#800080',
        cancelButtonColor: '#001e33',
        confirmButtonText: 'Yes, Delete!'
    }).then(function (result) {
        if (result.value) {
            swal({
                title: "Processing...",
                text: "Please wait",
                //imageUrl: "images/ajaxloader.gif",
                showConfirmButton: false,
                allowOutsideClick: false
            });
            var fd = new FormData();
            fd.append('username', record[id].username);
            $.ajax({
                type: "DELETE",
                url : "/netop/upgrade/deleteupgrade/" + record[id].id,
                data : fd,
                processData: false,
                contentType: false,
        
                success : function(json) {
                    swal(
                        'Done!',
                        record[id].brand + " deleted.",
                        'success'
                    );
                    location.reload();
                },
        
                complete: function(){
                    
                },
                
                error : function(xhr,errmsg,err) {
                    console.log(xhr.responseText);
                    swal(
                        'Error!',
                        record[id].brand + " not deleted.",
                        'error'
                    );
                }
            });
        }else
        {

        }
    });
}

function parseResponse()
{
    if(record === null)
    {
        //Do nothing because it is null
        var table = $('#datatable-buttons').DataTable({
                "language": {
                    "emptyTable": "No Data."
                },
                "bDestroy": true
        });
        table.clear().draw();
    }else
    {
        var i = record.length - 1;
        for(; i > -1; i--) {
            arr = [];
            arr.push(record[i].brand);
            arr.push(record[i].model);
            arr.push(record[i].version);
            arr.push("<a href=" + record[i].download + "><i class=\"fa fa-download\"></i> Download</a>");
            arr.push("<button onclick=\"gotoDelete('" + i + "');\" type=\"button\" class=\"btn btn-success\">Delete</button>");
            $('#datatable-buttons').DataTable().row.add(arr);
        }
        $('#datatable-buttons').DataTable().draw();
    }
}

function getAllApps()
{
    $.ajax({
        type: "GET",
        url : "/netop/upgrade/getallupdates",
        processData: false,
        contentType: false,

        success : function(json) {
            record = JSON.parse(json.message);
            parseResponse();
        },

        complete: function(){
            
        },
        
        error : function(xhr,errmsg,err) {
            console.log(xhr.responseText);
        }
    });
}

$(document).ready(function() {
    $("#netopform").hide();
    var x = document.getElementById("details").innerText;
    details = JSON.parse(x);
    $("#fullname").text(details.fullname);
    getAllApps();
});