/**
 * @example
 * const buffer = CircularBuffer.withCapacity(3);
 * buffer.push(1, 2, 3);  // [1, 2, 3]
 * buffer.push(4);        // [4, 2, 3]
 */
export class CircularBuffer<T> implements Iterable<T, undefined> {
	/**
	 * Private constructor. Use static factory methods `from()` or `withCapacity()` to create instances.
	 */
	private constructor(
		private _buffer: T[],
		private _size: number,
		private _position: number
	) {}

	/**
	 * @returns A new `CircularBuffer` containing the source elements and capacity equal to the number of elements.
	 *
	 * @example
	 * const array = CircularBuffer.from([1, 2, 3]);
	 * console.log(array.capacity); // 3
	 * console.log([...array]); // [1, 2, 3]
	 */
	static from<T>(iterable: Iterable<T>): CircularBuffer<T> {
		const buffer = [...iterable];
		return new CircularBuffer(buffer, buffer.length, 0);
	}

	/**
	 * Creates an empty CircularBuffer with the specified capacity.
	 *
	 * @param capacity The maximum number of elements the array can hold
	 * @returns {CircularBuffer<T>} A new empty CircularBuffer
	 *
	 * @example
	 * const array = CircularBuffer.withCapacity(3);
	 * array.push(1, 2, 3, 4);  // Only keeps [2, 3, 4]
	 */
	static withCapacity<T>(capacity: number): CircularBuffer<T> {
		return new CircularBuffer<T>(new Array(capacity), 0, 0);
	}

	size(): number {
		return this._size;
	}

	capacity(): number {
		return this._buffer.length;
	}

	push(...items: T[]): this {
		const capacity = this._buffer.length;
		for (let i = 0; i < items.length; i++) {
			const index = (this._position + this._size + i) % capacity;
			this._buffer[index] = items[i]!;
		}

		const overlap = Math.max(this._size + items.length - capacity, 0);
		this._position = (this._position + overlap) % capacity;
		this._size = Math.min(this._size + items.length, capacity);

		return this;
	}

	pop(): T | undefined {
		if (this._size === 0) {
			return undefined;
		}
		const item = this._buffer[this._position + this._size - 1];
		this._size--;

		return item;
	}

	shift(): T | undefined {
		if (this._size === 0) {
			return undefined;
		}
		const item = this._buffer[this._position];
		this._position = (this._position + 1) % this._buffer.length;
		this._size--;

		return item;
	}

	/**
	 * Sets the element at the specified index.
	 * @throws {RangeError} If index is out of bounds
	 *
	 * @example
	 * const array = CircularBuffer.from([1, 2, 3]);
	 * array.set(1, 5);  // [1, 5, 3]
	 */
	set(index: number, item: T): this {
		if (index <= -this._size || index >= this._size) {
			throw new RangeError("Index out of bounds");
		}
		const boundedIndex = index < 0 ? this._size + index : index;
		this._buffer[(this._position + boundedIndex) % this._buffer.length] = item;

		return this;
	}

	/**
	 * Returns the element at the specified index.
	 * @returns The element at the specified index, or `undefined` if index is out of bounds
	 *
	 * @example
	 * const array = CircularBuffer.from([1, 2, 3]);
	 * console.log(array.get(1));  // 2
	 * console.log(array.get(5));  // undefined
	 */
	get(index: number): T | undefined {
		if (index <= -this._size - 1 || index >= this._size) {
			return undefined;
		}
		const boundedIndex = index < 0 ? this._size + index : index;
		return this._buffer[(this._position + boundedIndex) % this._buffer.length];
	}

	clear() {
		this._buffer.length = 0;
		this._position = 0;
		this._size = 0;
	}

	resize(newCapacity: number): this {
		const newBuffer = new Array<T>(newCapacity);
		const newSize = Math.min(this._size, newCapacity);
		for (let i = 0; i < newSize; i++) {
			newBuffer[i] = this.get(i)!;
		}
		this._buffer = newBuffer;
		this._size = newSize;
		this._position = 0;
		return this;
	}

	/**
	 * @returns A shallow copy of this `CircularBuffer`
	 */
	clone(): CircularBuffer<T> {
		return new CircularBuffer(this._buffer.slice(), this._size, this._position);
	}

	[Symbol.iterator](): Iterator<T, undefined> {
		let index = 0;
		return {
			next: () => {
				if (index < this._size) {
					return { value: this.get(index++)!, done: false };
				}
				return { value: undefined, done: true };
			},
		};
	}
}
