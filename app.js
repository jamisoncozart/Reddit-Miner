let axios = require('axios');
let fs = require('fs');
var MongoClient = require('mongodb').MongoClient;

let redditJSON;

// MongoClient.connect("mongodb://localhost:27017/MyDb", {
//     useUnifiedTopology: true,
//     }, function(err,db){
//         console.log("Server: spnning up on port 27017");
//         if(err) throw err;
    
        axios.get("https://www.reddit.com/.json")
        .then(function(response){
            redditJSON = JSON.stringify(response.data.data.children);
            //redditJSON = response.data.data.children;
            //redditJSON.slice(1, redditJSON.length - 1);

            //================================
            //WRITING TO DATABASE
            //-------------------------------
            // db.collection('postData').insertMany({
            //     //insert objects into mongoDB
            // })

            //================================
            //WRITING TO LOCAL FILE
            //--------------------------------
            fs.writeFile('redditData.json', redditJSON, function(error){
                if(error){
                    throw error;
                } else {
                    console.log('redditData saved!');
                    fileJSON = fs.readFile('redditData.json', function(error){
                        if(error){
                            throw error;
                        }
                    })
                    
                }
            })
        })
        .catch(function(error){
            console.log(error);
        })
        .finally(function(){
            //always execute
        });
//})