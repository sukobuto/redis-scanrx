# redis-scanrx

Appends Rx interfaces to the Redis *[SCAN](http://redis.io/commands/scan) commands.

# example

```js
var redis = require("redis");

// append scanrx methods for any clients
require("redis-scanrx")(redis);

var client = redis.createClient();
var common_prefix = "sample-app:";

client.scanrx()
	.map(function (x, idx, obs) {
		// remove common prefix for all keys
		return x.replace(common_prefix, "");
	})
	.take(10)
	.subscribe(
		function (x) { console.log("Next: " + x); },
		function (err) { console.error(err); },
		function () { console.log("Completed!") }
	);
// => Next: key:49
// => Next: key:2
// => Next: key:41
// => Next: key:43
// => Next: key:18
// => Next: key:12
// => Next: key:1
// => Next: key:10
// => Next: key:48
// => Next: key:9
```

# methods

## client.scanrx([pattern])

Create a new Rx stream for Redis SCAN replies.
Calls the `scan` command recursively, and each keys are supplied as stream elements.

- `pattern`: (opt) the pattern to match keys against.

e.g.

```js
client.scanrx("key:*")
	.subscribeOnNext(function (x) { console.log("Next: " + x); });
```

## client.sscanrx(key, [pattern])

Create a new Rx stream for Redis SSCAN replies with a key.
Calls the `sscan` command recursively on key `key`, and each members are supplied as stream elements.

- `key`: the key of the set.
- `pattern`: (opt) the pattern to match elements against.

## client.hscanrx(key, [pattern])

Create a new Rx stream for Redis HSCAN replies.
Calls the `hscan` command recursively on key `key`, and each field/value pair objects are supplied as stream elements, i.e.:

```js
client.hscanrx("hash:1")
	.subscribeOnNext(function (x) { console.log(x); });
// => { field: "field_1", value: "value_1" }
// => { field: "field_2", value: "value_2" }
// => { field: "field_3", value: "value_3" }
// => { field: "field_4", value: "value_4" }
// ...
```

- `key`: the key of the hash.
- `pattern`: (opt) the pattern to match fields against.

## client.zscanrx(key, [pattern])

Create a new Rx stream for Redis ZSCAN replies.
Calls the `zscan` command recursively on key `key`, and each element/score pair objects are supplied as stream elements, i.e:

```js
client.zscanrx("zset:1")
	.subscribeOnNext(function (x) { console.log(x); });
// => { element: "element_1", score: "1" }
// => { element: "element_2", score: "2" }
// => { element: "element_3", score: "3" }
// => { element: "element_4", score: "4" }
// ...
```

- `key`: the key of the sorted set.
- `pattern`: (opt) the pattern to match elements against.

# LICENCE

MIT