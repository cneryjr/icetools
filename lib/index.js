const {parse} = require('./parser')
const generate = require( './generator').default

const say = function(string_to_say) {
    return console.log(string_to_say)
}

exports.say = say
exports.parse = parse
exports.generate = generate
