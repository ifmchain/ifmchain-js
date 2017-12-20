'use strict';

module.exports = {
	reverse: function reverse(diff) {
		var copyDiff = diff.slice();
		for (var i = 0; i < copyDiff.length; i++) {
			var math = copyDiff[i][0] == '-' ? '+' : '-';
			copyDiff[i] = math + copyDiff[i].slice(1);
		}
		return copyDiff;
	},
	merge: function merge(source, diff) {
		var res = source ? source.slice() : [];

		for (var i = 0; i < diff.length; i++) {
			var math = diff[i][0];
			var publicKey = diff[i].slice(1);

			if (math == "+") {
				res = res || [];

				var index = -1;
				if (res) {
					index = res.indexOf(publicKey);
				}
				if (index != -1) {
					return false;
				}

				res.push(publicKey);
			}
			if (math == "-") {
				var _index = -1;
				if (res) {
					_index = res.indexOf(publicKey);
				}
				if (_index == -1) {
					return false;
				}
				res.splice(_index, 1);
				if (!res.length) {
					res = null;
				}
			}
		}
		return res;
	}
};