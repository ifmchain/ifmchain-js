var Buffer = require("buffer/").Buffer;
var should = require("should");
var ifmchain = require("../index.js");

//set test env which generate adress prefix c
ifmchain.configFactory.setNET_VERSION("testnet");

require("./transactions/ifmchain.js");

describe("Ifmchain JS", function () {

	it("should be ok", function () {
		(ifmchain).should.be.ok;
	});

	it("should be object", function () {
		(ifmchain).should.be.type("object");
	});

	it("should have properties", function () {
		var properties = ["transaction", "account"];

		properties.forEach(function (property) {
			(ifmchain).should.have.property(property);
		});
	});

	it("generate test address should be ok", function () {
		ifmchain.configFactory.setNET_VERSION("testnet");
		var publicKey = "3a6c708ef5d521fcd5d113e34284039dc3532fee1dc51bc8bf26474922f43cbd";
		var address = ifmchain.keypairHelper.generateBase58CheckAddress(publicKey);
		(address).should.eql("cGyv4WyNGE26NA17btNV6LmeodAKefYGza");
	});

});
