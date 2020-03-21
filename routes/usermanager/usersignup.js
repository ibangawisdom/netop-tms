var router = express.Router();

router.get("/user", function(req, res)
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
                        if(result.rows[0].role !== "admin")
                        {
                            logger.info("Not authorized for. User: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                            return res.redirect("/netop/dashboard/show");
                        }
                        var response = result.rows[0];
                        var role = response.role;
                        var usertype = response.usertype;
                        logger.info("Spitting out new user to: " + req.clientIp + ". Time: " + new Date().toLocaleString());
                        return res.status(200).render("user/usersignup", {details: JSON.stringify(response), role: role, usertype, usertype});
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

router.post("/user", function(req, res)
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
                }else if(result.rows[0].role !== "admin")
                {
                    logger.info(req.cookies.username + " not qualified to access endpoint. Client: " + req.clientIp);
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
                        var qry2 = "INSERT INTO netop_users " + 
                        "(fullname, username, addedby, role, email, status, password, " + 
                        "justset, usertype, approved, approvedby, datecreated, namecreated, bankname) " + 
                        "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)";
                        pool.query(qry2, [req.body.fullname, req.body.username, req.cookies.username, 
                            req.body.role, req.body.email, "active", 
                            encryptData(req.body.password, passworddb), "true", req.body.usertype, 
                            "true", "netop", new Date().toLocaleString(), result.rows[0].fullname, req.body.bankname], (err, resul) => {
                            if (err) 
                            {
                                logger.info("Database Issue. User: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                                res.status(500).send({"status": 500, "message": "Cannot Signup. Retry Later."});
                            }else
                            {
                                if(req.body.role === "agent")
                                {
                                    var qry2 = "INSERT INTO agentaccount " + 
                                        "(username, lastbalance, balance, lastmodifiedby, blocked, txnrules, typeofuser) " + 
                                        "VALUES ($1, $2, $3, $4, $5, $6, $7)";
                                    pool.query(qry2, [req.body.username, "0.00", "0.00",
                                        req.cookies.username, "false", "1000###70???30", "agent"], (err, resul) => {
                                        if (err) 
                                        {
                                            logger.info("Database Issue. User: " + req.cookies.username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                                            res.status(500).send({"status": 500, "message": "Cannot Signup. Retry Later."});
                                        }else
                                        {
                                            logger.info("Agent Setup successfully.....");
                                        }
                                    });
                                }else if(req.body.role === "merchant")
                                {
                                    var qry2 = "INSERT INTO agentaccount " + 
                                        "(username, lastbalance, balance, lastmodifiedby, blocked, txnrules, typeofuser) " + 
                                        "VALUES ($1, $2, $3, $4, $5, $6, $7)";
                                    pool.query(qry2, [req.body.username, "0.00", "0.00",
                                        req.cookies.username, "false", "1000###0???0", "merchant"], (err, resul) => {
                                        if (err) 
                                        {
                                            logger.info("Database Issue. User: " + req.cookies.username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                                            res.status(500).send({"status": 500, "message": "Cannot Signup. Retry Later."});
                                        }else
                                        {
                                            logger.info("Agent Setup successfully.....");
                                        }
                                    });
                                }
                                var mailOptions = {
                                    from: emailHeading, // sender address
                                    to: [req.body.email], // list of receivers
                                    subject: "netop NOTIFICATION", // Subject line
                                    text: "SUCCESSFUL SIGNUP\n\n" + "Your Username: " + req.body.username
                                    + "\nYour Password: " + req.body.password +
                                    "\nEndeavour to change your password immediately.", // plain text body with html format
                                };
                                    
                                transporter.sendMail(mailOptions, function(error, info){
                                    if (error) {
                                        logger.info(error);
                                    } else {
                                        logger.info('Email sent: ' + info.response);
                                    }
                                });
                                return res.status(200).send({"status": 200, "message": "Successful Signup."});
                            }
                        });
                    }
                }
            }
        });
    }catch(e)
    {
        logger.info(e);
        logger.info("Having Issues with User Signup " + req.clientIp);
        res.status(500).send({"status": 500, "message": "Runtime error occurred. Try Later."});
    }
});

router.get("/admin", function(req, res)
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
                        if(result.rows[0].role !== "admin")
                        {
                            logger.info("Not authorized for. User: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                            return res.redirect("/netop/dashboard/show");
                        }
                        var response = result.rows[0];
                        var role = response.role;
                        var usertype = response.usertype;
                        logger.info("Spitting out new user to: " + req.clientIp + ". Time: " + new Date().toLocaleString());
                        return res.status(200).render("user/adminsignup", {details: JSON.stringify(response), role: role, usertype, usertype});
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

router.post("/admin", function(req, res)
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
                }else if(result.rows[0].role !== "admin")
                {
                    logger.info(req.cookies.username + " not qualified to access endpoint. Client: " + req.clientIp);
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
                        var qry2 = "INSERT INTO netop_users " + 
                        "(fullname, username, addedby, role, email, status, password, " + 
                        "justset, usertype, approved, approvedby, datecreated, namecreated) " + 
                        "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)";
                        pool.query(qry2, [req.body.fullname, req.body.username, req.cookies.username, 
                            "admin", req.body.email, "active", 
                            encryptData(req.body.password, passworddb), "true", "", 
                            "true", "netop", new Date().toLocaleString(), result.rows[0].fullname], (err, resul) => {
                            if (err) 
                            {
                                logger.info("Database Issue. User: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                                res.status(500).send({"status": 500, "message": "Cannot Signup. Retry Later."});
                            }else
                            {
                                var mailOptions = {
                                    from: emailHeading, // sender address
                                    to: [req.body.email], // list of receivers
                                    subject: "netop NOTIFICATION", // Subject line
                                    text: "SUCCESSFUL SIGNUP\n\n" + "Your Username: " + req.body.username
                                    + "\nYour Password: " + req.body.password +
                                    "\nEndeavour to change your password immediately.", // plain text body with html format
                                };
                                    
                                transporter.sendMail(mailOptions, function(error, info){
                                    if (error) {
                                        logger.info(error);
                                    } else {
                                        logger.info('Email sent: ' + info.response);
                                    }
                                });
                                return res.status(200).send({"status": 200, "message": "Successful Signup."});
                            }
                        });
                    }
                }
            }
        });
    }catch(e)
    {
        logger.info(e);
        logger.info("Having Issues with User Signup " + req.clientIp);
        res.status(500).send({"status": 500, "message": "Runtime error occurred. Try Later."});
    }
});

module.exports.router = router;