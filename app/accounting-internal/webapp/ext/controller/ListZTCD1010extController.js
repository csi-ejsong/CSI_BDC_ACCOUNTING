sap.ui.define([
    "sap/m/MessageToast"
], function(MessageToast) {
    'use strict';

    return {
        openSpreadsheetUploadDialogTable: async function (oEvent) {
            this.editFlow.getView().setBusyIndicatorDelay(0);
            this.editFlow.getView().setBusy(true);
            // prettier-ignore
            this.spreadsheetUpload = await this.editFlow.getView()
                .getController()
                .getAppComponent()
                .createComponent({
                    usage: "spreadsheetImporter",
                    async: true,
                    componentData: {
                        context: this,
                        showDownloadButton: true,
                        tableId: "accountinginternal::ListZTCD1010List--fe::table::ListZTCD1010::LineItem-innerTable",
                        spreadsheetFileName: "Upload.xlsx",
                        i18nModel: this.getModel("i18n"),
                        deepDownloadConfig: {
                            depth: 0
                        },
                        manualUpload: true,
                        editable: true
                    }
                });

            this.spreadsheetUpload.attachCheckBeforeRead(function(oEvent) {
                
            }, this);

            this.spreadsheetUpload.openSpreadsheetUploadDialog();
            this.editFlow.getView().setBusy(false);
        },
        
        openSpreadsheetUploadDialog: async function (oEvent) {
            this.editFlow.getView().setBusyIndicatorDelay(0);
            this.editFlow.getView().setBusy(true);
            this.spreadsheetUpload = await this.editFlow.getView()
                .getController()
                .getAppComponent()
                .createComponent({
                    usage: "spreadsheetImporter",
                    async: true,
                    componentData: {
                        context: this,
                        tableId: "accountinginternal::ListZTCD1010List--fe::table::ListZTCD1010::LineItem-innerTable"
                    },
                });

            this.spreadsheetUpload.openSpreadsheetUploadDialog();
            this.editFlow.getView().setBusy(false);
        }
    };
});
