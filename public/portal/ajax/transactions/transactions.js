var role;
var username;
var tids;
var records;

function formatDt(date) {
    var res = date.replace(" ", "0");
    var dt = res.slice(0, 4) + "-" + res.slice(4, 6) + "-" + res.slice(6, 8) + " " + res.slice(8, 10)
    + "-" + res.slice(10, 12) + "-" + res.slice(12, 14);
    return dt;
}

function formatAmt(amt)
{
    var t = parseFloat(amt);
    var famt = (t).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    return famt;
}

function getTransactionType(mti, proc)
{
    if(mti === "0200" && proc.slice(0, 2) == "00")
        return "PURCHASE";
    return "UNKNOWN";
}

function getMod(d)
{
    var m = d.length % 2;
    if(m != 0)
        return d + ".";
    else
        return d;
}

function gotoPrint(id)
{
    var use = "<p align=\"left\">";
    use += "MASKED PAN: <span style=\"float:right;\">" + records[id].masked_pan + "</span></br>";
    use += "CARDHOLDER: <span style=\"float:right;\">" + "NA" + "</span></br>";//records[id].card_holder
    use += "EXPIRY DATE: <span style=\"float:right;\">" + "NA" + "</span></br>";//records[id].aid
    use += "AUTH CODE: <span style=\"float:right;\">" + records[id].auth_code + "</span></br>";
    use += "TERMINAL ID: <span style=\"float:right;\">" + records[id].terminal_id + "</span></br>";
    use += "AID: <span style=\"float:right;\">" + "NA" + "</span></br>";//records[id].aid
    use += "STAN: <span style=\"float:right;\">" + records[id].stan + "</span></br>";
    use += "RRN: <span style=\"float:right;\">" + records[id].rrn + "</span></br>";
    use += "RESPONSE CODE: <span style=\"float:right;\">" + records[id].response_code + "</span></br>";
    use += "PROCESSING CODE: <span style=\"float:right;\">" + records[id].processing_code + "</span></br>";
    use += "MTI: <span style=\"float:right;\">" + records[id].mti + "</span></br>";
    use += "MERCHANT ID: <span style=\"float:right;\">" + records[id].merchant_id + "</span></br>";
    use += "TRANSACTION TYPE: <span style=\"float:right;\">" + getTransactionType(records[id].mti, records[id].processing_code) + "</span></br>";
    var datetime = records[id].date_trans;
    var dt = "";
    if(datetime.length == 14)
        dt = formatDt(datetime);
    else
        dt = datetime;
    use += "DATE/TIME: <span style=\"float:right;\">" + dt + "</span></br>";
    use += "</p>";

    //var pdf = new jsPDF();
    var pp = "";
    pp = sprintf("%-12.12s %18.18s", "TERMINAL ID:", records[id].terminal_id);
    console.log(pp);
    //pdf.text(5, 5, pp);

    pp = sprintf("%-12.12s %18.18s", "MERCHANT ID:", records[id].merchant_id);
    console.log(pp);
    //pdf.text(5, 15, pp);
    
    pp = "\n..............................";
    console.log(pp);
    //pdf.text(5, 25, pp);

    var v = setResponseCode(records[id].response_code);
    pp = sprintf("   %*s%*s   ", 12 + getMod(v).length / 2, 
        getMod(v), 
        12 - getMod(v).length / 2, "");
    console.log(pp);
    //pdf.text(5, 35, pp);

    pp = "\n..............................";
    console.log(pp);
    //pdf.text(5, 45, pp);

    pp = sprintf("%-12.12s %18.18s", "TRANSACTION:", getTransactionType(records[id].mti, records[id].processing_code));
    console.log(pp);
    //pdf.text(5, 55, pp);

    pp = sprintf("%-14.14s %16.16s", "RESPONSE CODE:", records[id].response_code);
    console.log(pp);
    //pdf.text(5, 65, pp);

    pp = sprintf("%-10.10s %20.20s", "AUTH CODE:", records[id].auth_code);
    console.log(pp);
    //pdf.text(5, 75, pp);

    pp = sprintf("%-5.5s %25.25s", "STAN:", records[id].stan);
    console.log(pp);
    //pdf.text(5, 85, pp);

    pp = sprintf("%-4.4s %26.26s", "RRN:", records[id].rrn);
    console.log(pp);

    pp = sprintf("%-12.12s %18.18s", dt.slice(0, 10), dt.slice(11));
    console.log(pp);

    var amt = records[id].amount;
    var t = parseFloat(amt);
    var famt = "NGN " + (t).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    pp = sprintf("%-6.6s %24.24s", "TOTAL:", famt);
    console.log(pp);
    
    pp = "\n..............................";
    console.log(pp);

    pp = sprintf("%-4.4s %26.26s", "PAN:", records[id].masked_pan);
    console.log(pp);

    pp = sprintf("%-12.12s %18.18s", "EXPIRY DATE:", "**/**");
    console.log(pp);

    pp = sprintf("%-20.20s %10.10s", "VERIFICATION METHOD:", "PIN");
    console.log(pp);

    pp = "\n..............................";
    console.log(pp);

    pp = sprintf("%-15.15s %15.15s", "PRINTER NUMBER:", "****");
    console.log(pp);

    pp = sprintf("%-8.8s %22.22s", "VERSION:", "*.*.*");
    console.log(pp);

    pp = "\n..............................";
    console.log(pp);

    var d = "PTSP: Intellifin";
    pp = sprintf("   %*s%*s   ", 12 + d.length / 2, d, 
        12 - d.length / 2, "");
    console.log(pp);

    pp = sprintf("   %*s%*s   ", 12 + "Powerred by KARRABO.".length / 2, "Powerred by KARRABO.", 
        12 - "Powerred by KARRABO.".length / 2, "");
    console.log(pp);
    
    pp = sprintf("   %*s%*s   ", 12 + "13B Akanbi Disu Street, Lekki Phase 1".length / 2, "13B Akanbi Disu Street, Lekki Phase 1", 
        12 - "13B Akanbi Disu Street, Lekki Phase 1".length / 2, "");
    console.log(pp);

    pp = sprintf("   %*s%*s   ", 12 + "possupport@ntellifincom.ng".length / 2, "possupport@ntellifincom.ng", 
        12 - "possupport@ntellifincom.ng".length / 2, "");
    console.log(pp);

    pp = sprintf("   %*s%*s   ", 12 + "netop COPY.".length / 2, "netop COPY.", 
        12 - "netop COPY.".length / 2, "");
    console.log(pp);

    pp = "\n..............................";
    console.log(pp);

    //pdf.save('recent.pdf');


    swal("Confirm Printing...", use, "success");
}

