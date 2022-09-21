//
// my-functions.js
// TODO: Change VC creation with a function.
//
module.exports = {
    setJSONBody: setJSONBody,
    logHeaders: logHeaders
}

function setJSONBody(requestParams, context, ee, next) {
    return next(); // MUST be called for the scenario to continue
}

function logHeaders(requestParams, response, context, ee, next) {
    console.log(response.headers);
    return next(); // MUST be called for the scenario to continue
}