const isValidRequestBody = function(requestBody) {
    return Object.keys(requestBody).length > 0
}

const isValid = function(value) {
    if(typeof value === 'undefined' || value === null) return false
    if(typeof value === 'string' && value.trim().length === 0) return false
    if(typeof value === 'number' && value.toString().trim().length === 0) return false
    return true;
}
 
const isValidTitle = function(title) {
    return ['Mr', 'Mrs', 'Miss'].indexOf(title) !== -1
}


module.exports.isValidRequestBody = isValidRequestBody;
module.exports.isValid = isValid;
module.exports.isValidTitle = isValidTitle;