function gotoView(id)
{
    var use = "<p align=\"left\">";
    use += "MASKED PAN: <span style=\"float:right;\">" + records[id].masked_pan + "</span></br>";
    use += "CARDHOLDER: <span style=\"float:right;\">" + records[id].card_holder + "</span></br>";
    use += "EXPIRY DATE: <span style=\"float:right;\">" + records[id].card_expiry + "</span></br>";
    use += "AUTH CODE: <span style=\"float:right;\">" + records[id].auth_code + "</span></br>";
    use += "TERMINAL ID: <span style=\"float:right;\">" + records[id].terminal_id + "</span></br>";
    use += "AID: <span style=\"float:right;\">" + records[id].aid + "</span></br>";
    use += "STAN: <span style=\"float:right;\">" + records[id].stan + "</span></br>";
    use += "RRN: <span style=\"float:right;\">" + records[id].rrn + "</span></br>";
    use += "RESPONSE CODE: <span style=\"float:right;\">" + records[id].response_code + "</span></br>";
    use += "PROCESSING CODE: <span style=\"float:right;\">" + records[id].processing_code + "</span></br>";
    use += "MTI: <span style=\"float:right;\">" + records[id].mti + "</span></br>";
    use += "MERCHANT ID: <span style=\"float:right;\">" + records[id].merchant_id + "</span></br>";
    use += "TRANSACTION TYPE: <span style=\"float:right;\">" + records[id].transaction_type + "</span></br>";
    var datetime = records[id].date_trans;
    var dt = "";
    if(datetime.length == 14)
        dt = formatDt(datetime);
    else
        dt = datetime;
    use += "DATE/TIME: <span style=\"float:right;\">" + dt + "</span></br>";
    use += "</p>";
    swal("Transaction Details!", use, "success");
}

$("#exportbutton").click(function(e){
    $("#exportbutton").text("Please Wait");
    $("#exportbutton").prop("disabled",true);
    var table = $('#bootstrap-data-table').DataTable();
    var data = table.rows({filter: 'applied'}).data();
    var exp = [];
    for(var i = 0; i < data.length; i++)
    {
        exp.push(records[i]);
    }
    var myTestXML = new myExcelXML(JSON.stringify(exp));
    myTestXML.downLoad();
    $("#exportbutton").text("Please Reload Page");
    $("#exportbutton").prop("disabled",false);
});

