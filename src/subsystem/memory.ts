const _ = require("lodash");
const ShipSubsystem = require("../shipSubsystem");

class MemorySubsystem extends ShipSubsystem {
    constructor(ship, options) {
        super(ship);
        options = Object.assign({
            limit: 100
        }, options);
        this.subsystemType = "memory";

        this.deque = [];
        this.deque_indexOfLast = -1;
        this.limit = options.limit;
    }

    push(type, data) {
        if (type === undefined || data === undefined) {
            throw new Error("Missing type or data");
        }
        this.deque.push({ type: type, data: data });
        this.deque_indexOfLast += 1;
        if (this.deque.length > this.limit) {
            this.removeOldest();
        }
    }

    read(index, callback) {
        let i = this.deque_indexOfLast - index;
        if (i >= 0 && i < this.deque.length) {
            callback(index, this.deque[i]);
        }
    }

    readRange(first, last, callback) {
        _.range(first, last).forEach((index) => {
            this.read(index, callback);
        });
    }

    removeOldest() {
        this.deque.shift();
    }

    getOldestIndex() {
        return this.deque_indexOfLast - this.deque.length + 1;
    }

    getNewestIndex() {
        return this.deque_indexOfLast;
    }
};

module.exports = MemorySubsystem;
