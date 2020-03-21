var record;
var edit = false;
var gId = 0;
var pending = null;

function gotoApprove(id)
{
    swal({
        title: "Approve?",
        text: "Are you sure you want to approve changes made to " + pending[id].tid + "?",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#800080',
        cancelButtonColor: '#001e33',
        confirmButtonText: 'Yes, Approve!'
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
            $.ajax({
                type: "PUT",
                url : "/netop/pending/update/terminalconfiguration/" + pending[id].id,
                data : fd,
                processData: false,
                contentType: false,
        
                success : function(json) {
                    swal(
                        'Done!',
                        "Changes Approved....",
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
                        "Changes not approved",
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
    if(pending === null)
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
        var i = pending.length - 1;
        for(; i > -1; i--) {
            arr = [];
            arr.push("TERMINAL SETTINGS");
            arr.push(pending[i].namecreated + " just made changes to " + pending[i].tid + ". Kindly Approve.");
            arr.push("<button onclick=\"gotoApprove('" + i + "');\" type=\"button\" class=\"btn btn-success\">Approve</button>");
            $('#datatable-buttons').DataTable().row.add(arr);
        }
        $('#datatable-buttons').DataTable().draw();
    }
}

function getAPendingTerminals()
{
    $.ajax({
        type: "GET",
        url : "/netop/pending/getoutstanding/terminalconfiguration",
        processData: false,
        contentType: false,

        success : function(json) {
            pending = JSON.parse(json.message);
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
    getAPendingTerminals();
});