'use strict';
require ('newrelic');
const Twit = require('twit');
const moment = require('moment');
const Hapi = require('hapi');

const config = require('./config');

const retryIntervalInMs = 60*1000;
const twitter = new Twit({
    ...config,
    timeout_ms: retryIntervalInMs,
});

const possibleReplies = [
    '@gormanseamus Have you been hacked? :-( #DontHackSeamus',
    'Oh dear, @gormanseamus may have been hacked. O_o #DontHackSeamus',
    'Were you hacked, @gormanseamus? #DontHackSeamus',
    'Hm... That doesn\'t sound like the real @gormanseamus. #DontHackSeamus',
    'Hey nasty H4xx0rs, leave @gormanseamus alone! #DontHackSeamus'
];
const replyText = () => {
    return possibleReplies[Math.floor(Math.random() * possibleReplies.length)];
};

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

setInterval(() => 
    twitter.get('search/tweets', { 
            q: `from:@gormanseamus -filter:retweets since:${moment().subtract(1, 'days').format('YYYY-MM-DD')}`, 
            count: 100,
            result_type: 'recent'
        }).catch(console.err)
        .then(res => {
            const { data } = res;
            //console.log(`Found ${data.statuses.length} tweets in total`);
            const nonReplyTweets = data.statuses
                .filter(tweet => tweet.in_reply_to_status_id === null)
                .filter(tweet => tweet.in_reply_to_user_id === null);
            //console.log(`Found ${nonReplyTweets.length} tweets that weren't replies`);
            return nonReplyTweets.map(({ id_str, text, created_at }) => ({ id_str, text, created_at }));
        }).then(res => {
            const lastCheck = moment().subtract(retryIntervalInMs, 'ms');
            return Promise.all(res
                .filter(tweet => {
                    const tweetTime = moment(tweet.created_at, 'ddd MMM DD HH:mm:ss Z');
                    const isTweetNew = tweetTime.isAfter(lastCheck);
                    //console.log(`Tweet https://twitter.com/gormanseamus/status/${tweet.id_str} was posted on ${tweetTime} and I'm looking for tweets since ${lastCheck}. That means I will ${isTweetNew ? 'reply' : 'not reply'}.`);
                    return isTweetNew;
                }).map(tweet => {
                    console.log(`Replying to tweet: "${tweet.text}" (url: https://twitter.com/gormanseamus/status/${tweet.id_str})`);
                    return twitter.post('statuses/update', { status: replyText(), in_reply_to_status_id: tweet.id_str });
                }));
        })
        .catch(console.err)
        .then(values => console.log(`${values.length} concerned replies sent`)),
        retryIntervalInMs
    );