'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _rx = require("rx");

var _rx2 = _interopRequireDefault(_rx);

module.exports = appendScanRx;

function appendScanRx(redis) {
	var proto = redis.RedisClient.prototype;
	proto.scanrx = scanrx;
	proto.sscanrx = sscanrx;
	proto.hscanrx = hscanrx;
	proto.zscanrx = zscanrx;
	return redis;
}

function scanrx(pattern) {
	var _this = this;

	return _rx2['default'].Observable.create(function (observer) {
		var execute = function execute(it) {

			var params = [it];
			if (pattern) params.push('MATCH', pattern);

			_this.scan(params, function (err, replies) {
				if (err) {
					observer.onError(err);
					return;
				}
				replies[1].forEach(function (x) {
					return observer.onNext(x);
				});
				it = +replies[0];
				it === 0 ? observer.onCompleted() : execute(it);
			});
		};
		execute(0);
	});
}

function sscanrx(key, pattern) {
	var _this2 = this;

	return _rx2['default'].Observable.create(function (observer) {
		var execute = function execute(it) {

			var params = [key, it];
			if (pattern) params.push('MATCH', pattern);

			_this2.sscan(params, function (err, replies) {
				if (err) {
					observer.onError(err);
					return;
				}
				replies[1].forEach(function (x) {
					return observer.onNext(x);
				});
				it = +replies[0];
				it === 0 ? observer.onCompleted() : execute(it);
			});
		};
		execute(0);
	});
}

function hscanrx(key, pattern) {
	var _this3 = this;

	return _rx2['default'].Observable.create(function (observer) {
		var execute = function execute(it) {

			var params = [key, it];
			if (pattern) params.push('MATCH', pattern);

			_this3.hscan(params, function (err, replies) {
				if (err) {
					observer.onError(err);
					return;
				}
				var field = undefined,
				    value = undefined;
				while ((field = replies[1].shift()) && (value = replies[1].shift())) {
					observer.onNext({ field: field, value: value });
				}
				it = +replies[0];
				it === 0 ? observer.onCompleted() : execute(it);
			});
		};
		execute(0);
	});
}

function zscanrx(key, pattern) {
	var _this4 = this;

	return _rx2['default'].Observable.create(function (observer) {
		var execute = function execute(it) {

			var params = [key, it];
			if (pattern) params.push('MATCH', pattern);

			_this4.zscan(params, function (err, replies) {
				if (err) {
					observer.onError(err);
					return;
				}
				var element = undefined,
				    score = undefined;
				while ((element = replies[1].shift()) && (score = replies[1].shift())) {
					observer.onNext({ element: element, score: score });
				}
				it = +replies[0];
				it === 0 ? observer.onCompleted() : execute(it);
			});
		};
		execute(0);
	});
}
