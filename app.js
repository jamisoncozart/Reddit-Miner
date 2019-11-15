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
            dbase.collection("redditData").insertOne(post, function(err, res) {
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
})