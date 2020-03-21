var router = express.Router();

//Login Routes
router.use('/login/', require("./usermanager/login.js").router);
//Dashboard Route
router.use('/dashboard/', require("./dashboard/dashboard.js").router);
//Transaction Route
router.use('/transaction/', require("./transaction/transaction.js").router);
//State Route
router.use('/state/', require("./state/state.js").router);
//Ongoing Route
router.use('/ongoing/', require("./ongoing/ongoing.js").router);
//App Download
router.use('/application/', require("./externalapi/appdownload.js").router);
//Bills Download
router.use('/billing/', require("./externalapi/billsmenu.js").router);
//Callhome
router.use('/callhome/', require("./externalapi/broadcast.js").router);
//Keys Download
router.use('/keys/', require("./externalapi/keysdownload.js").router);
//Logo Download
router.use('/logo/', require("./externalapi/logodownload.js").router);
//Profile Download
router.use('/profile/', require("./externalapi/profiledownload.js").router);


//Pending
router.use("/pending/", require("./pending/pendings.js").router);
//Terminals
router.use("/terminals/", require("./terminal/terminal.js").router);
//Profile
router.use("/profile/", require("./profile/profiles.js").router);
//Transaction Types
router.use("/transactiontypes/", require("./transactiontypes/transactiontypes.js").router);
//Stock
router.use("/stock/", require("./stock/stock.js").router);
//Logo
router.use("/logo/", require("./logo/logos.js").router);
//Currency
router.use("/currency/", require("./currency/currency.js").router);
//Banks
router.use("/banks/", require("./banks/banks.js").router);
//Transaction Broadcast
router.use("/broadcast/", require("./broadcast/broadcasts.js").router);
//Card Keys
router.use("/cardkeys/", require("./cardkeys/cardkeys.js").router);
//Host Keys
router.use("/hostkeys/", require("./hostkeys/hostkeys.js").router);
//Remote update
router.use("/upgrade/", require("./upgrade/upgrades.js").router);
//Settings
//Callhome, receipt, 
//host, communication
router.use("/settings/", require("./settings/settings.js").router);
//User Signup
router.use("/usersignup/", require("./usermanager/usersignup.js").router);
//All Users
router.use('/netopusers/', require("./usermanager/allusers.js").router);
//All Admins
router.use('/netopadmins/', require("./usermanager/alladmins.js").router);
//All Others
router.use('/netopothers/', require("./usermanager/allothers.js").router);
//Blocked Users
router.use('/netopblocked/', require("./usermanager/blocked.js").router);
//Change password
router.use('/usermodify/', require("./usermanager/modify.js").router);

//Settlement Engine
router.use('/settlement/', require("./settlement/settlement.js").router);

router.all("*", function(req, res)
{
    logger.info("In Manager No route");
    logger.info("Wrong URL. Redirecting to home. From: " + req.clientIp + ". Time: " + new Date().toLocaleString());
    res.redirect("/");
});

module.exports = router;