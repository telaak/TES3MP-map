"use client";

export type MwMapIframe = HTMLIFrameElement & {
  contentWindow: Window & {
    google: typeof google;
    umMap: google.maps.Map;
    umConvertLocToLatLng: (x: number, y: number) => google.maps.LatLng;
  };
};

export function getFrame(): MwMapIframe {
  const frame = document.getElementById("frame") as MwMapIframe;
  return frame;
}

export function getMap(): google.maps.Map {
  return getFrame().contentWindow!.umMap as google.maps.Map;
}

export type AnimatedMarker = google.maps.Marker & {
  AT_startPosition_lat: number;
  AT_startPosition_lng: number;
  AT_animationHandler: number;
};

export function animateMarkerTo(
  marker: AnimatedMarker,
  newPosition: google.maps.LatLng,
  duration = 1000
) {
  const options = {
    duration,
    easing: function (_: number, t: number, b: number, c: number, d: number) {
      // jquery animation: swing (easeOutQuad)
      return -c * (t /= d) * (t - 2) + b;
    },
  };

  window.requestAnimationFrame = window.requestAnimationFrame;
  window.cancelAnimationFrame = window.cancelAnimationFrame;

  // save current position. prefixed to avoid name collisions. separate for lat/lng to avoid calling lat()/lng() in every frame
  marker.AT_startPosition_lat = marker.getPosition()!.lat();
  marker.AT_startPosition_lng = marker.getPosition()!.lng();
  const newPosition_lat = newPosition.lat();
  let newPosition_lng = newPosition.lng();

  // crossing the 180° meridian and going the long way around the earth?
  if (Math.abs(newPosition_lng - marker.AT_startPosition_lng) > 180) {
    if (newPosition_lng > marker.AT_startPosition_lng) {
      newPosition_lng -= 360;
    } else {
      newPosition_lng += 360;
    }
  }

  const animateStep = function (marker: AnimatedMarker, startTime: number) {
    const ellapsedTime = new Date().getTime() - startTime;
    const durationRatio = ellapsedTime / options.duration; // 0 - 1
    const easingDurationRatio = options.easing(
      durationRatio,
      ellapsedTime,
      0,
      1,
      options.duration
    );

    if (durationRatio < 1) {
      marker.setPosition({
        lat:
          marker.AT_startPosition_lat +
          (newPosition_lat - marker.AT_startPosition_lat) * easingDurationRatio,
        lng:
          marker.AT_startPosition_lng +
          (newPosition_lng - marker.AT_startPosition_lng) * easingDurationRatio,
      });

      // use requestAnimationFrame if it exists on this browser. If not, use setTimeout with ~60 fps
      if (window.requestAnimationFrame) {
        marker.AT_animationHandler = window.requestAnimationFrame(function () {
          animateStep(marker, startTime);
        });
      } else {
        marker.AT_animationHandler = setTimeout(function () {
          animateStep(marker, startTime);
        }, 17) as unknown as number;
      }
    } else {
      marker.setPosition(newPosition);
    }
  };

  // stop possibly running animation
  if (window.cancelAnimationFrame) {
    window.cancelAnimationFrame(marker.AT_animationHandler);
  } else {
    clearTimeout(marker.AT_animationHandler);
  }

  animateStep(marker, new Date().getTime());
}
