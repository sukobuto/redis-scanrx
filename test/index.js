var test = require('tape').test;
var redis = require('redis');
var Enumerable = require('linq');

var PORT = 6379;
var HOST = '127.0.0.1';
var DB = 15;

var scanrx = require('../index');
scanrx(redis);

/**
 * bundle result items as an array
 * @param acc
 * @param x
 * @returns {*}
 */
function arrayReducer(acc, x) {
	acc.push(x);
	return acc;
}

function getClient() {
	var client = redis.createClient(PORT, HOST);
	client.select(DB);
	return client;
}

test("setup", function(t) {
	var client = getClient();
	client.flushdb();
	// 50 STRINGS, A HASH, A SET, and A SORTED SET that each includes 500 items.
	client.send_command("DEBUG", ["POPULATE", 50]);
	var r = Enumerable.range(0, 500);
	client.hmset("hash:1", r.toObject("'field_' + $", "'value_' + $"));
	client.sadd("set:1", r.select("'member_' + $").toArray());
	client.send_command("zadd", r.selectMany("[$, 'element_' + $]").insert(0, ["zset:1"]).toArray());
	client.quit(function() {
		t.end()
	})
});

test("scan", function(t) {
	var client = getClient();

	function checkResults(records) {
		t.equals(records.length, 53, "Correct number of records");
		t.ok(records.indexOf("key:10") >= 0, "has an expected key");
		t.ok(records.indexOf("hash:1") >= 0, "has an expected key");
		client.quit(function () {
			t.end()
		})
	}

	client.scanrx()
		.reduce(arrayReducer, [])
		.subscribe(checkResults, console.error.bind(console));
});

test("scan w/ pattern", function(t) {
	var client = getClient();

	function checkResults(records) {
		t.equals(records.length, 50, "Correct number of records");
		t.ok(records.indexOf("key:10") >= 0, "has an expected key");
		t.ok(records.indexOf("set:1") == -1, "key was excluded");
		client.quit(function() {
			t.end()
		})
	}

	client.scanrx("key:*")
		.reduce(arrayReducer, [])
		.subscribe(checkResults, console.error.bind(console));
});

test("hscan", function(t) {
	var client = getClient();

	function checkResults(records) {
		var q = Enumerable.from(records);
		t.equals(records.length, 500, "Correct number of records");
		t.ok(q.any("$.field == 'field_10'"), "Found an expected record");
		t.ok(q.any("$.value == 'value_333'"), "Found an expected record");
		client.quit(function() {
			t.end()
		})
	}

	client.hscanrx("hash:1")
		.reduce(arrayReducer, [])
		.subscribe(checkResults, console.error.bind(console));
});

test("hscan w/ pattern", function(t) {
	var client = getClient();

	function checkResults(records) {
		var q = Enumerable.from(records);
		t.equals(records.length, 111, "Correct number of records");
		t.notOk(q.any("$.field == 'field_10'"), "record excluded");
		t.ok(q.any("$.value == 'value_333'"), "Found an expected record");
		client.quit(function() {
			t.end()
		})
	}

	client.hscanrx("hash:1", "field_3*")
		.reduce(arrayReducer, [])
		.subscribe(checkResults, console.error.bind(console));
});

test("sscan", function(t) {
	var client = getClient();

	function checkResults(records) {
		t.equals(records.length, 500, "Correct number of records");
		t.ok(records.indexOf("member_10") >= 0, "has an expected key");
		t.ok(records.indexOf("member_333") >= 0, "has an expected key");
		client.quit(function() {
			t.end()
		})
	}

	client.sscanrx("set:1")
		.reduce(arrayReducer, [])
		.subscribe(checkResults, console.error.bind(console));
});

test("sscan w/ pattern", function(t) {
	var client = getClient();

	function checkResults(records) {
		t.equals(records.length, 111, "Correct number of records");
		t.ok(records.indexOf("member_10") == -1, "key was excluded");
		t.ok(records.indexOf("member_333") >= 0, "has an expected value");
		client.quit(function() {
			t.end()
		})
	}

	client.sscanrx("set:1", "member_3*")
		.reduce(arrayReducer, [])
		.subscribe(checkResults, console.error.bind(console));
});

test("zscan", function(t) {
	var client = getClient();

	function checkResults(records) {
		var q = Enumerable.from(records);
		t.equals(records.length, 500, "Correct number of records");
		t.ok(q.any("$.element == 'element_10'"), "Found an expected record");
		t.ok(q.any("$.element == 'element_333'"), "Found an expected record");
		client.quit(function() {
			t.end()
		})
	}

	client.zscanrx("zset:1")
		.reduce(arrayReducer, [])
		.subscribe(checkResults, console.error.bind(console));
});

test("zscan w/ pattern", function(t) {
	var client = getClient();

	function checkResults(records) {
		var q = Enumerable.from(records);
		t.equals(records.length, 111, "Correct number of records");
		t.notOk(q.any("$.element == 'element_10'"), "Found an expected record");
		t.ok(q.any("$.element == 'element_333'"), "Found an expected record");
		client.quit(function() {
			t.end()
		})
	}

	client.zscanrx("zset:1", "element_3*")
		.reduce(arrayReducer, [])
		.subscribe(checkResults, console.error.bind(console));
});
