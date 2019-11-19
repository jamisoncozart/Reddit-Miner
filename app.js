const axios = require('axios');
const MongoClient = require('mongodb').MongoClient;
const keys = require('./keys.js');
const uri = keys.url;

main();
//calls main() every 6 hours
setInterval(function(){
    main();
}, 40000/* 1000 * 60 * 60 * 6 */);


function main() {
    axios.get('http://www.reddit.com/.json')
    .then(response => {
        makeRequestsFromArray(response, response.data.data.children);
    })
    .catch(error => {
        console.log(error);
    })
    .finally(function(){
        //runs every time
    })
}

function makeRequestsFromArray(response, postArray) {
    let index = 0;
    MongoClient.connect(uri, {useUnifiedTopology: true}, function(err,db) {
        if(err) throw err;
        console.log('=================================');
        console.log("Server: spinning up on port 27017");
        console.log("Time: " + getDateTime());
        console.log('---------------------------------');
        let dbase = db.db('redditMining');
        function request() {
            return axios.get('http://www.reddit.com' + response.data.data.children[index].data.permalink + ".json")
            .then(response => {
                //add all desired data to post object
                simplePost = createPostObj(response.data);
                writeToDB(simplePost, dbase);

                index++;
                if (index >= postArray.length) {
                    db.close();
                    return 'done';
                }
                return request();
            })
            .catch(error => {
                console.log(error);
            })
        }
        return request();
    })
    
}

function writeToDB(postObj, dbase){
    //inserts simplified post into redditData collection in redditMining DB
    dbase.collection("redditData").insertOne(postObj, function(err, res) {
        if(err) throw err;
        console.log("1 document inserted");
    })
}

function createPostObj(postData){
    let simplePost = {};
    let awards = [];
    for(let award of postData[0].data.children[0].data.all_awardings) {
        let awardObj = {};
        awardObj.count = award.count;
        awardObj.type = award.name;
        awards.push(awardObj);
    }
    simplePost.time = getDateTime();
    simplePost.title = postData[0].data.children[0].data.title;
    simplePost.author = postData[0].data.children[0].data.author;
    simplePost.upvotes = postData[0].data.children[0].data.ups;
    simplePost.awards = awards;
    simplePost.awarders = postData[0].data.children[0].data.awarders;
    simplePost.numComments = postData[0].data.children[0].data.num_comments;
    simplePost.subreddit = postData[0].data.children[0].data.subreddit_name_prefixed;
    simplePost.subSubscribers = postData[0].data.children[0].data.subreddit_subscribers;
    simplePost.thumbnail = postData[0].data.children[0].data.thumbnail;
    simplePost.edited = postData[0].data.children[0].data.edited;
    simplePost.linkDomain = postData[0].data.children[0].data.domain;
    simplePost.stickied = postData[0].data.children[0].data.stickied;
    simplePost.linkURL = postData[0].data.children[0].data.url;
    simplePost.comments = [];

    for(let i = 1; i < postData[1].data.children.length; i++){
        let comment = {};
        comment.body = postData[1].data.children[i].data.body;
        comment.author = postData[1].data.children[i].data.author;
        comment.upvotes = postData[1].data.children[i].data.ups;
        comment.replies = postData[1].data.children[i].data.replies;

        simplePost.comments.push(comment);
    }
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