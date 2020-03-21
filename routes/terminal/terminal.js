var router = express.Router();

router.get("/show", function(req, res)
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
                        return res.status(200).render("terminal/terminal", {details: JSON.stringify(response), role: role, usertype, usertype});
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

router.get("/getalldata", function(req, res)
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
                        var qry2 = "SELECT * FROM terminalconfiguration where ifavailable = $1";
                        pool.query(qry2, ["true"], (err, resul) => {
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

router.delete("/deleteterminals/:id", function(req, res)
{
    try
    {
        var id = req.params.id;
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
                        var qry2 = "DELETE FROM terminalconfiguration where id = $1";
                        pool.query(qry2, [id], (err, resul) => {
                            if (err) 
                            {
                                logger.info("Database Issue. User: " + req.cookies.username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                                res.status(500).send({"status": 500, "message": "Others depend on this."});
                            }else
                            {
                                return res.status(200).send({"status": 200, "message": "Successful Delete."});
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
                                        main = "(accountbank, accountcode, accountname, accountnumber, dialogheading, mcc, tid, mid, " + 
                                        "serialnumber, profileid, terminalmodel, initapplicationversion, merchantname, merchantaddress, " + 
                                        "adminpin, merchantpin, changepin, addedby, ifavailable, contactname, contactphone, email, datecreated, " + 
                                        "namecreated, lga, appname, country, countrycode, maker, profilename, simname, simnumber, " + 
                                        "simserial, terminalmanufacturer, blocked, blockedpin, ptsp, bankusername, bankname, ownerusername, superagent) VALUES ";
    
                                        for(var i = 0; i < ejarr.length; i++)
                                        {
                                            strg += "(";
                                            arrValue.push(ejarr[i].accountbank);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(ejarr[i].accountcode);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(ejarr[i].accountname);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(ejarr[i].accountnumber);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(ejarr[i].dialogheading);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(ejarr[i].mcc);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(ejarr[i].tid);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(ejarr[i].mid);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(ejarr[i].serialnumber);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(ejarr[i].profileid);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(ejarr[i].terminalmodel);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(ejarr[i].initapplicationversion);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(ejarr[i].merchantname);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(ejarr[i].merchantaddress);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(ejarr[i].adminpin);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(ejarr[i].merchantpin);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(ejarr[i].changepin);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(req.cookies.username);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push("false");
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(ejarr[i].contactname);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(ejarr[i].contactphone);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(ejarr[i].email);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(datetime());
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(namecreated);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(ejarr[i].lga);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(ejarr[i].appname);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(ejarr[i].country);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(ejarr[i].countrycode);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(namecreated);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(ejarr[i].profilename);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(ejarr[i].simname);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(ejarr[i].simnumber);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(ejarr[i].simserial);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(ejarr[i].terminalmanufacturer);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(ejarr[i].blocked);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(ejarr[i].blockedpin);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(ejarr[i].ptsp);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(ejarr[i].bankname);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(ejarr[i].bankusername);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(ejarr[i].ownerusername);
                                            strg += "$" + val.toString() + ",";
                                            val++;
                                            arrValue.push(ejarr[i].superagent);
                                            strg += "$" + val.toString();
                                            val++;

                                            if(ejarr[i + 1].tid == "")
                                            {
                                                strg += ")";
                                                break;
                                            }else
                                            {
                                                strg += "),";
                                            }
                                        }
                                        var use = "INSERT INTO terminalconfiguration " + main + strg 
                                            + " ON CONFLICT (tid) DO UPDATE SET accountbank = EXCLUDED.accountbank, accountcode = EXCLUDED.accountcode, " + 
                                            "accountname = EXCLUDED.accountname, accountnumber = EXCLUDED.accountnumber, dialogheading = EXCLUDED.dialogheading, " +
                                            "mcc = EXCLUDED.mcc, mid = EXCLUDED.mid, serialnumber = EXCLUDED.serialnumber," +
                                            "profileid = EXCLUDED.profileid, terminalmodel = EXCLUDED.terminalmodel, initapplicationversion = EXCLUDED.initapplicationversion, " +
                                            "merchantname = EXCLUDED.merchantname, merchantaddress = EXCLUDED.merchantaddress, adminpin = EXCLUDED.adminpin, " +
                                            "merchantpin = EXCLUDED.merchantpin, changepin = EXCLUDED.changepin, contactname = EXCLUDED.contactname, " +
                                            "contactphone = EXCLUDED.contactphone, email = EXCLUDED.email, " +
                                            "lga = EXCLUDED.lga, appname = EXCLUDED.appname, country = EXCLUDED.country, " +
                                            "countrycode = EXCLUDED.countrycode, profilename = EXCLUDED.profilename, simname = EXCLUDED.simname, " +
                                            "simnumber = EXCLUDED.simnumber, simserial = EXCLUDED.simserial, terminalmanufacturer = EXCLUDED.terminalmanufacturer, " +
                                            "blocked = EXCLUDED.blocked, blockedpin = EXCLUDED.blockedpin, ownerusername = EXCLUDED.ownerusername, " +
                                            "superagent = EXCLUDED.superagent, ptsp = EXCLUDED.ptsp, bankname = EXCLUDED.bankname, bankusername = EXCLUDED.bankusername," + 
                                            "maker = EXCLUDED.maker, ifavailable = EXCLUDED.ifavailable, addedby = EXCLUDED.addedby, namemodified = EXCLUDED.namemodified, datemodified = EXCLUDED.datemodified"
                                            + ";";
                                        pool.query(use, arrValue, (err, result) => {
                                            if (err) 
                                            {
                                                logger.info("James: " + err);
                                                var fs = require('fs');
                                                fs.unlinkSync(lnk);
                                                fs.unlinkSync("output.json");
                                                res.status(500).send({"status": 500, "message": "Batch Upload Not Successful."});
                                            }
                                            else
                                            {
                                                var fs = require('fs');
                                                fs.unlinkSync(lnk);
                                                fs.unlinkSync("output.json");
                                                res.status(200).send({"status": 200, "message": "Batch Upload Successful."});
                                            }
                                        });
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
        logger.error("Channels Logo Post could not be served to " + req.clientIp);
        res.status(500).send({"status": 500, "message": "Server Error"});
    }
});

router.post("/show", function(req, res)
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
                        console.log(req.body)
                        var qry2 =
                            "UPDATE terminalconfiguration SET adminpin = $1, changepin = $2, merchantpin = $3, " + 
                            "merchantname = $4, merchantaddress = $5, blocked = $6, blockedpin = $7, ownerusername = $8, ifavailable = $9," + 
                            "datemodified = $10, namemodified = $11, profileid = $12, profilename = $13 WHERE tid = $14";
                        pool.query(qry2, [req.body.adminpin, req.body.changepin, req.body.merchantpin,
                            req.body.merchantname, req.body.merchantaddress, req.body.blocked,
                            req.body.blockedpin, req.body.ownerusername, "false",
                            datetime(), result.rows[0].fullname, req.body.profileid, req.body.profilename, req.body.tid], (err, resul) => {
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


module.exports.router = router;