function setResponseCode(code)
{
    if(code == null)
	return "No Response";
	if(code == "00")
    {
        return "Approved..";
    }else if(code == "01")
    {
        return "Refer to card issuer, special condition";
    }else if(code == "02")
    {
        return "Refer to card issuer";
    }else if(code == "03")
    {
        return "Invalid merchant";
    }else if(code == "04")
    {
        return "Pick-up card";
    }else if(code == "05")
    {
        return "Do not honor";
    }else if(code == "06")
    {
        return "Error";
    }else if(code == "07")
    {
        return "Pick-up card, special condition";
    }else if(code == "08")
    {
        return "Honor with identification";
    }else if(code == "09")
    {
        return "Request in progress";
    }else if(code == "10")
    {
        return "Approved, partial";
    }else if(code == "11")
    {
        return "Approved, VIP";
    }else if(code == "12")
    {
        return "Invalid transaction";
    }else if(code == "13")
    {
        return "Invalid amount";
    }else if(code == "14")
    {
        return "Invalid card number";
    }else if(code == "15")
    {
        return "No such issuer";
    }else if(code == "16")
    {
        return "Approved, update track 3";
    }else if(code == "17")
    {
        return "Customer cancellation";
    }else if(code == "18")
    {
        return "Customer dispute";
    }else if(code == "19")
    {
        return "Re-enter transaction";
    }else if(code == "20")
    {
        return "Invalid response";
    }else if(code == "21")
    {
        return "No action taken";
    }else if(code == "22")
    {
        return "Suspected malfunction";
    }else if(code == "23")
    {
        return "Unacceptable transaction fee";
    }else if(code == "24")
    {
        return "File update not supported";
    }else if(code == "25")
    {
        return "Unable to locate record";
    }else if(code == "26")
    {
        return "Duplicate record";
    }else if(code == "27")
    {
        return "File update field edit error";
    }else if(code == "28")
    {
        return "File update file locked";
    }else if(code == "29")
    {
        return "File update failed";
    }else if(code == "30")
    {
        return "Format error";
    }else if(code == "31")
    {
        return "Bank not supported";
    }else if(code == "32")
    {
        return "Completed partially";
    }else if(code == "33")
    {
        return "Expired card, pick-up";
    }else if(code == "34")
    {
        return "Suspected fraud, pick-up";
    }else if(code == "35")
    {
        return "Contact acquirer, pick-up";
    }else if(code == "36")
    {
        return "Restricted card, pick-up";
    }else if(code == "37")
    {
        return "Call acquirer security, pick-up";
    }else if(code == "38")
    {
        return "PIN tries exceeded, pick-up";
    }else if(code == "39")
    {
        return "No credit account";
    }else if(code == "40")
    {
        return "Function not supported";
    }else if(code == "41")
    {
        return "Lost card, pick-up";
    }else if(code == "42")
    {
        return "No universal account";
    }else if(code == "43")
    {
        return "Stolen card, pick-up";
    }else if(code == "44")
    {
        return "No investment account";
    }else if(code == "45")
    {
        return "Account closed";
    }else if(code == "46")
    {
        return "Identification required";
    }else if(code == "47")
    {
        return "Identification cross-check required";
    }else if(code == "48")
    {
        return "Error";
    }else if(code == "49")
    {
        return "Error";
    }else if(code == "50")
    {
        return "Error";
    }else if(code == "51")
    {
        return "Insufficient funds";
    }else if(code == "52")
    {
        return "No check account";
    }else if(code == "53")
    {
        return "No savings account";
    }else if(code == "54")
    {
        return "Expired card";
    }else if(code == "55")
    {
        return "Incorrect PIN";
    }else if(code == "56")
    {
        return "No card record";
    }else if(code == "57")
    {
        return "Transaction not permitted to cardholder";
    }else if(code == "58")
    {
        return "Transaction not permitted on terminal";
    }else if(code == "59")
    {
        return "Suspected fraud";
    }else if(code == "60")
    {
        return "Contact acquirer";
    }else if(code == "61")
    {
        return "Exceeds withdrawal limit";
    }else if(code == "62")
    {
        return "Restricted card";
    }else if(code == "63")
    {
        return "Security violation";
    }else if(code == "64")
    {
        return "Original amount incorrect";
    }else if(code == "65")
    {
        return "Exceeds withdrawal frequency";
    }else if(code == "66")
    {
        return "Call acquirer security";
    }else if(code == "67")
    {
        return "Hard capture";
    }else if(code == "68")
    {
        return "Response received too late";
    }else if(code == "69")
    {
        return "Advice received too late";
    }else if(code == "70")
    {
        return "Error";
    }else if(code == "71")
    {
        return "Error";
    }else if(code == "72")
    {
        return "Error";
    }else if(code == "73")
    {
        return "Error";
    }else if(code == "74")
    {
        return "Error";
    }else if(code == "75")
    {
        return "PIN tries exceeded";
    }else if(code == "76")
    {
        return "Error";
    }else if(code == "77")
    {
        return "Intervene, bank approval required";
    }else if(code == "78")
    {
        return "Intervene, bank approval required for partial amount";
    }else if(code == "79")
    {
        return "Error";
    }else if(code == "80")
    {
        return "Error";
    }else if(code == "81")
    {
        return "Error";
    }else if(code == "82")
    {
        return "Error";
    }else if(code == "83")
    {
        return "Error";
    }else if(code == "84")
    {
        return "Error";
    }else if(code == "85")
    {
        return "Error";
    }else if(code == "86")
    {
        return "Error";
    }else if(code == "87")
    {
        return "Error";
    }else if(code == "88")
    {
        return "Error";
    }else if(code == "89")
    {
        return "Error";
    }else if(code == "90")
    {
        return "Cut-off in progress";
    }else if(code == "91")
    {
        return "Issuer or switch inoperative";
    }else if(code == "92")
    {
        return "Routing error";
    }else if(code == "93")
    {
        return "Violation of law";
    }else if(code == "94")
    {
        return "Duplicate transaction";
    }else if(code == "95")
    {
        return "Reconcile error";
    }else if(code == "96")
    {
        return "System malfunction";
    }else if(code == "97")
    {
        return "Reserved for future Postilion use";
    }else if(code == "98")
    {
        return "Exceeds cash limit";
    }else if(code == "99")
    {
        return "Error";
    }else
    {
        return "Response Unknown";
    }
}

