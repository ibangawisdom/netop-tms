var router = express.Router();

router.get("/upload", function(req, res)
{
    try
    {
        var str = new Date().toLocaleString();
        var token = req.cookies.token_tcm;
        var username = req.cookies.username;
        try
        {
            var qry = "SELECT * FROM tokens WHERE token = $1 AND username = $2";
            pool.query(qry, [token, username], (err, result) => { 
                if (err) 
                {
                    logger.info("Database connection error: " + err + ". Username: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                    return res.redirect("/");
                }
                else
                {
                    if(result.rows.length !== 1)
                    {
                        logger.info("Incorrect Token Details. User: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                        res.redirect("/");
                    }else
                    {
                        if(result.rows[0].role !== "user")
                        {
                            logger.info("Not authorized for. User: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                            return res.redirect("/netop/dashboard/show");
                        }
                        var response = result.rows[0];
                        var role = response.role;
                        var usertype = response.usertype;
                        logger.info("Spitting out all users to: " + req.clientIp + ". Time: " + new Date().toLocaleString());
                        return res.status(200).render("settlement/upload", {details: JSON.stringify(response), role: role, usertype, usertype});
                    }
                }
            });
        }catch(e)
        {
            logger.info("Token Confirmation Error");
            return res.redirect("/");
        }
    }catch(e)
    {
        logger.info(req.cookies.username + " is not authorize to view URL 3");
        return res.redirect("/");
    }
});

function processQuery(user, details, ejarr)
{
    logger.info("User: " + user);
    logger.info("Details: " + details);
    var qry = "SELECT * FROM terminalconfiguration WHERE tid = $1";
    pool.query(qry, [details.terminal], (err, result) => {
        if (err) 
        {
            logger.info("1. netop Error: " + err);
            return;
        }else
        {
            var username = result.rows[0].ownerusername;
            if(username.length < 2)
                return;
            
            qry = "SELECT * FROM netop_users WHERE username = $1";
            pool.query(qry, [username], (err, result) => {
                if (err) 
                {
                    logger.info("2. netop Error: " + err);
                    return;
                }else
                {
                    var role = result.rows[0].role;
                    logger.info("Role: " + role);
                    //if(role != "agent")
                    //    return;
                    
                    qry = "SELECT * FROM agentaccount WHERE username = $1";
                    pool.query(qry, [username], (err, result) => {
                        if (err) 
                        {
                            logger.info("3. netop Error: " + err);
                            return;
                        }else
                        {
                            //"AMOUNT###BDZSHARE???AGENTSHARE"
                            //"1000###100???30"
                            var balance = result.rows[0].balance;
                            var rules = result.rows[0].txnrules;
                            var n = rules.indexOf("###");
                            var per = rules.slice(0, n);
                            var ss = rules.indexOf("???");
                            var bd = rules.slice(n + 3, ss);
                            var ag = rules.slice(ss + 3);
                            logger.info("Per: " + per);
                            logger.info("Netop Share: " + bd);
                            logger.info("Agent Share: " + ag);
                            logger.info("Settled Amount: " + details.amount);

                            var per = parseFloat(per);
                            var bz = parseFloat(bd);
                            var ag = parseFloat(ag);
                            var cm = bz + ag;
                            var amt = parseFloat(details.amount);
                            
                            var count = parseInt(amt/per);
                            
                            var get = 0;
                            var dag = 0;
                            var dbz = 0;
                            var dtt = 0;
                            for(var i = 0; i < count; i++)
                            {
                                    var j = per + cm;
                                    dag += ag;
                                    dbz += bz;
                                    get += j;
                                    dtt = amt - get;
                                    if(dtt < j)
                                    {
                                        break
                                    }
                            }
                            if(dtt > 0 && role === "agent")
                                dbz = dbz + dtt;
                            
                            logger.info("Agent Share: " + dag);
                            logger.info("Netop Share: " + dbz);
                            var famt = amt - dag - dbz;
                            logger.info("Final Amount: " + famt);

                            var prebalance = balance;      
                            balance = balance - dbz;
                            logger.info(prebalance);
                            logger.info(balance);
                            logger.info(username);
                            var bbs = balance.toString();
                            var pbbs = prebalance.toString();
                            var qry2 =
                                "UPDATE agentaccount SET lastbalance = $1, balance = $2 WHERE username = $3";
                            pool.query(qry2, [pbbs, bbs, username], (err, resul) => {
                                if (err) 
                                {
                                    logger.info("Database Issue. 1");
                                    logger.info(err)
                                    return;
                                }else
                                {
                                    logger.info("Agent Money: " + dag);            
                                    logger.info("Netop Money: " + dbz);
                                    var qry2 =
                                        "UPDATE ejournal SET netop_share = $1, agent_share = $2 WHERE set_rrn = $3 AND set_tid = $4";
                                    pool.query(qry2, [dbz, dag, details.rrn, details.terminal], (err, resul) => {
                                        if (err) 
                                        {
                                            logger.info("Database Issue. 2");
                                            console.log(err)
                                            return;
                                        }else
                                        {
                                            logger.info("Everything went well.. Cheers");
                                            for(var i = 0; i < ejarr.length; i++) {
                                                if(ejarr[i].rrn === details.rrn) {
                                                    if(!ejarr[i + 1].rrn)
                                                    {
                                                        return res.status(200).send({"status": 200, "message": "Update Successful."});
                                                    }else
                                                        return;
                                                }
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}



router.post("/batch", function(req, res)
{
    try
    {
        var qry = "SELECT * FROM tokens WHERE token = $1 AND username = $2";
        pool.query(qry, [req.cookies.token_tcm, req.cookies.username], (err, result) => {
            if (err) 
            {
                logger.info("netop TOKEN CHECK FAILED FOR " + req.clientIp);
                return res.status(500).send({"status": 500, "message": "An Error Occurred. Not Successful."});
            }else
            {
                if(result.rows === undefined || result.rows.length !== 1)
                {
                    logger.info("Kindly login again " + req.clientIp);
                    return res.status(500).send({"status": 500, "message": "Token Issue"});
                }else if(result.rows[0].role !== "user")
                {
                    logger.info(req.headers.username + " not qualified to access endpoint. Client: " + req.clientIp);
                    return res.status(500).send({"status": 500, "message": "Not Qualified to Access Endpoint"});
                }else
                {
                    var date1 = new Date();
                    var date2 = new Date(result.rows[0].timestop);
                    var timeDiff = date1.getTime() - date2.getTime();
                    var dif = timeDiff / 1000;
                    if(dif >= 1)
                    {
                        logger.info("Time out. Please login again. " + req.clientIp);
                        return res.status(500).send({"status": 500, "message": "Time Out. Please Login."});
                    }else
                    {
                        var upload = req.files.upload;
                        var addedby = req.cookies.username;
                        var datecreated = datetime();
                        var namecreated = result.rows[0].fullname;

                        var lnk = path.join(__dirname + '/../../public/batch/' + upload.name);
			            logger.info("File Directory: " + lnk);
                        upload.mv(lnk, function(err) {
                            if(err)
                            {
				                logger.info("File Not Saved.");
                                console.log(err);
                                res.status(500).send({"status": 500, "message": "Batch Upload Not Successful."});
                            }else
                            {
                                var xlsxtojson = require("xlsx-to-json");
			                    logger.info("File Saved.");
                                xlsxtojson({
                                    input: lnk,  // input xls
                                    output: "output.json" // output json
                                }, function(err, result) {
                                    if(err) 
                                    {
					                    logger.info("Xlsx not processing.");
                                        console.log(err);
                                        res.status(500).send({"status": 500, "message": "Batch Upload Not Successful."});
                                    } else 
                                    {
					                    logger.info("Xlsx Processing.");
                                        var ejarr = JSON.parse(JSON.stringify(result));
					                    logger.info("Done with parsing");
                                        arrValue = [];
                                        val = 1;
                                        strg = "";
                                        var output;
                                        ejarr.forEach(element => {
                                            if (element.rrn) 
                                            {
                                                console.log(element);
                                                var qry2 =
                                                    "UPDATE ejournal SET set_rrn = $1, set_merchant = $2, set_tid = $3," + 
                                                    "set_pan = $4, set_amount = $5, set_currency = $6, set_refcode = $7" + 
                                                    " , set_response = $8, set_confirmed = $9, set_uploadby = $10, " + 
                                                    "set_uploadtime = $11, set_already = $12" 
                                                    + " WHERE rrn = $13 AND masked_pan = $14 AND terminal_id = $15 AND set_already IS NULL";
                                                pool.query(qry2, [element.rrn, element.merchant, element.terminal,
                                                    element.pan, element.amount, element.currency, element.refcode,
                                                    element.response, element.status, addedby,
                                                    datetime(), "true", element.rrn, element.pan, element.terminal], (err, resul) => {
                                                    if (err) 
                                                    {
                                                        console.log(err)
                                                        logger.info("Database Issue. User: " + req.cookies.username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                                                        //res.status(500).send({"status": 500, "message": "Cannot Update. Retry Later."});
                                                    }else
                                                    {
                                                        console.log("Proceeding....");
                                                        console.log(resul.rowCount);
                                                        if(resul.rowCount === 1)
                                                        {
                                                            console.log("Proceeding.... 1: " + element.status);
                                                            if(element.status === "Approved")
                                                            {
                                                                console.log("Proceeding.... 2");
                                                                processQuery(addedby, element, ejarr);
                                                            }else
                                                            {
                                                                logger.info("Transaction was not approved. So do not proceed");
                                                                return;
                                                            }
                                                        }else
                                                        {
                                                            console.log("Proceeding.... 3: " + ejarr.length);
                                                            if (element.rrn)
                                                            {
                                                                logger.info("Transaction is not available yet. Device has not sent it");
                                                                for(var i = 0; i < ejarr.length; i++) {
                                                                    if(ejarr[i].rrn === element.rrn) {
                                                                        if(!ejarr[i + 1].rrn)
                                                                        {
                                                                            return res.status(200).send({"status": 200, "message": "Update Successful."});
                                                                        }else
                                                                            return;
                                                                    }
                                                                }
                                                            }else
                                                            {
                                                                return res.status(200).send({"status": 200, "message": "Update Successful."});
                                                            }
                                                        }
                                                    }
                                                });
                                            }else 
                                            {
                                                //return res.status(200).send({"status": 200, "message": "Update Successful."});
                                            }
                                        }); 
                                        
                                        /*
                                        for ( var i = 0; i < ejarr.length ; i++ ) {
                                            tVal = ejarr[i];
                                            if(!ejarr[i].rrn)
                                                break;
                                            (function(val){
                                                console.log(tVal);
                                                var qry2 =
                                                    "UPDATE ejournal SET set_rrn = $1, set_merchant = $2, set_tid = $3," + 
                                                    "set_pan = $4, set_amount = $5, set_currency = $6, set_refcode = $7" + 
                                                    " , set_response = $8, set_confirmed = $9, set_uploadby = $10, " + 
                                                    "set_uploadtime = $11, set_already = $12" 
                                                    + " WHERE rrn = $13 AND masked_pan = $14 AND terminal_id = $15 AND set_already IS NULL";
                                                pool.query(qry2, [tVal.rrn, tVal.merchant, tVal.terminal,
                                                    tVal.pan, tVal.amount, tVal.currency, tVal.refcode,
                                                    tVal.response, tVal.status, addedby,
                                                    datetime(), "true", tVal.rrn, tVal.pan, tVal.terminal], (err, resul) => {
                                                    if (err) 
                                                    {
                                                        console.log(err)
                                                        logger.info("Database Issue. User: " + req.cookies.username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                                                        return res.status(500).send({"status": 500, "message": "Cannot Update. Retry Later."});
                                                    }else
                                                    {
                                                        console.log("Proceeding....");
                                                        if(resul.rowCount === 1)
                                                        {
                                                            console.log("Proceeding.... 1: " + ejarr[i].status);
                                                            if(ejarr[i].status === "Approved")
                                                            {
                                                                console.log("Proceeding.... 2");
                                                                processQuery(addedby, ejarr[i]);
                                                            }else
                                                                logger.info("Transaction was not approved. So do not proceed");
                                                        }else
                                                        {
                                                            console.log("Proceeding.... 3");
                                                            if (ejarr[i].rrn)
                                                            {
                                                                logger.info("Transaction is not available yet. Device has not sent it");
                                                            }else
                                                            {
                                                                //return res.status(200).send({"status": 200, "message": "Update Successful."});
                                                            }
                                                        }
                                                    }
                                                });
                                            })(tVal);
                                        }*/

                                    }
                                });
                            }
                        });
                    }
                }
            }
        });
    }catch(e)
    {
        logger.error("Settlement Batch Post could not be served to " + req.clientIp);
        //res.status(500).send({"status": 500, "message": "Server Error"});
    }
});

router.get("/agent", function(req, res)
{
    try
    {
        var str = new Date().toLocaleString();
        var token = req.cookies.token_tcm;
        var username = req.cookies.username;
        try
        {
            var qry = "SELECT * FROM tokens WHERE token = $1 AND username = $2";
            pool.query(qry, [token, username], (err, result) => { 
                if (err) 
                {
                    logger.info("Database connection error: " + err + ". Username: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                    return res.redirect("/");
                }
                else
                {
                    if(result.rows.length !== 1)
                    {
                        logger.info("Incorrect Token Details. User: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                        res.redirect("/");
                    }else
                    {
                        if(result.rows[0].role !== "user")
                        {
                            logger.info("Not authorized for. User: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                            return res.redirect("/netop/dashboard/show");
                        }
                        var response = result.rows[0];
                        var role = response.role;
                        var usertype = response.usertype;
                        logger.info("Spitting out all users to: " + req.clientIp + ". Time: " + new Date().toLocaleString());
                        return res.status(200).render("settlement/allagent", {details: JSON.stringify(response), role: role, usertype, usertype});
                    }
                }
            });
        }catch(e)
        {
            logger.info("Token Confirmation Error");
            return res.redirect("/");
        }
    }catch(e)
    {
        logger.info(req.cookies.username + " is not authorize to view URL 3");
        return res.redirect("/");
    }
});

router.get("/getallagents", function(req, res)
{
    try
    {
        var str = new Date().toLocaleString();
        var token = req.cookies.token_tcm;
        var username = req.cookies.username;
        try
        {
            var qry = "SELECT * FROM tokens WHERE token = $1 AND username = $2";
            pool.query(qry, [token, username], (err, result) => { 
                if (err) 
                {
                    logger.info("Database connection error: " + err + ". Username: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                    return res.status(500).send({"status": 500, "message": "An Error Occurred. Not Successful."});
                }
                else
                {
                    if(result.rows.length !== 1)
                    {
                        logger.info("Incorrect Token Details. User: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                        return res.status(500).send({"status": 500, "message": "An Error Occurred. Not Successful."});
                    }else
                    {
                        if(result.rows[0].role !== "user")
                        {
                            logger.info("Not authorized for. User: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                            return res.status(500).send({"status": 500, "message": "An Error Occurred. Not Authorized."});
                        }
                        var qry2 = "SELECT * FROM agentaccount where typeofuser = $1";
                        pool.query(qry2, ["agent"], (err, resul) => {
                            if (err) 
                            {
                                logger.info("Database Issue. User: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                                res.status(500).send({"status": 500, "message": "Cannot Signup. Retry Later."});
                            }else
                            {
                                return res.status(200).send({"status": 200, "message": JSON.stringify(resul.rows)});
                            }
                        });
                    }
                }
            });
        }catch(e)
        {
            logger.info("Token Confirmation Error");
            return res.status(500).send({"status": 500, "message": "An Error Occurred. Token Issue."});
        }
    }catch(e)
    {
        logger.info(req.cookies.username + " is not authorize to view URL 3");
        return res.status(500).send({"status": 500, "message": "An Error Occurred. Not Authorized."});
    }
});

router.delete("/deleteagent/:username/:status", function(req, res)
{
    try
    {
        var username = req.params.username;
        var status = req.params.status;
        var qry = "SELECT * FROM tokens WHERE token = $1 AND username = $2";
        pool.query(qry, [req.cookies.token_tcm, req.cookies.username], (err, result) => {
            if (err) 
            {
                logger.info("netop TOKEN CHECK FAILED FOR " + req.clientIp);
                return res.status(500).send({"status": 500, "message": "An Error Occurred. Not Successful."});
            }else
            {
                if(result.rows === undefined || result.rows.length !== 1)
                {
                    logger.info("Kindly login again " + req.clientIp);
                    return res.status(500).send({"status": 500, "message": "Token Issue"});
                }else if(result.rows[0].role !== "user")
                {
                    logger.info(req.headers.username + " not qualified to access endpoint. Client: " + req.clientIp);
                    return res.status(500).send({"status": 500, "message": "Not Qualified to Access Endpoint"});
                }else
                {
                    var date1 = new Date();
                    var date2 = new Date(result.rows[0].timestop);
                    var timeDiff = date1.getTime() - date2.getTime();
                    var dif = timeDiff / 1000;
                    if(dif >= 1)
                    {
                        logger.info("Time out. Please login again. " + req.clientIp);
                        return res.status(500).send({"status": 500, "message": "Time Out. Please Login."});
                    }else
                    {
                        var qry2 =
                            "UPDATE terminalconfiguration SET blocked = $1, blockedpin = $2 WHERE ownerusername = $3";
                        pool.query(qry2, [status, "9854", username], (err, resul) => {
                            if (err) 
                            {
                                console.log(err)
                                logger.info("Database Issue. User: " + req.cookies.username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                                res.status(500).send({"status": 500, "message": "Cannot Update. Retry Later."});
                            }else
                            {
                                var qry2 =
                                    "UPDATE agentaccount SET blocked = $1 WHERE username = $2";
                                pool.query(qry2, [status, username], (err, resul) => {
                                    if (err) 
                                    {
                                        console.log(err)
                                        logger.info("Database Issue. User: " + req.cookies.username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                                        res.status(500).send({"status": 500, "message": "Cannot Update. Retry Later."});
                                    }else
                                    {
                                        return res.status(200).send({"status": 200, "message": "Update Successful."});
                                    }
                                });
                            }
                        });
                    }
                }
            }
        });
    }catch(e)
    {
        logger.info(e);
        logger.info("Having Issues with User Delete " + req.clientIp);
        res.status(500).send({"status": 500, "message": "Runtime error occurred. Try Later."});
    }
});

router.post("/saveagent", function(req, res)
{
    try
    {
        var qry = "SELECT * FROM tokens WHERE token = $1 AND username = $2";
        pool.query(qry, [req.cookies.token_tcm, req.cookies.username], (err, result) => {
            if (err) 
            {
                logger.info("netop TOKEN CHECK FAILED FOR " + req.clientIp);
                return res.status(500).send({"status": 500, "message": "An Error Occurred. Not Successful."});
            }else
            {
                //if(result.rows.length !== 1)
                if(result.rows === undefined || result.rows.length !== 1)
                {
                    logger.info("Kindly login again " + req.clientIp);
                    return res.status(500).send({"status": 500, "message": "Token Issue"});
                }else if(result.rows[0].role !== "user")
                {
                    logger.info(req.headers.username + " not qualified to access endpoint. Client: " + req.clientIp);
                    return res.status(500).send({"status": 500, "message": "Not Qualified to Access Endpoint"});
                }else
                {
                    var date1 = new Date();
                    var date2 = new Date(result.rows[0].timestop);
                    var timeDiff = date1.getTime() - date2.getTime();
                    var dif = timeDiff / 1000;
                    if(dif >= 1)
                    {
                        logger.info("Time out. Please login again. " + req.clientIp);
                        return res.status(500).send({"status": 500, "message": "Time Out. Please Login."});
                    }else
                    {
                        var qry2 =
                            "UPDATE agentaccount SET username = $1, txnrules = $2, lastbalance = $3, balance = $4, " + 
                            "blocked = $5 WHERE id = $6";
                        pool.query(qry2, [req.body.username, req.body.txnrules, req.body.lastbalance,
                            req.body.balance, req.body.blocked, req.body.id], (err, resul) => {
                            if (err) 
                            {
                                console.log(err)
                                logger.info("Database Issue. User: " + req.cookies.username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                                res.status(500).send({"status": 500, "message": "Cannot Update. Retry Later."});
                            }else
                            {
                                return res.status(200).send({"status": 200, "message": "Update Successful."});
                            }
                        });
                    }
                }
            }
        });
    }catch(e)
    {
        logger.info(e);
        logger.info("Having Issues with User Delete " + req.clientIp);
        res.status(500).send({"status": 500, "message": "Runtime error occurred. Try Later."});
    }
});

router.get("/merchant", function(req, res)
{
    try
    {
        var str = new Date().toLocaleString();
        var token = req.cookies.token_tcm;
        var username = req.cookies.username;
        try
        {
            var qry = "SELECT * FROM tokens WHERE token = $1 AND username = $2";
            pool.query(qry, [token, username], (err, result) => { 
                if (err) 
                {
                    logger.info("Database connection error: " + err + ". Username: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                    return res.redirect("/");
                }
                else
                {
                    if(result.rows.length !== 1)
                    {
                        logger.info("Incorrect Token Details. User: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                        res.redirect("/");
                    }else
                    {
                        if(result.rows[0].role !== "user")
                        {
                            logger.info("Not authorized for. User: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                            return res.redirect("/netop/dashboard/show");
                        }
                        var response = result.rows[0];
                        var role = response.role;
                        var usertype = response.usertype;
                        logger.info("Spitting out all users to: " + req.clientIp + ". Time: " + new Date().toLocaleString());
                        return res.status(200).render("settlement/allmerchant", {details: JSON.stringify(response), role: role, usertype, usertype});
                    }
                }
            });
        }catch(e)
        {
            logger.info("Token Confirmation Error");
            return res.redirect("/");
        }
    }catch(e)
    {
        logger.info(req.cookies.username + " is not authorize to view URL 3");
        return res.redirect("/");
    }
});

router.get("/getallmerchants", function(req, res)
{
    try
    {
        var str = new Date().toLocaleString();
        var token = req.cookies.token_tcm;
        var username = req.cookies.username;
        try
        {
            var qry = "SELECT * FROM tokens WHERE token = $1 AND username = $2";
            pool.query(qry, [token, username], (err, result) => { 
                if (err) 
                {
                    logger.info("Database connection error: " + err + ". Username: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                    return res.status(500).send({"status": 500, "message": "An Error Occurred. Not Successful."});
                }
                else
                {
                    if(result.rows.length !== 1)
                    {
                        logger.info("Incorrect Token Details. User: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                        return res.status(500).send({"status": 500, "message": "An Error Occurred. Not Successful."});
                    }else
                    {
                        if(result.rows[0].role !== "user")
                        {
                            logger.info("Not authorized for. User: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                            return res.status(500).send({"status": 500, "message": "An Error Occurred. Not Authorized."});
                        }
                        var qry2 = "SELECT * FROM agentaccount where typeofuser = $1";
                        pool.query(qry2, ["merchant"], (err, resul) => {
                            if (err) 
                            {
                                logger.info("Database Issue. User: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                                res.status(500).send({"status": 500, "message": "Cannot Signup. Retry Later."});
                            }else
                            {
                                return res.status(200).send({"status": 200, "message": JSON.stringify(resul.rows)});
                            }
                        });
                    }
                }
            });
        }catch(e)
        {
            logger.info("Token Confirmation Error");
            return res.status(500).send({"status": 500, "message": "An Error Occurred. Token Issue."});
        }
    }catch(e)
    {
        logger.info(req.cookies.username + " is not authorize to view URL 3");
        return res.status(500).send({"status": 500, "message": "An Error Occurred. Not Authorized."});
    }
});

router.get("/all", function(req, res)
{
    try
    {
        var str = new Date().toLocaleString();
        var token = req.cookies.token_tcm;
        var username = req.cookies.username;
        try
        {
            var qry = "SELECT * FROM tokens WHERE token = $1 AND username = $2";
            pool.query(qry, [token, username], (err, result) => { 
                if (err) 
                {
                    logger.info("Database connection error: " + err + ". Username: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                    return res.redirect("/");
                }
                else
                {
                    if(result.rows.length !== 1)
                    {
                        logger.info("Incorrect Token Details. User: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                        res.redirect("/");
                    }else
                    {
                        var response = result.rows[0];
                        var role = response.role;
                        var usertype = response.usertype;
                        logger.info("Spitting out all users to: " + req.clientIp + ". Time: " + new Date().toLocaleString());
                        return res.status(200).render("settlement/all", {details: JSON.stringify(response), role: role, usertype, usertype});
                    }
                }
            });
        }catch(e)
        {
            logger.info("Token Confirmation Error");
            return res.redirect("/");
        }
    }catch(e)
    {
        logger.info(req.cookies.username + " is not authorize to view URL 3");
        return res.redirect("/");
    }
});

router.get("/viewbalance", function(req, res)
{
    try
    {
        var str = new Date().toLocaleString();
        var token = req.cookies.token_tcm;
        var username = req.cookies.username;
        try
        {
            var qry = "SELECT * FROM tokens WHERE token = $1 AND username = $2";
            pool.query(qry, [token, username], (err, result) => { 
                if (err) 
                {
                    logger.info("Database connection error: " + err + ". Username: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                    return res.status(500).send({"status": 500, "message": "An Error Occurred. Not Successful."});
                }
                else
                {
                    if(result.rows.length !== 1)
                    {
                        logger.info("Incorrect Token Details. User: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                        return res.status(500).send({"status": 500, "message": "An Error Occurred. Not Successful."});
                    }else
                    {
                        var qry2 = "SELECT * FROM agentaccount where username = $1";
                        pool.query(qry2, [username], (err, resul) => {
                            if (err) 
                            {
                                logger.info("Database Issue. User: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                                res.status(500).send({"status": 500, "message": "Cannot Signup. Retry Later."});
                            }else
                            {
                                return res.status(200).send({"status": 200, "message": JSON.stringify(resul.rows)});
                            }
                        });
                    }
                }
            });
        }catch(e)
        {
            logger.info("Token Confirmation Error");
            return res.status(500).send({"status": 500, "message": "An Error Occurred. Token Issue."});
        }
    }catch(e)
    {
        logger.info(req.cookies.username + " is not authorize to view URL 3");
        return res.status(500).send({"status": 500, "message": "An Error Occurred. Not Authorized."});
    }
});




module.exports.router = router;