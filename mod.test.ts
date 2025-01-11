import { assertEquals, assert } from "jsr:@std/assert";
import { CircularBuffer } from "./mod.ts";

Deno.test("should create a buffer with specified capacity", () => {
	const buffer = CircularBuffer.withCapacity(3);
	assert(buffer.capacity() === 3);
	assert(buffer.size() === 0);
});

Deno.test("should push elements to the buffer", () => {
	const buffer = CircularBuffer.withCapacity(3);
	buffer.push(1, 2, 3);
	assertEquals([...buffer], [1, 2, 3]);
	assert(buffer.size() === 3);
});

Deno.test("should overwrite oldest elements when buffer is full", () => {
	const buffer = CircularBuffer.withCapacity(3);
	assertEquals([...buffer.push(1).push(2).push(3).push(4)], [2, 3, 4]);
});

Deno.test(
	"should handle pushing more elements than the buffer capacity",
	() => {
		const buffer = CircularBuffer.withCapacity(3);
		assertEquals([...buffer.push(1, 2, 3, 4)], [2, 3, 4]);
	}
);

Deno.test("should pop elements from the buffer", () => {
	const buffer = CircularBuffer.from([1, 2, 3]);
	const popped = buffer.pop();
	assert(popped === 3);
	assertEquals([...buffer], [1, 2]);
});

Deno.test("should shift elements from the buffer", () => {
	const buffer = CircularBuffer.from([1, 2, 3]);
	const shifted = buffer.shift();
	assert(shifted === 1);
	assertEquals([...buffer], [2, 3]);
});

Deno.test("should handle out-of-bounds index for get", () => {
	const buffer = CircularBuffer.from([1, 2, 3]);

	assertEquals(buffer.get(3), undefined);
	assertEquals(buffer.get(2), 3);
	assertEquals(buffer.get(1), 2);
	assertEquals(buffer.get(0), 1);
});

Deno.test("should handle negative indexes", () => {
	const buffer = CircularBuffer.from([1, 2, 3]);

	assertEquals(buffer.get(-1), 3);
	assertEquals(buffer.get(-2), 2);
	assertEquals(buffer.get(-3), 1);
	assertEquals(buffer.get(-4), undefined);
});

Deno.test("should handle out-of-bounds index for set", () => {
	const buffer = CircularBuffer.from([1, 2, 3]);
	buffer.set(1, 5);
	assertEquals([...buffer], [1, 5, 3]);
	try {
		buffer.set(5, 7);
	} catch (error) {
		assert(error instanceof RangeError);
	}
});

Deno.test("should clear the buffer", () => {
	const buffer = CircularBuffer.from([1, 2, 3]);
	buffer.clear();
	assertEquals(buffer.size(), 0);
	assertEquals([...buffer], []);
});

Deno.test("should resize the buffer", () => {
	const buffer = CircularBuffer.from([1, 2, 3]);
	buffer.resize(5);
	assertEquals(buffer.capacity(), 5);
	assertEquals([...buffer], [1, 2, 3]);

	buffer.push(4);
	assertEquals([...buffer], [1, 2, 3, 4]);
});

Deno.test("should clone the buffer", () => {
	const buffer = CircularBuffer.from([1, 2, 3]);
	const cloned = buffer.clone();
	assertEquals([...cloned], [1, 2, 3]);

	assertEquals([...cloned.push(4)], [2, 3, 4]);
	assertEquals([...buffer], [1, 2, 3]); // original buffer should not change
});
