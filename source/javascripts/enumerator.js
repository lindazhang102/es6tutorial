function Enumerator(Constructor, input) {
  var enumerator = this;

  enumerator._instanceConstructor = Constructor;
  enumerator.promise = new Constructor(_noop);
  console.log(enumerator)
  enumerator._input     = input;
  enumerator.length     = input.length;
  enumerator._remaining = input.length;

  enumerator._init();

  enumerator._enumerate();
  if (enumerator._remaining === 0) {
    _fulfill(enumerator.promise, enumerator._result);
  }
}

Enumerator.prototype._init = function() {
  this._result = new Array(this.length);
};

Enumerator.prototype._enumerate = function() {
  var enumerator = this;

  var length  = enumerator.length;
  var promise = enumerator.promise;
  var input   = enumerator._input;

  for (var i = 0; promise._state === PENDING && i < length; i++) {
    enumerator._eachEntry(input[i], i);
  }
};

Enumerator.prototype._eachEntry = function(entry, i) {
  var enumerator = this;
  var c = enumerator._instanceConstructor;
  if (isMaybeThenable(entry)) {
    if (entry.constructor === c && entry._state !== PENDING) {
      entry._onerror = null;
      enumerator._settledAt(entry._state, i, entry._result);
    } else {
      enumerator._willSettleAt(c.resolve(entry), i);
    }
  } else {
    enumerator._remaining--;
    enumerator._result[i] = entry;
  }
};

Enumerator.prototype._settledAt = function(state, i, value) {
  var enumerator = this;
  var promise = enumerator.promise;

  if (promise._state === PENDING) {
    enumerator._remaining--;

    if (state === REJECTED) {
      _reject(promise, value);
    } else {
      enumerator._result[i] = value;
    }
  }

  if (enumerator._remaining === 0) {
    _fulfill(promise, enumerator._result);
  }
};

Enumerator.prototype._willSettleAt = function(promise, i) {
  var enumerator = this;

  _subscribe(promise, undefined, function(value) {
    enumerator._settledAt(FULFILLED, i, value);
  }, function(reason) {
    enumerator._settledAt(REJECTED, i, reason);
  });
};
