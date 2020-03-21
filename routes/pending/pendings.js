var router = express.Router();

router.get("/terminals", function(req, res)
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
                        return res.status(200).render("pending/pendingterminal", {details: JSON.stringify(response), role: role, usertype, usertype});
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

router.get("/switchkeys", function(req, res)
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
                        return res.status(200).render("pending/pendingswitchkeys", {details: JSON.stringify(response), role: role, usertype, usertype});
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

router.get("/billers", function(req, res)
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
                        return res.status(200).render("pending/pendingbillers", {details: JSON.stringify(response), role: role, usertype, usertype});
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

router.get("/profile", function(req, res)
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
                        return res.status(200).render("pending/pendingprofile", {details: JSON.stringify(response), role: role, usertype, usertype});
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

router.get("/getoutstanding/:name", function(req, res)
{
    try
    {
        var name = req.params.name;
        console.log(name)
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
                        var qry2 = "SELECT * FROM " + name + " where ifavailable = $1";
                        pool.query(qry2, ["false"], (err, resul) => {
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


router.put("/update/:name/:id", function(req, res)
{
    try
    {
        var id = req.params.id;
        var name = req.params.name;
        console.log(id)
        console.log(name)
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
                        var qry2 = "UPDATE " + name + " SET ifavailable = $1, datemodified = $2, namemodified = $3, checker = $4 WHERE id = $5";
                        pool.query(qry2, ["true", datetime(), result.rows[0].fullname, req.cookies.username, id], (err, resul) => {
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


module.exports.router = router;