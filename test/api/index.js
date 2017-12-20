var should = require("should");
var ifmchain = require("../../index.js");


describe("api/index.js", function () {

    var Api = ifmchain.Api;


    it("should be function", function () {
        (Api).should.be.type("function");
    });

    var api = new Api();

    it("should be object", function () {
        (api).should.be.type("object");
    });

    it("should have properties isConnected", function () {
        (api).should.have.property("isConnected");
        (api.isConnected).should.be.type("function");
    })

    it("should be connected", function () {
        var connected = api.isConnected();
        (connected).should.equal(true);
    })
});
