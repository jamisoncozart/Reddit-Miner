# Reddit Miner

Automated data mining off of Reddit's front page and storage in a MongoDB database. Local application built on Node.js.

## What data does it mine?

* The first 25 posts from the front page of reddit
* All relevant data to the post including upvotes, author, subreddit, title, awards, etc...
* All comments and their children including upvotes, author, awards

## Getting Started

Download the .zip file and extract all files into directory of your choice OR clone the repository to a directory. Open project directory in preferred text editor.

### Prerequisites

1. Node.js + npm 
2. Text Editor (Visual Studio Code)
3. MongoDB Atlas Account OR local MongoDB instance

### Installing

1. Clone the repository:
    ```
    git clone https://github.com/jamisoncozart/Reddit-Miner
    ```
2. Install npm packages:
    ```
    npm install
    ```
3. Modify the parameters within keys.js with the following:
    ```
    url: replace with the URL to your MongoDB Atlas database. This URL can be found by selecting your desired cluster then clicking 'connect' -> 'Connect your application'
    Alternatively, you can connect to an instance of MongoDB running locally, which you can connect with the url: mongodb://localhost:27017/admin.
    MongoDB compass can be a good way to visualize locally.

    email: this will be the host email address. If you want to have email notifications when your program runs into errors, this will be the email sender address.

    password: the appropriate password for the sender email address.

    recieveEmail: the recieving email address. This can be your main email, or any email that you recieve notifications from so you can keep tabs on errors your program might run into.

    Save the `keys.js` file
    ```
5. Open command line, navigate to the extracted `Reddit-Miner-master` working directory, and type the following:

```
node app.js
```
You should see a "server spinning up" message followed by a date and time.
You will then see "1 document inserted" for each post object that is written to the database.

Example Output:

```
==================================
Server: spinning up on port 27017
Time: 2019:12:07:21:43
----------------------------------
1 document inserted
1 document inserted
1 document inserted
1 document inserted
1 document inserted
1 document inserted
1 document inserted
1 document inserted
1 document inserted
1 document inserted
1 document inserted
1 document inserted
1 document inserted
1 document inserted
1 document inserted
1 document inserted
1 document inserted
1 document inserted
1 document inserted
1 document inserted
1 document inserted
1 document inserted
1 document inserted
1 document inserted
1 document inserted
```

## Current Issues

Requests made to some subreddits, specifically r/NintendoSwitch and r/news, return an error and can sometimes end the program.
I haven't figured out why this is, but if you run into this error, the console will log an axios request error.
I have some suspicion that these subreddits have a 'no bot' policy, so any requests made will not be fulfilled, but I haven't proven this yet.

## Built With

* [Node.js](http://www.nodejs.org/) - Javascript runtime
* [Axios](https://github.com/axios/axios) - Promise-based HTTP client
* [MongoDB](https://www.mongodb.com/) - Document-based distributed database

## Authors

* **Jamison Cozart** - *All* - (https://github.com/jamisoncozart)
* **Alexander Hull** - *Feature/Cleanup* - (https://github.com/hullale)

## Want to contact the developers?

* Jamison Cozart - jamisoncozart@gmail.com