Utils = (function(){
    Utils = {}

    Utils.clamp = function(num, min, max) { // Returns num in the range [min, max]
        return Math.min(Math.max(num, min), max);
    }
    Utils.lerp = function(source, dest, amount) { // Linearly interpolates source to dest by amount
        return source + (dest - source) * amount;
    }
    Utils.toDegrees = function(radians) { // Returns the given radians as degrees
        return radians * (180 / Math.PI);
    }
    Utils.toRadians = function(degrees) { // Returns the given degrees as radians
        return degrees * (Math.PI / 180);
    }
    Utils.wrap = function(num, value) { // Returns num in the range [-value, value);
        num = num % (value * 2);

        if(num >= value)
            num -= value * 2;
        else if(num < -value)
            num += value * 2;

        return num;
    }

    return Utils;
}());

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());