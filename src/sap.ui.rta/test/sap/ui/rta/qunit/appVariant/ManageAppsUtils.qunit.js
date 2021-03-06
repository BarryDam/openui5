/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/rta/appVariant/Utils",
	"sap/ui/thirdparty/sinon"
], function(
	AppVariantOverviewUtils,
	sinon) {
	"use strict";

	var sandbox = sinon.sandbox.create();
	QUnit.start();

	QUnit.module("Given an AppVariantOverviewUtils is instantiated", {
		beforeEach: function () {
			this.originalUShell = sap.ushell;

			sap.ushell = jQuery.extend({}, sap.ushell, {
				Container : {
					getService : function(sServiceName) {
						return {
							getLinks: function(oNavigationParams) {
								return Promise.resolve([{
									result: "success"
								}]);
							}
						};
					},
					setDirtyFlag : function() {
						return "";
					}
				}
			});
		},
		afterEach: function () {
			sandbox.restore();
			sap.ushell = this.originalUShell;
		}
	}, function() {

		QUnit.test("When getAppVariantOverviewAttributes() method is called with no intent parameters", function (assert) {
			var oAppVariantInfo = {
				appId : "id1",
				title : "title1",
				subTitle : "subTitle1",
				description : "description1",
				iconUrl : "sap-icon://history",
				isOriginal : true,
				originLayer: "VENDOR",
				isAppVariant: false,
				descriptorUrl : "url1",
				hasStartableIntent: true,
				startWith: {
					"semanticObject": "SemObj",
					"action": "Action"
				}
			};

			return AppVariantOverviewUtils.getAppVariantOverviewAttributes(oAppVariantInfo).then(function(oAppVariantAttributes) {
				assert.strictEqual(oAppVariantAttributes.params, undefined, "then the params property does not exist");
			});
		});

		QUnit.test("When getAppVariantOverviewAttributes() method is called with intent parameter as an object", function (assert) {
			var oAppVariantInfo = {
				appId : "id1",
				title : "title1",
				subTitle : "subTitle1",
				description : "description1",
				iconUrl : "sap-icon://history",
				isOriginal : true,
				originLayer: "VENDOR",
				isAppVariant: false,
				descriptorUrl : "url1",
				hasStartableIntent: true,
				startWith: {
					"semanticObject": "SemObj",
					"action": "Action",
					"parameters": {
						"sap-appvar-id" : {
							value: "id1",
							required: true
						}
					}
				}
			};

			return AppVariantOverviewUtils.getAppVariantOverviewAttributes(oAppVariantInfo).then(function(oAppVariantAttributes) {
				assert.strictEqual(oAppVariantAttributes.params["sap-appvar-id"], "id1", "then the intent property's value is correct");
			});
		});

		QUnit.test("When getAppVariantOverviewAttributes() method is called with intent parameter as a string", function (assert) {
			var oAppVariantInfo = {
				appId : "id1",
				title : "title1",
				subTitle : "subTitle1",
				description : "description1",
				iconUrl : "sap-icon://history",
				isOriginal : true,
				originLayer: "VENDOR",
				isAppVariant: false,
				descriptorUrl : "url1",
				hasStartableIntent: true,
				startWith: {
					"semanticObject": "SemObj",
					"action": "Action",
					"parameters": {
						"sap-appvar-id" : "id1"
					}
				}
			};

			return AppVariantOverviewUtils.getAppVariantOverviewAttributes(oAppVariantInfo).then(function(oAppVariantAttributes) {
				assert.strictEqual(oAppVariantAttributes.params["sap-appvar-id"], "id1", "then the intent property's value is correct");
			});
		});

		QUnit.test("When getAppVariantOverview() method is called on a reference app (currently adapting) which also has intent information present", function (assert) {
			var oResult = {
				response: {
					items: [
						{
							appId : "id1",
							title : "title1",
							subTitle : "subTitle1",
							description : "description1",
							iconUrl : "sap-icon://history",
							isOriginal : true,
							originLayer: "VENDOR",
							isAppVariant: false,
							descriptorUrl : "url1",
							hasStartableIntent: true,
							startWith: {
								"semanticObject": "SemObj",
								"action": "Action",
								"parameters": {
									"sap-appvar-id" : {
										value: "id1"
									}
								}
							}
						}
					]
				}
			};

			sandbox.stub(AppVariantOverviewUtils, "sendRequest").returns(Promise.resolve(oResult));

			return AppVariantOverviewUtils.getAppVariantOverview("testId").then(function(aAppVariantOverviewAttributes){
				assert.ok(aAppVariantOverviewAttributes, "then the result contains app variant overview properties");
				assert.strictEqual(aAppVariantOverviewAttributes[0].icon, "sap-icon://history", "then the icon of an app variant is correct");
				assert.strictEqual(aAppVariantOverviewAttributes[0].semanticObject, "SemObj", "then the semantic object is correct");
				assert.strictEqual(aAppVariantOverviewAttributes[0].action, "Action", "then the action is correct");
				assert.equal(aAppVariantOverviewAttributes[0].adaptUIButtonVisibility, true, "then the app is adaptable");
			});
		});

		QUnit.test("When getAppVariantOverview() method is called on an app variant (currently adapting) which has no intent information present", function (assert) {
			var oResult = {
				response: {
					items: [
						{
							appId : "id1",
							title : "title1",
							subTitle : "subTitle1",
							description : "description1",
							iconUrl : "sap-icon://history",
							originLayer: "VENDOR",
							isOriginal : false,
							isAppVariant: true,
							descriptorUrl : "url1",
							hasStartableIntent: false,
							startWith: {
								"semanticObject": "",
								"action": "",
								"parameters": {}
							}
						},
						{
							appId : "id2",
							title : "title2",
							subTitle : "subTitle2",
							description : "description2",
							iconUrl : "sap-icon://account",
							isOriginal : true,
							originLayer: "VENDOR",
							isAppVariant: false,
							descriptorUrl : "url2",
							hasStartableIntent: true,
							startWith: {
								"semanticObject": "SemObj",
								"action": "Action",
								"parameters": {
									"sap-appvar-id" : "id2"
								}
							}
						}
					]
				}
			};

			sandbox.stub(AppVariantOverviewUtils, "sendRequest").returns(Promise.resolve(oResult));
			sap.ui.rta.appVariant.AppVariantUtils.setNewAppVariantId("id1");

			return AppVariantOverviewUtils.getAppVariantOverview("testId").then(function(aAppVariantOverviewAttributes){
				assert.ok(aAppVariantOverviewAttributes, "then the result contains app variant overview properties");

				assert.strictEqual(aAppVariantOverviewAttributes[0].icon, "sap-icon://history", "then the icon of first app(variant) is correct");
				assert.strictEqual(aAppVariantOverviewAttributes[1].icon, "sap-icon://account", "then the icon of second app is correct");
				assert.strictEqual(aAppVariantOverviewAttributes[0].semanticObject, undefined, "then the semantic object of first app(variant) is correct");
				assert.strictEqual(aAppVariantOverviewAttributes[1].semanticObject, "SemObj", "then the semantic object of second app is correct");
				assert.strictEqual(aAppVariantOverviewAttributes[0].action, undefined, "then the action of first app(variant) is correct");
				assert.strictEqual(aAppVariantOverviewAttributes[1].action, "Action", "then the action of second app is correct");
				assert.equal(aAppVariantOverviewAttributes[0].adaptUIButtonVisibility, false, "then the first app(variant) is not adaptable");
				assert.equal(aAppVariantOverviewAttributes[1].adaptUIButtonVisibility, true, "then the second app is adaptable");

				assert.equal(aAppVariantOverviewAttributes[0].currentStatus, "Just created", "then the first app(variant) is highlighted blue");
			});
		});
	});

	QUnit.module("Given an AppVariantOverviewUtils is instantiated", {
		beforeEach: function () {
			this.originalUShell = sap.ushell;
			// this overrides the ushell globally => we need to restore it!

			sap.ushell = jQuery.extend({}, sap.ushell, {
				Container : {
					getService : function(sServiceName) {
						return {
							getLinks: function(oNavigationParams) {
								return Promise.resolve([]);
							}
						};
					}
				}
			});
		},
		afterEach: function () {
			sandbox.restore();
			sap.ushell = this.originalUShell;
		}
	}, function() {
		QUnit.test("When getAppVariantOverview() method is called on an app variant (currently adapting) which is also a reference app and has intent information present", function (assert) {
			var oResult = {
				response: {
					items: [
						{
							appId : "id1",
							title : "title1",
							subTitle : "subTitle1",
							description : "description1",
							iconUrl : "sap-icon://history",
							isOriginal : true,
							originLayer: "VENDOR",
							isAppVariant: true,
							descriptorUrl : "url1",
							hasStartableIntent: true,
							startWith: {
								"semanticObject": "SemObj",
								"action": "Action",
								"parameters": {
									"sap-appvar-id" : "id1"
								}
							}
						}
					]
				}
			};

			sandbox.stub(AppVariantOverviewUtils, "sendRequest").returns(Promise.resolve(oResult));

			return AppVariantOverviewUtils.getAppVariantOverview("testId").then(function(aAppVariantOverviewAttributes){
				assert.ok(aAppVariantOverviewAttributes, "then the result contains app variant overview properties");

				assert.strictEqual(aAppVariantOverviewAttributes[0].icon, "sap-icon://history", "then the icon of an app variant is correct");
				assert.strictEqual(aAppVariantOverviewAttributes[0].semanticObject, "SemObj", "then the semantic object is correct");
				assert.strictEqual(aAppVariantOverviewAttributes[0].action, "Action", "then the action is correct");
				assert.equal(aAppVariantOverviewAttributes[0].adaptUIButtonVisibility, false, "then the app is not adaptable");
			});
		});

		QUnit.test("When getDescriptor() method is called", function (assert) {
			var oResult = {
				response: {
					"sap.app" : {
						id : "testId"
					}
				}
			};

			sandbox.stub(AppVariantOverviewUtils, "sendRequest").returns(Promise.resolve(oResult));

			return AppVariantOverviewUtils.getDescriptor("testIdDescriptorUrl").then(function(oDescriptor){
				assert.ok(oDescriptor, "then the descriptor of the app is returned");

				assert.strictEqual(oDescriptor["sap.app"].id, "testId", "then the id of the descriptor is right");
			});
		});
	});
});