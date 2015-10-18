module.exports = appendScanRx;

import Rx from "rx";

function appendScanRx (redis) {
	var proto = redis.RedisClient.prototype;
	proto.scanrx = scanrx;
	proto.sscanrx = sscanrx;
	proto.hscanrx = hscanrx;
	proto.zscanrx = zscanrx;
	return redis;
}

function scanrx (pattern) {
	return Rx.Observable.create(observer => {
		var execute = (it) => {

			let params = [it];
			if (pattern) params.push('MATCH', pattern);

			this.scan(params, (err, replies) => {
				if (err) {
					observer.onError(err);
					return;
				}
				replies[1].forEach(x => observer.onNext(x));
				it = +replies[0];
				it === 0 ? observer.onCompleted() : execute(it);
			})

		};
		execute(0);
	})
}

function sscanrx (key, pattern) {
	return Rx.Observable.create(observer => {
		var execute = (it) => {

			let params = [key, it];
			if (pattern) params.push('MATCH', pattern);

			this.sscan(params, (err, replies) => {
				if (err) {
					observer.onError(err);
					return;
				}
				replies[1].forEach(x => observer.onNext(x));
				it = +replies[0];
				it === 0 ? observer.onCompleted() : execute(it);
			})

		};
		execute(0);
	})
}

function hscanrx (key, pattern) {
	return Rx.Observable.create(observer => {
		var execute = (it) => {

			let params = [key, it];
			if (pattern) params.push('MATCH', pattern);

			this.hscan(params, (err, replies) => {
				if (err) {
					observer.onError(err);
					return;
				}
				let field, value;
				while ((field = replies[1].shift()) && (value = replies[1].shift())) {
					observer.onNext({field, value});
				}
				it = +replies[0];
				it === 0 ? observer.onCompleted() : execute(it);
			})

		};
		execute(0);
	})
}

function zscanrx (key, pattern) {
	return Rx.Observable.create(observer => {
		var execute = (it) => {

			let params = [key, it];
			if (pattern) params.push('MATCH', pattern);

			this.zscan(params, (err, replies) => {
				if (err) {
					observer.onError(err);
					return;
				}
				let element, score;
				while ((element = replies[1].shift()) && (score = replies[1].shift())) {
					observer.onNext({element, score});
				}
				it = +replies[0];
				it === 0 ? observer.onCompleted() : execute(it);
			})
		};
		execute(0);
	})
}

