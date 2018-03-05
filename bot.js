'use strict';
const Twit = require('twit');
const moment = require('moment');
const Hapi = require('hapi');

const config = require('./config');

const LOG_TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss Z';
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
    'Hey nasty H4xx0rs, leave @gormanseamus alone! #DontHackSeamus',
    'Could it be... that @gormanseamus... has been hacked? #DontHackSeamus',
    'That looks suspiciously like @gormanseamus has been hacked! (;¬_¬) #DontHackSeamus',
    'I may just be a bot, but even I can tell that @gormanseamus may have been hacked there. #DontHackSeamus',
    'H4xx0rs? ಠ_ರೃ Leave @gormanseamus alone!!! #DontHackSeamus',
    'Whoa, whoa, whoa. Time out! You aren\'t @gormanseamus, are you? #DontHackSeamus',
    'That\'s not very #Hufflepuff of you, @gormanseamus. Have you been hacked? #DontHackSeamus',
    'Eeny, meeny, miny, moe. @gormanseamus, I don\'t think that\'s you! #DontHackSeamus',
    '@gormanseamus is a friend, not food. #DontHackSeamus',
    'Who are you? You\'re not @gormanseamus! Or are you? 😕 #DontHackSeamus',
    'Is it really you, the S-Master? I\'m unsure... May have been hacked. #DontHackSeamus',
    'Test question to make sure you haven\'t been hacked, @gormanseamus: What are your thoughts on Cars 3? #DontHackSeamus',
    'Are you wearing your jelly fish socks again? Or are you actually not @gormanseamus at all? #DontHackSeamus',
    'Butterbeer, butterbear, is the real @gormanseamus here? #DontHackSeamus',
    'Test question, to make sure you haven\'t been hacked, @gormanseamus: What is the difference between turtles and tortoises? #DontHackSeamus',
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