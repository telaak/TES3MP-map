// ==UserScript==
// @name         TES3MP player markers
// @namespace    https://laaksonen.me
// @version      0.1
// @description  Adds player markers to https://mwmap.uesp.net/
// @author       You
// @match        https://mwmap.uesp.net/
// ==/UserScript==
  (function () {
    'use strict';
    const markers = []
    setInterval(() => {
      fetch('http://localhost:5000/players/locations/').then(response => response.json()).then(json => {
        json.forEach(player => {
          let index = markers.findIndex(user => user.name === player.name)
          if (index === -1) {
              let marker = new google.maps.Marker({
              position: umConvertLocToLatLng(player.location.posX, player.location.posY),
              map: umMap,
              title: player.name + ' in ' + player.location.cell
          })
              let object = {name: player.name, marker: marker}
              markers.push(object)
          } else if(player.location.regionName !== '') {
              markers[index].marker.setTitle(player.name + ' in ' + player.location.cell)
              markers[index].marker.setPosition(umConvertLocToLatLng(player.location.posX, player.location.posY))
          } else {
              markers[index].marker.setTitle(player.name + ' in ' + player.location.cell)
          }
        })
      })
    }, 1000)
  })();
