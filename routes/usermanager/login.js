var router = express.Router();

router.get("/user", function(req, res)
{
    try
    {
        res.clearCookie('token_tcm');
        res.clearCookie('username');
        logger.info("Spitting out user login to: " + req.clientIp + ". Time: " + new Date().toLocaleString());
        res.status(200).render("login/userlogin", {})
    }catch(e)
    {
        logger.info("User login could not be served to " + req.clientIp);
        res.redirect("/");
    };
});

router.get("/admin", function(req, res)
{
    try
    {
        res.clearCookie('token_tcm');
        res.clearCookie('username');
        logger.info("Spitting out login to: " + req.clientIp + ". Time: " + new Date().toLocaleString());
        res.status(200).render("login/adminlogin", {})
    }catch(e)
    {
        logger.info("Home could not be served to " + req.clientIp);
        res.redirect("/");
    };
});

router.get("/merchant", function(req, res)
{
    try
    {
        res.clearCookie('token_tcm');
        res.clearCookie('username');
        logger.info("Spitting out login to: " + req.clientIp + ". Time: " + new Date().toLocaleString());
        res.status(200).render("login/merchantlogin", {})
    }catch(e)
    {
        logger.info("Home could not be served to " + req.clientIp);
        res.redirect("/");
    };
});

router.get("/agent", function(req, res)
{
    try
    {
        res.clearCookie('token_tcm');
        res.clearCookie('username');
        logger.info("Spitting out login to: " + req.clientIp + ". Time: " + new Date().toLocaleString());
        res.status(200).render("login/agentlogin", {})
    }catch(e)
    {
        logger.info("Home could not be served to " + req.clientIp);
        res.redirect("/");
    };
});

router.get("/recover", function(req, res)
{
    try
    {
        res.clearCookie('token_tcm');
        res.clearCookie('username');
        logger.info("Spitting out password recovery to: " + req.clientIp + ". Time: " + new Date().toLocaleString());
        res.status(200).render("login/recovery", {});
    }catch(e)
    {
        logger.info("Recovery could not be served to " + req.clientIp);
        res.redirect("/");
    }
});

