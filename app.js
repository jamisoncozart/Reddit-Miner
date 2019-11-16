const axios = require('axios');
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";

MongoClient.connect(url, {useUnifiedTopology: true}, function(err,db) {
    if(err) throw err;
    console.log("Server: spinning up on port 27017");

    let dbase = db.db('redditMining');

    axios.get("https://www.reddit.com/.json")
    .then(function(response){
        let redditJSON = response.data.data.children;
        //================================
        //WRITING TO DATABASE
        //--------------------------------
        for(let post of redditJSON){
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
            // delete post.data.approved_at_utc;
            // delete post.data.saved;
            // delete post.data.clicked;
            // delete post.data.mod_reason_title;
            // delete post.data.thumbnail_height;
            // delete post.data.link_flair_richtext;
            // delete post.data.thumbnail_width;
            // delete post.data.author_flair_template_id;
            // delete post.data.can_mod_post;
            // delete post.data.wls;
            // delete post.data.suggested_sort;
            // delete post.data.visited;
            // delete post.data.removed_by;
            // delete post.data.mod_reason_by;
            // delete post.data.is_robot_indexable;
            // delete post.data.contest_mode;
            // delete post.data.author_patreon_flair;
            // delete post.data.media_only;
            // delete post.data.author_flair_text;
            // delete post.data.spoiler;
            // delete post.data.report_reason;
            // delete post.data.send_replies;
            // delete post.data.media;
            // delete post.data.locked;
            // delete post.data.is_crosspostable;
            // delete post.data.is_self;
            // delete post.data.mod_note;
            // delete post.data.steward_reports;
            // delete post.data.banned_by;
            // delete post.data.secure_media;
            // delete post.data.user_reports;
            // delete post.data.author_flair_background_color;
            // delete post.data.link_flair_text_color;
            // delete post.data.link_flair_css_class;
            // delete post.data.hidden;
            // delete post.data.pwls;
            // delete post.data.is_meta;
            // delete post.data.category;
            // delete post.data.content_categories;
            // delete post.data.allow_live_comments;
            // delete post.data.banned_at_utc;
            // delete post.data.no_follow;
            // delete post.data.archived;
            dbase.collection("redditData").insertOne(simplePost, function(err, res) {
                if(err) throw err;
                console.log("1 document inserted");
            })
        }
        db.close();
        //================================
        //WRITING TO LOCAL FILE
        //--------------------------------

        //redditJSON = JSON.stringify(response.data.data.children);
        //redditJSON.slice(2, redditJSON.length - 2);

        // fs.writeFile('redditData.json', redditJSON, function(error){
        //     if(error){
        //         throw error;
        //     } else {
        //         console.log('redditData saved!');
        //         fileJSON = fs.readFile('redditData.json', function(error){
        //             if(error){
        //                 throw error;
        //             }
        //         })
                
        //     }
        // })
    })
    .catch(function(error){
        console.log(error);
    })
    .finally(function(){
        //always execute
    });
});

function getDateTime() {
    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return year + ":" + month + ":" + day + ":" + hour;
};