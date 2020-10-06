// ==UserScript==
// @name         TES3MP player markers
// @namespace    https://laaksonen.eu
// @version      0.1
// @description  Adds player markers to https://mwmap.uesp.net/
// @author       You
// @match        https://en.uesp.net/maps/mwmap/mwmap.shtml
// @require      https://mw.laaksonen.eu/socket.io/socket.io.js
// ==/UserScript==

const socket = io('https://mw.laaksonen.eu');
const markers = []

socket.on('playerLocation', player => {
  let foundMarker = markers.find(user => user.name === player.name)
  if (!foundMarker) {
  let marker = new google.maps.Marker({
    position: umConvertLocToLatLng(player.location.posX, player.location.posY),
    map: umMap,
    title: `${player.name} in ${player.location.cell} ${player.location.regionName}`,
    icon: {url: encodeURI(`https://mw.laaksonen.me/${player.head}-${player.hair}.png`), scaledSize: new google.maps.Size(50, 50) }
  })
  let object = {name: player.name, marker: marker}
  markers.push(object)
  } else {
     foundMarker.marker.setTitle(`${player.name} in ${player.location.cell} ${player.location.regionName}`)
     if (player.location.regionName) {
       animateMarkerTo(foundMarker.marker, umConvertLocToLatLng(player.location.posX, player.location.posY))
     }
  }

})

function animateMarkerTo(marker, newPosition) {
    var options = {
        duration: 1000,
        easing: function (x, t, b, c, d) { // jquery animation: swing (easeOutQuad)
            return -c *(t/=d)*(t-2) + b;
        }
    };

    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;

    // save current position. prefixed to avoid name collisions. separate for lat/lng to avoid calling lat()/lng() in every frame
    marker.AT_startPosition_lat = marker.getPosition().lat();
    marker.AT_startPosition_lng = marker.getPosition().lng();
    var newPosition_lat = newPosition.lat();
    var newPosition_lng = newPosition.lng();

    // crossing the 180° meridian and going the long way around the earth?
    if (Math.abs(newPosition_lng - marker.AT_startPosition_lng) > 180) {
        if (newPosition_lng > marker.AT_startPosition_lng) {
            newPosition_lng -= 360;
        } else {
            newPosition_lng += 360;
        }
    }

    var animateStep = function(marker, startTime) {
        var ellapsedTime = (new Date()).getTime() - startTime;
        var durationRatio = ellapsedTime / options.duration; // 0 - 1
        var easingDurationRatio = options.easing(durationRatio, ellapsedTime, 0, 1, options.duration);

        if (durationRatio < 1) {
            marker.setPosition({
                lat: (
                    marker.AT_startPosition_lat +
                    (newPosition_lat - marker.AT_startPosition_lat)*easingDurationRatio
                ),
                lng: (
                    marker.AT_startPosition_lng +
                    (newPosition_lng - marker.AT_startPosition_lng)*easingDurationRatio
                )
            });

            // use requestAnimationFrame if it exists on this browser. If not, use setTimeout with ~60 fps
            if (window.requestAnimationFrame) {
                marker.AT_animationHandler = window.requestAnimationFrame(function() {animateStep(marker, startTime)});
            } else {
                marker.AT_animationHandler = setTimeout(function() {animateStep(marker, startTime)}, 17);
            }

        } else {
            marker.setPosition(newPosition);
        }
    }

    // stop possibly running animation
    if (window.cancelAnimationFrame) {
        window.cancelAnimationFrame(marker.AT_animationHandler);
    } else {
        clearTimeout(marker.AT_animationHandler);
    }

    animateStep(marker, (new Date()).getTime());
}