router.post("/verify", function(req, res)
{
    var str = new Date().toLocaleString();
    var username = req.body.username;
    var password = req.body.password;
    var usertype = req.body.usertype;
    var count = req.body.count; //Used to track login time
    if((username.length < 1 || username.length > 100) || (password.length < 1 || password.length > 100))
    {
        logger.info("Wrong Login Params: " + JSON.stringify(req.body));
        return res.status(500).send({"status": 500, "message": "Wrong Parameters."});
    }

    try
    {
        if(count > 3)
        {
            //Block User
            logger.info(username + " has been blocked");
            const query =
                "UPDATE netop_users SET status = $1, blockedreason = $2"
                + " WHERE username = $3 AND role = $4";
            pool.query(query, ["blocked", "Provided Wrong Login Details For 3 Times", username, usertype], (err,  results) => {    
                if (err) 
                {
                    logger.info("Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                    return res.status(500).send({"status": 500, "message": "Cannot login."});
                }
                else
                {
                    logger.info("netop Block Success. Ip: " + req.clientIp + "  " + new Date().toLocaleString() + ". For: " + username);
                    return res.status(500).send({"status": 400, "message": "You have been Blocked. Contact Admin"});
                }
            });
        }else
        {
            logger.info("netop Login By: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
            var qry = "SELECT * FROM netop_users WHERE username = $1";
            pool.query(qry, [username], (err, result) => { 
            //var qry = "SELECT * FROM netop_users WHERE username = $1 AND role = $2";
            //pool.query(qry, [username, usertype], (err, result) => { 
                if (err) 
                {
                    logger.info("Database connection error: " + err + ". Username: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                    res.status(500).send({"status": 500, "message": "Incorrect Login Details."});
                }
                else
                {
                    if(result.rows === undefined || result.rows.length == 0)
                    {
                        logger.info("USER: Incorrect Login Details. User: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                        res.status(500).send({"status": 500, "message": "Incorrect Login Details."});
                    }else
                    {
                        if(password === decryptData(result.rows[0].password, passworddb))
                        {
                            if(result.rows[0].status !== "active"
                                || result.rows[0].approved === "false")
                            {
                                logger.info("Contact Admin. You have been blocked: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                                return res.status(500).send({"status": 500, "message": "Unauthorized User. Contact Admin."});
                            }
                            var qry2 = "DELETE FROM tokens WHERE username = $1";
                            pool.query(qry2, [username], (err, result2) => {
                                if (err) 
                                {
                                    logger.info("Token User Database Issue " + req.clientIp + ". Time" +  new Date().toLocaleString() + ". For: " + username);
                                    return res.status(500).send({"status": 500, "message": "Login Not Successful."});
                                }else
                                {
                                    var dt = new Date();
                                    var startDate = dt.toLocaleString();
                                    var endDate = new Date(dt.getTime() + 120*60000).toLocaleString();
                                    var parse = username + ":" + Math.floor((Math.random() * 100000000) + 1) + ":" + dt.toLocaleString();
                                    var token = encryptData(parse, passwordtoken);
                                    var qry2 = "INSERT INTO tokens (username, token, timestart, timestop, fullname, role, justset, email, usertype) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)";
                                    pool.query(qry2, [username, token, startDate, endDate, result.rows[0].fullname, 
                                        result.rows[0].role, result.rows[0].justset, result.rows[0].email, result.rows[0].usertype], (err, resul) => {
                                        if (err) 
                                        {
                                            logger.info("Database Issue. User: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                                            res.status(500).send({"status": 500, "message": "Cannot login."});
                                        }else
                                        {
                                            var mailOptions = {
                                                from: emailHeading, // sender address
                                                to: [result.rows[0].email], // list of receivers
                                                subject: "netop NOTIFICATION", // Subject line
                                                text: "SUCCESSFUL LOGIN", // plain text body with html format
                                            };
                                                
                                            transporter.sendMail(mailOptions, function(error, info){
                                                if (error) {
                                                    logger.info(error);
                                                } else {
                                                    logger.info('Email sent: ' + info.response);
                                                }
                                            });

                                            let options = {
                                                maxAge: 1000 * 60 * 120, // would expire after 120 minutes
                                                //httpOnly: true, // The cookie only accessible by the web server
                                                //signed: true // Indicates if the cookie should be signed
                                            }

                                            res.cookie('token_tcm', token, options);
                                            res.cookie('username', username, options);
                                            res.status(200).send({status: 200, message: "Login Success."});
                                        }
                                    });
                                }
                            });
                        }else
                        {
                            logger.info("Incorrect Login Details. User: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                            res.status(500).send({"status": 500, "message": "Incorrect Login Details."});
                        }
                    }
                }
            });
        }
    }catch(e)
    {
        logger.info("Login Error");
        res.status(500).send({"status": 500, "message": "Server Error. Retry Later"});
    }
});

router.post("/forgetpassword", function(req, res)
{
    try
    {
		var qry = "SELECT * FROM netop_users WHERE email = $1";
		pool.query(qry, [req.body.email], (err, result) => { 
			if (err) 
			{
				logger.info("Database connection error: " + err + ". Email: " + req.body.email + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
				res.status(500).send({"status": 500, "message": "An error occurred."});
			}
			else
			{
                if(result.rows === undefined || result.rows.length !== 1)
				{
					logger.info("Email Address does not exist. " + req.clientIp);
					return res.status(500).send({"status": 500, "message": "Email Address does not exist."});
				}else
				{
                    var username = result.rows[0].username;
					var password = decryptData(result.rows[0].password, passworddb);
					var mailOptions = {
						from: emailHeading, // sender address
						to: [req.body.email], // list of receivers
						subject: "netop PASSWORD RESET", // Subject line
						text: "LOGIN DETAILS\n\n" + "Your Username: " + username
						+ "\nYour Password: " + password +
						"\nEndeavour to change your password immediately.", // plain text body with html format
					};  
					transporter.sendMail(mailOptions, function(error, info){
						if (error) {
							logger.info(error);
						} else {
							logger.info('Email sent: ' + info.response);
						}
                    });
                    return res.status(200).send({"status": 200, "message": "Password Recovery Successful."});
				}
			}
		});
	}catch(e)
    {
        logger.info(e);
        logger.info("Having Issues with Password Recovery " + req.clientIp);
        res.status(500).send({"status": 500, "message": "Runtime error occurred. Try Later."});
    }
});

router.all("*", function(req, res)
{
    logger.info("In login No route");
    logger.info(req.url);
    logger.info("Wrong URL. Redirecting to home. From: " + req.clientIp + ". Time: " + new Date().toLocaleString());
    res.redirect("/");
});

module.exports.router = router;