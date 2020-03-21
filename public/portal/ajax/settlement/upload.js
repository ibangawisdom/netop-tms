$("#demo-form3" ).submit(function( event ) {
    event.preventDefault();
    
    var fd = new FormData();
    fd.append('upload', upload.files[0]);
    $("#btnsend2").hide();
    $.ajax({
        type: "POST",
        url : "/netop/settlement/batch",
        data : fd,
        processData: false,
        contentType: false,

        success : function(json) {
            swal({
                title: "Successful!",
                showConfirmButton: false,
                timer: 3000
            });
            if(json.status == 200)
            {
                location.reload();
            }
        },

        complete: function(){
            $("#btnsend2").show();
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

$(document).ready(function() {
    $("#netopform").hide();
    var x = document.getElementById("details").innerText;
    details = JSON.parse(x);
    $("#fullname").text(details.fullname);
});