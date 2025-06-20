sap.ui.define([], function () {
    "use strict";
    return {
        /**
         * Create Dialog to Upload Spreadsheet and open it
         * @param {*} oEvent
         */

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
                        tableId: "accounting::ListZTCD1000List--fe::table::ListZTCD1000::LineItem-innerTable",
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
                const sheetData = oEvent.getParameter("sheetData");
					let errorArray = [];
					for (const [index, row] of sheetData.entries()) {
						//check for invalid account_code
                        for(const key in row) {
                            let raw = row[key].rawValue;
                            if(key === '계정코드[account_code]' && String(raw).length > 4){
                                
                                const error = {
                                    title: "계정코드 오류",
                                    row: index + 2,
                                    group: true,
                                    rawValue: row[key].rawValue,
                                    ui5type: "Error"
                                };
                                errorArray.push(error);
                            }
                        }
						
					}
					oEvent.getSource().addArrayToMessages(errorArray);
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
                        tableId: "accounting::ListZTCD1000List--fe::table::ListZTCD1000::LineItem-innerTable"
                    },
                });

            this.spreadsheetUpload.openSpreadsheetUploadDialog();
            this.editFlow.getView().setBusy(false);
        }
    }
})