function checkPlease(value)
{
    for(var i=0; i<tids.length; i++){
        if(tids[i].tid === value){
            return true;
        }
    }
    return false;
}

$("#loadOneTidOneWeek").click(function(e){
    if(tids.length < 1)
    {
        swal(
            'Empty!',
            "No Tid Available....",
            'success'
        );
        return;
    }
    $("#loadOneTidOneWeek").text("Please Wait");
    $("#loadOneTidOneWeek").prop("disabled",true);
    swal({
        title: 'Transactions For 7 Days',
        text: "Terminal Id",
		input: 'text',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#800080',
        cancelButtonColor: '#001e33',
        confirmButtonText: 'Fetch'
    }).then(function (result) {
		if (result.value) 
		{
			$('#loadOneTidOneWeek').html('Loading...');
			$('#loadOneTidOneWeek').prop("disabled", true);
			var table = $('#bootstrap-data-table').DataTable({
					"language": {
						"emptyTable": "Please Wait. Loading..."
					},
					"bDestroy": true
			});
            table.clear().draw();
            
            if(role !== "user")
            {
                var td = result.value;
                if(td.length != 8)
                {
                    swal(
                        'Not Authorized!',
                        "Incorrect Tid.",
                        'error'
                    );
                    $('#loadOneTidOneWeek').html('View Tid Last One Week');
					$('#loadOneTidOneWeek').prop("disabled", false);
                    return;
                }else
                {
                    var j = 0;
                    var i = tids.length - 1;
                    for(; i > -1; i--) {
                        if(tids[i].tid === td)
                        {
                            j = 1;
                            break;
                        }
                    }
                    if(j == 0)
                    {
                        swal(
                            'Not Authorized!',
                            "Incorrect Tid.",
                            'error'
                        );
                        $('#loadOneTidOneWeek').html('View Tid Last One Week');
                        $('#loadOneTidOneWeek').prop("disabled", false);
                        return;
                    }
                }
            }
			$.ajax({
				url: "/netop/transaction/getOneWeek/" + result.value,
				async: true,
				dataType: 'json',
				success: function (data) {
					records = data;
					var value = "";
                    if(records.length < 1)
					{
						var table = $('#bootstrap-data-table').DataTable({
								"language": {
									"emptyTable": "No Records Found"
								},
								"bDestroy": true
						});
						table.clear().draw();
						$('#loadOneTidOneWeek').html('View Last One Week');
						$('#loadOneTidOneWeek').prop("disabled", false);
						return;
					}
					
					for (var i = 0; i < records.length; i++) 
					{
						arr = [];
                        arr.push(records[i].terminal_id);
                        arr.push(setResponseCode(records[i].response_code));
                        arr.push(records[i].masked_pan);
                        if(records[i].auth_code) 
                            arr.push(records[i].auth_code);
                        else
                            arr.push("NA");
                        var amt = records[i].amount;
                        var t = parseFloat(amt);
                        var famt = (t).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
                        arr.push("NGN " + famt);
                        var datetime = records[i].date_trans;
                        var dt = "";
                        if(datetime.length == 14)
                            dt = formatDt(datetime);
                        else
                            dt = datetime;
                        arr.push(dt);
                        arr.push("<button onclick=\"gotoView('" + i + "');\" type=\"button\" class=\"btn btn-success\">View</button>" +
                        "<button onclick=\"gotoPrint('" + i + "');\" type=\"button\" class=\"btn btn-success\">Print</button>");
                        if(checkPlease(records[i].terminal_id) === false)
                        {
                            //console.log("Nothing found")
                            continue;
                        }
                        $('#bootstrap-data-table').DataTable().row.add(arr);
					}
					$('#bootstrap-data-table').DataTable().draw();
					$('#loadOneTidOneWeek').html('View Tid Last One Week');
					$('#loadOneTidOneWeek').prop("disabled", false);
				},
				error : function(xhr,errmsg,err) {
					$('#loadOneTidOneWeek').html('Reload Page');
					$('#loadOneTidOneWeek').prop("disabled", false);
					var table = $('#bootstrap-data-table').DataTable({
							"language": {
								"emptyTable": "Please Reload Page."
							},
							"bDestroy": true
					});
					table.clear().draw();
				}
			});
		}else
        {

        }
    });
    $("#loadOneTidOneWeek").text("View Last One Week");
    $("#loadOneTidOneWeek").prop("disabled",false);
});


