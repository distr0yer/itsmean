/**
 * Created by ksantiag on 2/7/17.
 */

var express = require("express");
var methodOverride = require("method-override");
var parser = require("body-parser");
var mongo = require("mongojs");

var db = mongo('45.55.243.86:27017/playlist', ['playlist']);

var app = express();

app.use(parser.json());

app.use(parser.json({ type: "application/vnd.api+json"}));

app.use(parser.urlencoded({ extended: true }));

app.use(methodOverride("X-HTTP-Method-Override"));

app.use(express.static(__dirname + "/public"));

app.use("/", express.static(__dirname + '/public/views'));

app.get("/playlist", function(req, res) {
    db.playlist.find(function (err, db) {

        if (err) {
	    res.json(err);
        }
        else{
            res.json(db);
        }

    });

});

app.post("/playlist", function(req, res){
    var obj = {
        songs :   (req.body.songs ? req.body.songs : {}),
        playlistName : (req.body.playlistName ? req.body.playlistName : "")
    };

    if(req.body._id != undefined){
        obj._id = db.ObjectId(req.body._id);
    }

    db.playlist.save(obj);
    res.json(obj);
});

app.listen(8080, '45.55.243.86');
