const Twit = require('twit');
const moment = require('moment');

const config = require('./config');

const twitter = new Twit({
    ...config,
    timeout_ms: 60*1000,
});

twitter.get('search/tweets', { 
        q: `from:@gormanseamus -filter:retweets since:${moment().subtract(1, 'days').format('YYYY-MM-DD')}`, 
        count: 100, 
        result_type: 'recent'
    }).catch(console.err)
    .then(res => {
        const { data } = res;
        console.log(`Found ${data.statuses.length} tweets in total`);
        const nonReplyTweets = data.statuses
            .filter(tweet => tweet.in_reply_to_status_id === null)
            .filter(tweet => tweet.in_reply_to_user_id === null);
        console.log(`Found ${nonReplyTweets.length} tweets that weren't replies`);
        const minifiedTweets = nonReplyTweets.map(({ text, created_at }) => ({ text, created_at }));
        const latestTweet = minifiedTweets[0];
        console.log('Latest Tweet:');
        console.log(JSON.stringify(latestTweet, null, 2));
});