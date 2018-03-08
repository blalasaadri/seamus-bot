'use strict';
const Twit = require('twit');
const moment = require('moment');
const Hapi = require('hapi');

const config = require('./config');
const replyText = require('./repies');

const LOG_TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss Z';
const retryIntervalInMs = 60*1000;
const twitter = new Twit({
    ...config,
    timeout_ms: retryIntervalInMs,
});

(() => {
    const server = new Hapi.Server({ port: process.env.PORT || 3000 });

    server.start()
        .then(() => console.log(`Server running at: ${server.info.uri}`));
    server.route({
        method: 'GET',
        path: '/',
        handler: () => 'I am alive'
    });
})();

let currentTime = moment();
let lastCheck = currentTime;
setInterval(() => {
        currentTime = moment();
        twitter.get('search/tweets', {
                q: `from:@gormanseamus -filter:retweets since:${moment().subtract(1, 'days').format('YYYY-MM-DD')}`, 
                count: 100,
                result_type: 'recent'
            }).catch(console.err)
            .then(res => {
                const { data } = res;
                //console.log(`[${moment().format(LOG_TIMESTAMP_FORMAT)}] Found ${data.statuses.length} tweets in total`);
                const nonReplyTweets = data.statuses
                    .filter(tweet => tweet.in_reply_to_status_id === null)
                    .filter(tweet => tweet.in_reply_to_user_id === null);
                //console.log(`[${moment().format(LOG_TIMESTAMP_FORMAT)}] Found ${nonReplyTweets.length} tweets that weren't replies`);
                return nonReplyTweets.map(({ id_str, text, created_at }) => ({ id_str, text, created_at }));
            }).then(res => Promise.all(res
                    .filter(tweet => {
                        const tweetTime = moment(tweet.created_at, 'ddd MMM DD HH:mm:ss Z');
                        const isTweetNew = tweetTime.isAfter(lastCheck);
                        //console.log(`[${moment().format(LOG_TIMESTAMP_FORMAT)}] Tweet https://twitter.com/gormanseamus/status/${tweet.id_str} was posted on ${tweetTime} and I'm looking for tweets since ${lastCheck}. That means I will ${isTweetNew ? 'reply' : 'not reply'}.`);
                        return isTweetNew;
                    }).map(tweet => {
                        console.log(`[${moment().format(LOG_TIMESTAMP_FORMAT)}] Replying to tweet: "${tweet.text}" (url: https://twitter.com/gormanseamus/status/${tweet.id_str})`);
                        return twitter.post('statuses/update', { status: replyText(), in_reply_to_status_id: tweet.id_str });
                    })
                )
            ).catch(console.err)
            .then(values => console.log(`[${moment().format(LOG_TIMESTAMP_FORMAT)}] ${values.length} concerned replies sent`));
        lastCheck = currentTime;
    },
    retryIntervalInMs
);