$("#loadOneTid").click(function(e){
    if(tids.length < 1)
    {
        swal(
            'Empty!',
            "No Tid Available....",
            'success'
        );
        return;
    }
    $("#loadOneTid").text("Please Wait");
    $("#loadOneTid").prop("disabled",true);
    swal({
        title: 'Transactions',
        text: "Terminal Id",
		input: 'text',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#800080',
        cancelButtonColor: '#001e33',
        confirmButtonText: 'Fetch'
    }).then(function (result) {
		if (result.value) 
		{
			$('#loadOneTid').html('Loading...');
			$('#loadOneTid').prop("disabled", true);
			var table = $('#bootstrap-data-table').DataTable({
					"language": {
						"emptyTable": "Please Wait. Loading..."
					},
					"bDestroy": true
			});
            table.clear().draw();
            if(role !== "user")
            {
                var td = result.value;
                if(td.length != 8)
                {
                    swal(
                        'Not Authorized!',
                        "Incorrect Tid.",
                        'error'
                    );
                    $('#loadOneTidOneWeek').html('View Tid Last One Week');
					$('#loadOneTidOneWeek').prop("disabled", false);
                    return;
                }else
                {
                    var j = 0;
                    var i = tids.length - 1;
                    for(; i > -1; i--) {
                        if(tids[i].tid === td)
                        {
                            j = 1;
                            break;
                        }
                    }
                    if(j == 0)
                    {
                        swal(
                            'Not Authorized!',
                            "Incorrect Tid.",
                            'error'
                        );
                        $('#loadOneTidOneWeek').html('View Tid Last One Week');
                        $('#loadOneTidOneWeek').prop("disabled", false);
                        return;
                    }
                }
            }

			$.ajax({
				url: "/netop/transaction/getTidToday/" + result.value,
				async: true,
				dataType: 'json',
				success: function (data) {
					records = data;
					if(records.length < 1)
					{
						var table = $('#bootstrap-data-table').DataTable({
								"language": {
									"emptyTable": "No Records Found"
								},
								"bDestroy": true
						});
						table.clear().draw();
						$('#loadOneTid').html('View Tid Today');
						$('#loadOneTid').prop("disabled", false);
						return;
					}
					for (var i = 0; i < records.length; i++) 
					{
						arr = [];
                        arr.push(records[i].terminal_id);
                        arr.push(setResponseCode(records[i].response_code));
                        arr.push(records[i].masked_pan);
                        if(records[i].auth_code) 
                            arr.push(records[i].auth_code);
                        else
                            arr.push("NA");
                        var amt = records[i].amount;
                        var t = parseFloat(amt);
                        var famt = (t).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
                        arr.push("NGN " + famt);
                        var datetime = records[i].date_trans;
                        var dt = "";
                        if(datetime.length == 14)
                            dt = formatDt(datetime);
                        else
                            dt = datetime;
                        arr.push(dt);
                        arr.push("<button onclick=\"gotoView('" + i + "');\" type=\"button\" class=\"btn btn-success\">View</button>" +
                        "<button onclick=\"gotoPrint('" + i + "');\" type=\"button\" class=\"btn btn-success\">Print</button>");
                        if(checkPlease(records[i].terminal_id) === false)
                        {
                            //console.log("Nothing found")
                            continue;
                        }       
                        $('#bootstrap-data-table').DataTable().row.add(arr);
					}
					$('#bootstrap-data-table').DataTable().draw();
					$('#loadOneTid').html('View Tid Today');
					$('#loadOneTid').prop("disabled", false);
				},
				error : function(xhr,errmsg,err) {
					$('#loadOneTid').html('Reload Page');
					$('#loadOneTid').prop("disabled", false);
					var table = $('#bootstrap-data-table').DataTable({
							"language": {
								"emptyTable": "Please Reload Page."
							},
							"bDestroy": true
					});
					table.clear().draw();
				}
			});
		}else
        {

        }
    });
    $("#loadOneTid").text("View Tid Today");
    $("#loadOneTid").prop("disabled",false);
});

