const axios = require('axios');
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";

//runs main() initially and then once every hour.
main();
setInterval(function(){
    main();
}, 1000 * 60 * 60);

//handles all functions including connection to DB and writing to DB
function main() {
    MongoClient.connect(url, {useUnifiedTopology: true}, function(err,db) {
        if(err) throw err;
        console.log('===============================');
        console.log("Server: spinning up on port 27017");
        let dbase = db.db('redditMining');
        axios.get("https://www.reddit.com/.json")
        .then(function(response){
            console.log('Pushing posts to DB');
            let redditJSON = response.data.data.children;
            writeToDB(redditJSON, dbase);            
        })
        .catch(function(error){
            console.log(error);
        })
        .finally(function(){
            db.close(); //always runs
        });
        console.log('DB Write at time: ' + getDateTime());
        console.log('_______________________________')
    });
}

function writeToDB(redditJSON, dbase){
    for(let post of redditJSON){
        //inserts simplified post into redditData collection in redditMining DB
        dbase.collection("redditData").insertOne(simplifyPost(post), function(err, res) {
            if(err) throw err;
            console.log("1 document inserted");
        })
    }
}

//creates new post object with only desired data keys
function simplifyPost(post){
    let simplePost = {};
    let awards = [];
    for(let award of post.data.all_awardings) {
        let awardObj = {};
        awardObj.count = award.count;
        awardObj.type = award.name;
        awards.push(awardObj);
    }
    simplePost.time = getDateTime();
    simplePost.subreddit = post.data.subreddit_name_prefixed;
    simplePost.title = post.data.title;
    simplePost.author = post.data.author;
    simplePost.upvotes = post.data.ups;
    simplePost.thumbnail = post.data.thumbnail;
    simplePost.edited = post.data.edited;
    simplePost.linkDomain = post.data.domain;
    simplePost.awards = awards;
    simplePost.awarders = post.data.awarders;
    simplePost.numComments = post.data.num_comments;
    simplePost.permalink = post.data.permalink;
    simplePost.stickied = post.data.stickied;
    simplePost.titleLink = post.data.url;
    simplePost.subSubscribers = post.data.subreddit_subscribers;
    return simplePost;
}

//returns the current date and time
function getDateTime() {
    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var minute = date.getMinutes();
    minute = (minute < 10 ? "0" : "") + minute;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return year + ":" + month + ":" + day + ":" + hour + ":" + minute;
};