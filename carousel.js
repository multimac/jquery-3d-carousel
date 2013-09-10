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

(function($) {

    var Utils = {
        clamp: function(num, min, max) { // Returns num in the range [min, max]
            return Math.min(Math.max(num, min), max);
        },
        lerp: function(source, dest, amount) { // Linearly interpolates source to dest by amount
            return source + (dest - source) * amount;
        },
        toDegrees: function(radians) { // Returns the given radians as degrees
            return radians * (180 / Math.PI);
        },
        toRadians: function(degrees) { // Returns the given degrees as radians
            return degrees * (Math.PI / 180);
        },
        wrap: function(num, value) { // Returns num in the range [-value, value);
            num = num % (value * 2);

            if(num >= value)
                num -= value * 2;
            else if(num < -value)
                num += value * 2;

            return num;
        },
    };

    var settings = {
        container: null,

        // Speed settings (all in degrees/second)
        idleSpeed: 25,
        idleSpeedAcceleration: 0.05,
        maxSpeed: 90,

        // -- Target centring
        targetCentringAcceleration: 0.15,
        targetCentringDrag: 0.85,

        // -- Mouse
        mouseAcceleration: 0.25,
        mouseSpeed: 5,

        // Z-depth
        scaleMin: 0.5,
        scaleMax: 1.0,
        zIndexMax: 1000,

        // Peek effect
        verticalShiftMax: 150, // in pixels

        // Link callback
        linkCallback: null,
    };

    var running = false;

    var elementCount = -1;
    var verticalShift = 0;
    var speed = 0;

    var mouseDown = false;
    var currMousePos = { x: -1, y: -1 };
    var prevMousePos = { x: -1, y: -1 };

    var currTime = -1;
    var prevTime = -1;;

    var targetElement = null;

    function getInterval(position) {
        return Math.sin(Utils.toRadians(position)) / 2.0 + 0.5;
    }
    function getInterpolatedInterval(position, min, max) {
        return min + (max - min) * getInterval(position);
    }

    function initChild() {
        var self = $(this);

        self.click(handleClick);

        self.data("width", self.width());
        self.data("height", self.height());

        self.data("position", self.index() / elementCount * 360);
    }
    function stepChild() {
        var self = $(this);

        self.data("position", (self.data("position") + speed * (currTime - prevTime) * 0.001) % 360);
        positionChild(self);
    }
    function positionChild(child) {
        var position = child.data("position");
        var scale = getInterpolatedInterval(position, settings.scaleMin, settings.scaleMax);

        var halfWidth = child.data("width") / 2;
        var halfHeight = child.data("height") / 2;

        child.css({
            "left": (getInterpolatedInterval(position + 90, 0, settings.container.width()) - halfWidth * scale) + "px",
            "top": (getInterval(position) * verticalShift - halfHeight + settings.container.height() / 2) + "px",
            "width": child.data("width") * scale + "px",
            "height": child.data("height") * scale + "px",
            "z-index": Math.round(getInterval(position) * settings.zIndexMax),
        })
    }

    function handleClick(e) {
        var self = $(this);

        if(self.is(targetElement) && self.attr("href") && settings.linkCallback) {
            if(!settings.linkCallback(self.attr("href")))
                e.preventDefault();
        }
        else {
            e.preventDefault();
            targetElement = self;
        }
    }
    function handleMouseMove(e) {
        currMousePos.x = e.pageX;
        currMousePos.y = e.pageY;
    }
    function handleMouseDown(e) {
        mouseDown = true;
    }
    function handleMouseUp(e) {
        mouseDown = false;
    }

    function updateSpeed() {
        if(mouseDown) {
            speed = Utils.lerp(speed, (prevMousePos.x - currMousePos.x) * settings.mouseSpeed, settings.mouseAcceleration);
        }
        else if(targetElement != null) {
            var direction = Utils.wrap(targetElement.data("position") - 90, 180);

            if(Math.abs(direction) < 0.1) {
                speed = 0;
            }
            else {
                speed *= settings.targetCentringDrag;
                speed = Utils.lerp(speed, speed - direction, settings.targetCentringAcceleration);
            }
        }
        else {
            speed = Utils.lerp(speed, (speed < 0) ? -settings.idleSpeed : settings.idleSpeed, settings.idleSpeedAcceleration);
        }
    }
    function updateTarget() {
        if(targetElement == null)
            return;

        var direction = Utils.wrap(targetElement.data("position") - 90, 180);
        if((mouseDown && Math.abs(direction) > 10) || (direction * speed >= 0 && Math.abs(speed) > 10)) {
            targetElement = null;
        }
    }
    function update() {
        prevTime = currTime;
        currTime = Date.now();

        if(mouseDown)
            verticalShift = Utils.clamp(verticalShift + currMousePos.y - prevMousePos.y, 0, settings.verticalShiftMax);

        updateSpeed();
        updateTarget();

        prevMousePos.x = currMousePos.x;
        prevMousePos.y = currMousePos.y;

        if(speed != 0)
            settings.container.children().each(stepChild);

        if(running)
            window.requestAnimationFrame(update);
    }

    $.fn.carousel = function(action, options) {
        if(action === "start") {
            running = true;

            settings.container = this;
            settings = $.extend(settings, options);

            elementCount = this.children().size();

            // Events
            $(window).mousemove(handleMouseMove).mouseup(handleMouseUp);
            this.mousedown(handleMouseDown);

            this.children().each(initChild);
            this.children().each(function() { positionChild($(this)); });

            window.requestAnimationFrame(update);
        }
        else {
            running = false;
        }
    }

}(jQuery));