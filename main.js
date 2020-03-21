express = require("express");
path = require("path");
winston = require("winston");
log = require("winston-color");
bodyParser = require("body-parser");
xmlparser = require("express-xml-bodyparser");
cookieParser = require("cookie-parser");
requestIp = require("request-ip");
pg = require("pg");
cors = require("cors");
helmet = require("helmet");
crypto = require("crypto");
fileUpload = require("express-fileupload");
ejs = require("ejs");
fs = require("fs");
fileExtension = require("file-extension");
nodemailer = require("nodemailer");
smtpTransport = require("nodemailer-smtp-transport");
randomstring = require("randomstring");
cryptoRandomString = require("crypto-random-string");
ActiveDirectory = require("activedirectory");
//request = require('request').defaults({ rejectUnauthorized: false });

//WISDOM EMAIL ADDRESS. CHANGE TO TRUSOFT
transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "brightima8@gmail.com",
    pass: "*****"
  }
});
emailHeading = '"TMS" <noreply@netopng.com>';

var algorithm = "aes-256-ctr";
passworddb = "karrabocomnganthonyhidrachristiancyril1234094899hjfhjahdjhejrkkuÂ£$";
passwordtoken = "*(*9hjfhjahdjhejrkkuÂ£$%^unifiedpaymentservicelimitedikehjd)IKDJuzozi";


app = express();
app.use(cors());
app.use(helmet());
app.use(fileUpload());
app.use(
  xmlparser({
    explicitArray: false,
    normalize: false,
    normalizeTags: false,
    trim: true
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser("*wisdo(*(*(Dh%$Â£14*(*^$Â£$Â£mesadthatilove%$Â£$Â£$Â£-_"));

logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      name: "info-file",
      filename: "logs/info/filelog-info.log",
      maxsize: "10000000",
      maxFiles: "10",
      timestamp: true,
      colorize: true,
      level: "info"
    }),
    new winston.transports.File({
      name: "error-file",
      filename: "logs/error/filelog-error.log",
      maxsize: "10000000",
      maxFiles: "10",
      timestamp: true,
      colorize: true,
      level: "error"
    }),
    new winston.transports.File({
      name: "debug-file",
      filename: "logs/debug/filelog-debug.log",
      maxsize: "10000000",
      maxFiles: "10",
      timestamp: true,
      colorize: true,
      level: "debug"
    })
  ]
});

app.use(requestIp.mw());
app.use("/", express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

datetime = function() {
  var str = "";
  var currentTime = new Date();
  var year = currentTime.getFullYear();
  var mnt = currentTime.getMonth() + 1;
  var day = currentTime.getDate();
  var hours = currentTime.getHours();
  var minutes = currentTime.getMinutes();
  var seconds = currentTime.getSeconds();
  if (mnt < 10) {
    mnt = "0" + mnt;
  }
  if (day < 10) {
    day = "0" + day;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  str += year + ":" + mnt + ":" + day + " " + hours + ":" + minutes + ":" + seconds + " ";
  if (hours > 11) {
    str += "PM";
  } else {
    str += "AM";
  }
  return str;
};

compareDate = function(sessionDecrypted, fromDatabase) {
  if (sessionDecrypted === fromDatabase) return true;
  else return false;
};

getDateTimeSpec = function() {
  var str = "";
  var currentTime = new Date();
  var year = currentTime.getFullYear();
  var mnt = currentTime.getMonth() + 1;
  var day = currentTime.getDate();
  var hours = currentTime.getHours();
  var minutes = currentTime.getMinutes();
  var seconds = currentTime.getSeconds();
  if (mnt < 10) {
    mnt = "0" + mnt;
  }
  if (day < 10) {
    day = "0" + day;
  }
  if (hours < 10) {
    hours = "0" + hours;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  str += year + "-" + mnt + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
  return str;
};

getDateTime = function() {
  var str = "";
  var currentTime = new Date();
  var year = currentTime.getFullYear();
  var mnt = currentTime.getMonth() + 1;
  var day = currentTime.getDate();
  var hours = currentTime.getHours();
  var minutes = currentTime.getMinutes();
  var seconds = currentTime.getSeconds();
  if (mnt < 10) {
    mnt = "0" + mnt;
  }
  if (day < 10) {
    day = "0" + day;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  str += year + ":" + mnt + ":" + day + ":" + hours + ":" + minutes + ":" + seconds + " ";
  if (hours > 11) {
    str += "PM";
  } else {
    str += "AM";
  }
  return str;
};

encryptData = function(text, password) {
  try {
    var cipher = crypto.createCipher(algorithm, password);
    var crypted = cipher.update(text, "utf8", "hex");
    crypted += cipher.final("hex");
    return crypted;
  } catch (e) {
    console.log("Cipher encryption Error");
    return null;
  }
};

decryptData = function(text, password) {
  try {
    var decipher = crypto.createDecipher(algorithm, password);
    var dec = decipher.update(text, "hex", "utf8");
    dec += decipher.final("utf8");
    return dec;
  } catch (e) {
    console.log("Cipher decryption Error");
    return null;
  }
};

//xconsole.log(encryptData("unical11", passworddb));
//console.log(decryptData("4c01d7dd025d93d9", passworddb));

pool = new pg.Pool({
  user: "postgres",
  host: "172.105.156.91",
  database: "netoptms",
  password: "Olumba3Obu",
  port: 5432
});

pool.query("SELECT NOW();", (err, res) => {
  if (err) {
    logger.info("Database connection error: " + err + ". Time: " + new Date().toLocaleString());
  } else {
    logger.info("Server is now connected to postgresql database.... Time: " + new Date().toLocaleString());
  }
  //pool.end();
});

//Check for favicon
function ignoreFavicon(req, res, next) {
  if (req.originalUrl === "/favicon.ico") {
    res.status(204).json({ nope: true });
  } else {
    next();
  }
}

app.use(ignoreFavicon);

app.get("/", function(req, res) {
  try {
    res.clearCookie("token_tcm");
    res.clearCookie("username");
    logger.info("Spitting out website to: " + req.clientIp + ". Time: " + new Date().toLocaleString());
    res.status(200).render("login/userlogin", {});
  } catch (e) {
    logger.info("Home could not be served to " + req.clientIp);
    res.status(500).send("We are currently maintaining this application. We will be back online soon");
  }
});

var manager = require("./routes/manager.js");
app.use("/netop/", manager);

function sendMail(mails, text) {
  var mailOptions = {
    from: emailHeading, // sender address
    to: mails, // list of receivers
    subject: "NETOP NOTIFICATION", // Subject line
    text: text // plain text body with html format
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      logger.info(error);
    } else {
      logger.info("Email sent: " + info.response);
    }
  });
}

app.all("*", function(req, res) {
  logger.info("In Home route");
  logger.info(req.url);
  logger.info("Wrong URL. Redirecting to home. From: " + req.clientIp + ". Time: " + new Date().toLocaleString());
  res.redirect("/");
});

app.listen(8088, function() {
  logger.info("NETOP TMS on port 8088" + ". Time: " + new Date().toLocaleString());
});
