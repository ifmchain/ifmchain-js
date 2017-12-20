'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var configFactory = require("./configFactory.js");
var constants = configFactory.getConstants();

var milestones = [
    3500000000, // Milestone 1-4
    1750000000, // Milestone 5-8
    875000000, 	// Milestone 9-12
    437500000, 	// Milestone 13-16
    218750000,  // Milestone 17-20
    109375000,	// Milestone 21-24
    54687500,	// Milestone 25-28
    27343750,	// Milestone 29-32
    13671875,	// Milestone 33-26
    6835937,	// Milestone 37-40
    3417968,	// Milestone 41-44
    1708984,	// Milestone 45-48
    854492,		// Milestone 49-52
    427246,		// Milestone 53-56
    213623,		// Milestone 57-60
    106811,		// Milestone 61-64
    53405,		// Milestone 65-68
    26702,		// Milestone 69-72
    13351,		// Milestone 73-76
    6675,		// Milestone 77-80
    3337,		// Milestone 81-84
    1668,		// Milestone 85-88
    834,		// Milestone 89-92
    417,		// Milestone 93-96
    208,		// Milestone 97-100
    104,		// Milestone 101-104
    52,			// Milestone 105-108
    26,			// Milestone 109-112
    13,			// Milestone 113-116
    6,			// Milestone 117-120
    3,			// Milestone 121-124
    1,			// Milestone 125-128
    0			// Milestone >128
];

var distance = Math.floor(constants.rewards.distance),
    // Distance between each milestone
rewardOffset = Math.floor(constants.rewards.offset); // Start rewards at block (n)

var parseHeight = function parseHeight(height) {
	height = parseInt(height);

	if (isNaN(height)) {
		throw new Error('Invalid block height');
	} else {
		return Math.abs(height);
	}
};

var Milestones = function () {
	function Milestones() {
		_classCallCheck(this, Milestones);
	}

	_createClass(Milestones, [{
		key: 'calcMilestone',
		value: function calcMilestone(height) {
			var location = Math.floor(parseHeight(height - rewardOffset) / distance),
			    lastMile = milestones[milestones.length - 1];

			if (location > milestones.length - 1) {
				return milestones.lastIndexOf(lastMile);
			} else {
				return location;
			}
		}
	}, {
		key: 'calcReward',
		value: function calcReward(height) {
			height = parseHeight(height);

			if (height < rewardOffset) {
				return 0;
			} else {
				return milestones[this.calcMilestone(height)];
			}
		}
	}, {
		key: 'calcSupply',
		value: function calcSupply(height) {
			height = parseHeight(height);
			var milestone = this.calcMilestone(height),
			    supply = constants.totalAmount / Math.pow(10, 8),
			    rewards = [];

			var amount = 0,
			    multiplier = 0;

			for (var i = 0; i < milestones.length; i++) {
				if (milestone >= i) {
					multiplier = milestones[i] / Math.pow(10, 8);

					if (height < rewardOffset) {
						break; // Rewards not started yet
					} else if (height < distance) {
						amount = height % distance; // Measure distance thus far
					} else {
						amount = distance; // Assign completed milestone
						height -= distance; // Deduct from total height

						// After last milestone
						if (height > 0 && i == milestones.length - 1) {
							var postHeight = rewardOffset - 1;

							if (height >= postHeight) {
								amount += height - postHeight;
							} else {
								amount += postHeight - height;
							}
						}
					}

					rewards.push([amount, multiplier]);
				} else {
					break; // Milestone out of bounds
				}
			}

			for (var _i = 0; _i < rewards.length; _i++) {
				var reward = rewards[_i];
				supply += reward[0] * reward[1];
			}

			return supply * Math.pow(10, 8);
		}
	}]);

	return Milestones;
}();

// Exports


module.exports = Milestones;