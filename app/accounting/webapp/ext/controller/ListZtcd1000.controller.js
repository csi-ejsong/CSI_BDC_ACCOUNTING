sap.ui.define(['sap/ui/core/mvc/ControllerExtension'], function (ControllerExtension) {
	'use strict';

	return ControllerExtension.extend('accounting.ext.controller.ListZtcd1000', {
		// this section allows to extend lifecycle hooks or hooks provided by Fiori element
		override: {
			/**
             * Called when a controller is instantiated and its View controls (if available) are already created.
             * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
             * @memberOf accounting.ext.controller.ListZtcd1000
             */
			onInit: async function () {
				// you can access the Fiori elements extensionAPI via this.base.getExtensionAPI
				
				var oModel = this.base.getExtensionAPI().getModel();
				
			},
			onAfterRendering: function(){
				const oView = this.base.getView();
				 // 1. FilterBar ID를 통해 컨트롤 직접 찾기
				const oFilterBar = oView.byId("accounting::ListZTCD1000List--fe::FilterBar::ListZTCD1000::CustomFilterField::YearMonth");

				if (!oFilterBar) {
					console.error("❌ FilterBar가 아직 준비되지 않음");
					return;
				} 
			}
		}
	});
});
