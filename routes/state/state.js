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
                        var response = result.rows[0];
                        var role = response.role;
                        var usertype = response.usertype;
                        logger.info("Spitting out all users to: " + req.clientIp + ". Time: " + new Date().toLocaleString());
                        return res.status(200).render("state/state", {details: JSON.stringify(response), role: role, usertype, usertype});
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

router.get("/getalltids", function(req, res)
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
                        var qry2;
                        if(result.rows[0].role === "user")
                        {
                            console.log("USERS");
                            qry2 = "SELECT * FROM terminalconfiguration";
                        }else
                        {
                            var rr = result.rows[0].role;
                            console.log(rr);
                            if(rr === "merchant")
                                qry2 = "SELECT * FROM terminalconfiguration where ownerusername = '" + username + "'";
                            else if(rr === "agent")
                                qry2 = "SELECT * FROM terminalconfiguration where ownerusername = '" + username + "'";
                            else if(rr === "subagent")
                                qry2 = "SELECT * FROM terminalconfiguration where ownerusername = '" + username + "'";
                            else if(rr === "ptsp")
                                qry2 = "SELECT * FROM terminalconfiguration where ptsp = '" + username + "'";
                            else if(rr === "bank")
                                qry2 = "SELECT * FROM terminalconfiguration where bankusername = '" + username + "'";
                            else
                                qry2 = "SELECT * FROM terminalconfiguration where ownerusername = '" + username + "'";
                        }
                        pool.query(qry2, (err, resul) => {
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

function formatDate(date) 
{
    var year = date.getFullYear().toString();
    var month = (date.getMonth() + 101).toString().substring(1);
    var day = (date.getDate() + 100).toString().substring(1);
    return year + "-" + month + "-" + day;
}

function formatDateOneWeek() 
{
	var date = new Date();
	date.setDate(date.getDate() - 7);
    var year = date.getFullYear().toString();
    var month = (date.getMonth() + 101).toString().substring(1);
    var day = (date.getDate() + 100).toString().substring(1);
    return year + "-" + month + "-" + day;
}

router.get("/getOneWeek/:tid", function(req, res)
{
    req.socket.setKeepAlive();
    var str = new Date().toLocaleString();
    var token = req.cookies.token_tcm;
    var username = req.cookies.username;
    var tid = req.params.tid.toUpperCase();
    try
    {
        var qry = "SELECT * FROM tokens WHERE token = $1 AND username = $2";
        pool.query(qry, [token, username], (err, result) => { 
            if (err) 
            {
                logger.info("Database connection error: " + err + ". Username: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                return res.status(500).send([]);
            }
            else
            {
                if(result.rows.length !== 1)
                {
                    logger.info("Incorrect Token Details. User: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                    return res.status(500).send([]);
                }else
                {
                    if(tid == null)
                        return res.status(500).send([]);	
                    if(tid.length != 8)
                        return res.status(500).send([]);
                    
                    var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
                    if(format.test(tid))
                    {
                        return res.status(200).send([]);
                    }
                    const txn = "SELECT * FROM terminal_state " + 
                        "WHERE terminal_id = '" + tid + "' AND " + 
                        "current_date_uzoezi >= " + "to_date('" + formatDateOneWeek() + "','YYYY-MM-DD') AND " +
                        "current_date_uzoezi <= " + "to_date('" + formatDate(new Date()) + "','YYYY-MM-DD')";
                    pool.query(txn, (err,  comms) => {    
                        if (err) 
                        {
                            logger.info("Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                            return res.status(500).send([]);
                        }
                        else
                        {
                            logger.info("All Terminals Successfully saved to " + req.clientIp + "  " + new Date().toLocaleString());
                            res.status(200).send(JSON.stringify(comms.rows));									
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
});

router.get("/getTidToday/:tid", function(req, res)
{
    req.socket.setKeepAlive();
    var str = new Date().toLocaleString();
    var token = req.cookies.token_tcm;
    var username = req.cookies.username;
    var tid = req.params.tid.toUpperCase();
    try
    {
        var qry = "SELECT * FROM tokens WHERE token = $1 AND username = $2";
        pool.query(qry, [token, username], (err, result) => { 
            if (err) 
            {
                logger.info("Database connection error: " + err + ". Username: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                return res.status(500).send([]);
            }
            else
            {
                if(result.rows.length !== 1)
                {
                    logger.info("Incorrect Token Details. User: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                    return res.status(500).send([]);
                }else
                {
                    if(tid == null)
                        return res.status(500).send([]);	
                    if(tid.length != 8)
                        return res.status(500).send([]);
                    
                    var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
                    if(format.test(tid))
                    {
                        return res.status(200).send([]);
                    }
                    const txn = "SELECT * FROM terminal_state " + 
                        "WHERE terminal_id = '" + tid + "' AND current_date_uzoezi = " + "'" + formatDate(new Date()) + "'";
                    pool.query(txn, (err,  comms) => {    
                        if (err) 
                        {
                            logger.info("Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                            return res.status(500).send([]);
                        }
                        else
                        {
                            logger.info("All Terminals Successfully saved to " + req.clientIp + "  " + new Date().toLocaleString());
                            res.status(200).send(JSON.stringify(comms.rows));									
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
});

router.get("/getAllToday", function(req, res)
{
    req.socket.setKeepAlive();
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
                return res.status(500).send([]);
            }
            else
            {
                if(result.rows.length !== 1)
                {
                    logger.info("Incorrect Token Details. User: " + username + ". Ip: " + req.clientIp + ". Time: " +  new Date().toLocaleString());
                    return res.status(500).send([]);
                }else
                {
                    const txn = "SELECT * FROM terminal_state " + 
                        "WHERE current_date_uzoezi = " + "'" + formatDate(new Date()) + "';";//"2019-10-10"
                    pool.query(txn, (err,  comms) => {    
                        if (err) 
                        {
                            logger.info("Database connection error: " + err + ". Time: " + new Date().toLocaleString());
                            return res.status(500).send([]);
                        }
                        else
                        {
                            logger.info("All Terminals Successfully saved to " + req.clientIp + "  " + new Date().toLocaleString());
                            res.status(200).send(JSON.stringify(comms.rows));									
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
});

module.exports.router = router;