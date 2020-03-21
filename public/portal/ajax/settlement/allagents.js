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
    $("#rules").val("");
    $("#lastbalance").val("");
    $("#balance").val("");
    $("#status").val("");
 });

function gotoEdit(id)
{
    edit = true;
    gId = record[id].id;
    $("#netopform").show();
    $("#netoptable").hide();
    $("#name").val(record[id].username);
    $("#rules").val(record[id].txnrules);
    $("#lastbalance").val(record[id].lastbalance);
    $("#balance").val(record[id].balance);
    $("#status").val(record[id].blocked);
}

$("#demo-form2" ).submit(function( event ) {
    event.preventDefault();
    $("#btnsend").hide();
    var fd = new FormData();
    fd.append('username', $("#name").val());
    fd.append('txnrules', $("#rules").val());
    fd.append('lastbalance', $("#lastbalance").val());
    fd.append('balance', $("#balance").val());
    fd.append('blocked', $("#status").val());
    fd.append('edit', edit);
    fd.append('id', gId);
    
    swal({
        title: "Processing...",
        text: "Please wait",
        //imageUrl: "images/ajaxloader.gif",
        showConfirmButton: false,
        allowOutsideClick: false
    });

    $.ajax({
        type: "POST",
        url : "/netop/settlement/saveagent",
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
});

function gotoDelete(id, status)
{
    swal({
        title: "Status?",
        text: "Are you sure you want to " + status + " " + record[id].username + "?",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#800080',
        cancelButtonColor: '#001e33',
        confirmButtonText: 'Yes, Proceed!'
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
            var st = "";
            if(status === "block")
                st = "true";
            else
                st = "false";
            fd.append('status', record[id].username);
            $.ajax({
                type: "DELETE",
                url : "/netop/settlement/deleteagent/" + record[id].username + "/" + st,
                data : fd,
                processData: false,
                contentType: false,
        
                success : function(json) {
                    swal(
                        'Done!',
                        "All tids of " + record[id].username + " " + status,
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
                        record[id].username + " not " + status,
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
            arr.push(record[i].username);
            arr.push(record[i].balance);
            arr.push(record[i].txnrules);
            arr.push("<button onclick=\"gotoEdit('" + i + "');\" type=\"button\" class=\"btn btn-success\">Edit</button>");
            if(record[i].blocked === "true")
                arr.push("<button onclick=\"gotoDelete('" + i + "', '" + "unblock" + "');\" type=\"button\" class=\"btn btn-success\">Unblock</button>");
            else
                arr.push("<button onclick=\"gotoDelete('" + i + "', '" + "block" + "');\" type=\"button\" class=\"btn btn-success\">Block</button>");
            $('#datatable-buttons').DataTable().row.add(arr);
        }
        $('#datatable-buttons').DataTable().draw();
    }
}

function getAllData()
{
    $.ajax({
        type: "GET",
        url : "/netop/settlement/getallagents",
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
    getAllData();
});