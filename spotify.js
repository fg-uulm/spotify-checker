const http = require("http");
const request = require('request');
const SpotifyWebApi = require('spotify-web-api-node');

var clientIdIn = '<yourClientId>';
var clientSecretIn = '<yourClientSecret>';

var credentials = {
  clientId: clientIdIn,
  clientSecret: clientSecretIn,
  redirectUri: 'http://localhost/callback'
};

var spotifyApi = new SpotifyWebApi(credentials);
var current = "nada."

var accessTokenSave = "<SavedAccessTokenFromInitialCall>"
var refreshTokenSave = "<SavedRefreshTokenFromInitialCall>"
// The code that's returned as a query parameter to the redirect URI
var code = '<SavedCodeFromManualAuth>';

// Retrieve an access token and a refresh token
/*spotifyApi.authorizationCodeGrant(code).then(
  function(data) {
    console.log('The token expires in ' + data.body['expires_in']);
    console.log('The access token is ' + data.body['access_token']);
    console.log('The refresh token is ' + data.body['refresh_token']);

    // Set the access token on the API object to use it in later calls
    spotifyApi.setAccessToken(data.body['access_token']);
    spotifyApi.setRefreshToken(data.body['refresh_token']);
  },
  function(err) {
    console.log('Something went wrong!', err);
  }
);*/

spotifyApi.setAccessToken(accessTokenSave);
spotifyApi.setRefreshToken(refreshTokenSave);

function refresh() {
	// clientId, clientSecret and refreshToken has been set on the api object previous to this call.
	spotifyApi.refreshAccessToken().then(
	  function(data) {
	    console.log('The access token has been refreshed!');

	    // Save the access token so that it's used in future calls
	    spotifyApi.setAccessToken(data.body['access_token']);
	  },
	  function(err) {
	    console.log('Could not refresh access token', err);
	  }
	);
}

function get() {
	spotifyApi.getMyCurrentPlaybackState({
  })
  .then(function(data) {
    // Output items
    //console.log("Now Playing: ",data.body);
    current = data.body;
  }, function(err) {
    console.log('Something went wrong!', err);
    current = "nada.";
  });
}

setInterval(() => {
	refresh();
	get();
}, 30000)

http.createServer((request, response) => {
	refresh();
	get();
	if(request.headers.origin == undefined) request.headers.origin = "*";
	response.setHeader('Access-Control-Allow-Origin', request.headers.origin);
	response.setHeader('Access-Control-Request-Method', '*');
	response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
	response.setHeader('Access-Control-Allow-Headers', request.headers.origin);
	response.writeHead(200, {"Content-Type": "text/plain"});
	response.write(JSON.stringify(current));
	response.end();
}).listen(8888);
