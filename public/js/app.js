/**
 * Created by ksantiag on 2/8/17.
 */
var app = angular.module('spotMe', ['spotify']);

/* Search for songs by their title, their artist, or their album */
/* Select songs that are found via search and add them to a Top 10 list. */
/* Name my top 10 list (i.e. Top 10 Songs from the Nineties) */
/* Add a note and an image to each song in that playlist */
/* Export that playlist as json (Example Below) */


app.config(function (SpotifyProvider) {
    SpotifyProvider.setClientId('657a2f945f204f5a80171e0ff18bc84c');
    SpotifyProvider.setRedirectUri('localhost');
    SpotifyProvider.setScope('user-read-private playlist-read-private playlist-modify-private playlist-modify-public');
    // SpotifyProvider.setAuthToken('<AUTH_TOKEN>');
});

app.config( [
    '$compileProvider',
    function( $compileProvider )
    {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|data):/);
    }
]);

app.controller('IndexController', ['$scope','$http', 'Spotify', function($scope, $http, Spotify){

    //init
    $scope.playlist = {
        songs: {}
    };

    $scope.data = {
        tracks: "",
        artists: "",
        albums: "",
        input: "",
        exportLink: ""
    };

    //check to see if playlist exists already
    $http.get('/playlist').success(function(res){
        $scope.playlist = ( res[0] ? res[0] : { songs: { } } );
    });

    //on key input search for results
    $scope.$watch("data.input", function() {

        if ($scope.data.input.length > 0) {

            Spotify.search($scope.data.input, "track").then(function(res){
                var tracks = res.tracks.items;
                var trackNames = [];
                for(var i = 0; i < tracks.length; i++){
                    trackNames.push(getMOP(tracks[i]));
                }

                $scope.data.tracks = trackNames;

            });
        }
    });

    $scope.addToPlaylist = function(songObj){
        $scope.playlist.songs[songObj.id] = songObj;
    };

    $scope.rmFromPlaylist = function(songId){
        delete $scope.playlist.songs[songId];
    };

    //save to db
    $scope.save = function(){
        $http({
		method: "POST",
		url: "/playlist",
		headers: {
			'Content-Type': 'application/json'
		},
		data: $scope.playlist
	});
    };

    $scope.encodeJSON = function(playlist) {
            return encodeURIComponent(JSON.stringify(playlist));
    }


}]);

//

//get music object properties
function getMOP(obj){
    return {
        track: obj.name,
        // Intended to use for sorting and gauge user interests
        popularity: obj.popularity,
        id: obj.id,
        artist: formatArtists(obj.artists) || "",
        customImage: (!obj.album ? "" : obj.album.images[0].url),
        albumName: (!obj.album ? '' : obj.album.name),
        note: null
    }
}

//concat artists
function formatArtists(artistsObj){
    if(!artistsObj)
        return;
    var artists = [];
    for(var i = 0; i < artistsObj.length; i++){
        artists.push(artistsObj[i].name);
    }
    return artists.join(" & ")
}
