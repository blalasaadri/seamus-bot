'use strict';

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
    'Hey! @gormanseamus is a friend, not food! #DontHackSeamus',
    'Who are you? You\'re not @gormanseamus! Or are you? 😕 #DontHackSeamus',
    'Is it really you, the S-Master? I\'m unsure... May have been hacked. #DontHackSeamus',
    'Test question to make sure you haven\'t been hacked, @gormanseamus: What are your thoughts on Cars 3? #DontHackSeamus',
    'Are you wearing your jelly fish socks again? Or are you actually not @gormanseamus at all? #DontHackSeamus',
    'Butterbeer, butterbear, is the real @gormanseamus here? #DontHackSeamus',
    'Test question, to make sure you haven\'t been hacked, @gormanseamus: What is the difference between turtles and tortoises? #DontHackSeamus',
    'Can anyone confirm that this is really @gormanseamus? 🤔 #DontHackSeamus',
    'ಠ~ಠ Is that really you, @gormanseamus? #DontHackSeamus',
    'Test question to make sure you haven\'t been hacked, @gormanseamus: How great do you think The Cursed Child is (as a book)? #DontHackSeamus',
    'I\'m a little teapot, short and stout. If you hacked @gormanseamus, just get out! #DontHackSeamus',
    'We have received unsubstantiated reports that you, @gormanseamus, has been hacked. Can you confirm or deny? #DontHackSeamus',
];
module.exports = () => {
    return possibleReplies[Math.floor(Math.random() * possibleReplies.length)];
};