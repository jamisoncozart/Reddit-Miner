const axios = require('axios');
const MongoClient = require('mongodb').MongoClient;
const keys = require('./keys.js');
const url = keys.url || "mongodb://localhost:27017"
const nodemailer = require('nodemailer');

//initially runs main() when program is called
main();
//runs main() every 6 hours
setInterval(function(){
    main();
}, 1000 * 60 * 60 * 6);


function main() {
    //Makes initial axios request to grab the front-page posts object
    axios.get('http://www.reddit.com/.json')
    .then(response => {
        makeRequestsFromArray(response, response.data.data.children);
    })
    .catch(error => {
        console.log(error);
        //sends email if error is caught
        if(keys.email && keys.recieveEmail && keys.password){
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
        }
        else{
            console.log("Email parameters not set");
        }
    })
}

//Makes second axios request to the permalink in each post object mined from the front page. This will request all comment threads.
function makeRequestsFromArray(response, postArray) {
    let index = 0;
    //Connect to MongoDB Atlas database
    MongoClient.connect(url, {useUnifiedTopology: true}, function(err,db) {
        if(err) throw err;
        console.log('=================================');
        console.log("Server: spinning up on port 27017");
        console.log("Time: " + getDateTime());
        console.log('---------------------------------');
        let dbase = db.db('redditMining');
        //Recursive function to loop through all post objects and request the permalink to the comment thread
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
                //sends email upon catching an error
                if(keys.email && keys.recieveEmail && keys.password){
                transporter.sendMail(mailOptions, function(error, info){
                    if(error){
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });
                }
            })
        }
        return request();
    })  
}

//inserts simplified post into redditData collection in redditMining DB
function writeToDB(postObj, dbase){
    dbase.collection("redditData").insertOne(postObj, function(err, res) {
        if(err) throw err;
        console.log("1 document inserted");
    })
}

//creates post object with selected data and all comments
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
    //Trimming the fat off the post objects to only select desired data
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

    //Loop through comment thread and save all comments and their replies
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

//specify email host and credentials
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: keys.email,
        pass: keys.password
    }
});

//specify what your email will say
var mailOptions = {
    from: keys.email,
    to: keys.recieveEmail,
    subject: 'Node Server: Error',
    text: 'A .catch block was triggered in your reddit-mining application'
};