$("#loadallTids").click(function(e){
    if(tids.length < 1)
    {
        swal(
            'Empty!',
            "No Tid Available....",
            'success'
        );
        return;
    }
    $("#loadallTids").text("Please Wait");
    $("#loadallTids").prop("disabled",true);
	var table = $('#bootstrap-data-table').DataTable({
			"language": {
				"emptyTable": "Please Wait. Loading..."
			},
			"bDestroy": true
	});
	table.clear().draw();
	$.ajax({
		url: "/netop/transaction/getAllToday",
		async: true,
		dataType: 'json',
		success: function (data) {
            //console.log(tids);
			records = data;
			if(records.length < 1)
			{
				var table = $('#bootstrap-data-table').DataTable({
						"language": {
							"emptyTable": "No Records Found"
						},
						"bDestroy": true
				});
				table.clear().draw();
				$('#loadallTids').html("Today's Transactions");
				$('#loadallTids').prop("disabled", false);
				return;
			}
			for (var i = 0; i < records.length; i++) 
			{
                arr = [];
				arr.push(records[i].terminal_id);
				arr.push(setResponseCode(records[i].response_code));
				arr.push(records[i].masked_pan);
				if(records[i].auth_code) 
					arr.push(records[i].auth_code);
                else
					arr.push("NA");
				var amt = records[i].amount;
				var t = parseFloat(amt);
				var famt = (t).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
                arr.push("NGN " + famt);
                var datetime = records[i].date_trans;
                var dt = "";
                if(datetime.length == 14)
                    dt = formatDt(datetime);
                else
                    dt = datetime;
                arr.push(dt);
				arr.push("<button onclick=\"gotoView('" + i + "');\" type=\"button\" class=\"btn btn-success\">View</button>" +
                        "<button onclick=\"gotoPrint('" + i + "');\" type=\"button\" class=\"btn btn-success\">Print</button>");
                if(checkPlease(records[i].terminal_id) === false)
                {
                    //console.log("Nothing found")
                    continue;
                }       
                $('#bootstrap-data-table').DataTable().row.add(arr);
			}
			$('#bootstrap-data-table').DataTable().draw();
			$('#loadallTids').html("Today's Transactions");
			$('#loadallTids').prop("disabled", false);
		},
		error : function(xhr,errmsg,err) {
			$('#loadallTids').html('Reload Page');
			$('#loadallTids').prop("disabled", false);
			var table = $('#bootstrap-data-table').DataTable({
					"language": {
						"emptyTable": "Please Reload Page."
					},
					"bDestroy": true
			});
			table.clear().draw();
        }
	});
    $("#loadallTids").text("Today's Transactions");
    $("#loadallTids").prop("disabled",false);
});


function getAllTerminals()
{
    $.ajax({
        type: "GET",
        url : "/netop/transaction/getalltids",
        processData: false,
        contentType: false,

        success : function(json) {
            tids = JSON.parse(json.message);
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
    role = details.role;
    username = details.username;
    getAllTerminals();
});