(function() {
	function random(min, max) {
		return min + (max - min) * Math.random();
	}

	function init() {
		// Options
		var tagId = "#placeKitten";
		var greyScale = true;

		var numKittens = 24;
		var minKittenSize = { x: 150, y: 100 };
		var maxKittenSize = { x: 250, y: 400 };

		var roundAmount = 1;

		// Private
		var tag = $(tagId);
		var rounding = Math.pow(10, roundAmount);

		var src = greyScale ? '"http://placekitten.com/' : '"http://placekitten.com/g/';

		for(var i = 0; i < numKittens; i++) {
			var size = { x: random(minKittenSize.x, maxKittenSize.x), y: random(minKittenSize.y, maxKittenSize.y) };
			size.x = Math.round(size.x / rounding) * rounding;
			size.y = Math.round(size.y / rounding) * rounding;

			var sizedSrc = src + size.x + "/" + size.y + '"';

			$("<img src=" + sizedSrc + ">").load(function() {
				$(this).appendTo(tag);
			});
		}
	}

	$(window).ready(init);
}());