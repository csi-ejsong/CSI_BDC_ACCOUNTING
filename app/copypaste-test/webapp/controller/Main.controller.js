sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/util/MockServer",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/plugins/CellSelector",
    "sap/m/plugins/CopyProvider",
    "sap/ui/table/plugins/MultiSelectionPlugin"
], (Controller, MockServer, ODataModel, MessageToast, JSONModel, MessageBox, CellSelector, CopyProvider, MultiSelectionPlugin) => {
    "use strict";
    let oCellSelector; let oCopyProvider;

    return Controller.extend("copypastetest.controller.Main", {
        async onInit() {
            if (window.isSecureContext) {
                const oTable = this.byId("table");
                oCellSelector = new CellSelector();
                oTable.addDependent(oCellSelector);

                const oView = this.getView();
                const oModel = new JSONModel();
                const oUiData = {
                    "initial": { "SelectionMode": "MultiToggle" },
                    "SelectionMode": [{ mode: "MultiToggle" }, { mode: "Single" }, { mode: "None" }]
                };
                oView.setModel(new JSONModel(oUiData), "ui");
                oView.setModel(oModel, "model");

                const oOriginalData = await this._fetchZTCD1000();

                oModel.setData({ items: oOriginalData })
                
                oCopyProvider = new CopyProvider({ extractData: this.extractData, copy: this.onCopy });
                oTable.addDependent(oCopyProvider);

                const oToolbar = this.byId("toolbar");
                oToolbar.addContent(oCopyProvider.getCopyButton());
            }
        },
        _fetchZTCD1000: async function(){
            // 여기 ListZTCD1000데이터 가져올 수 있어야 함.
            const oModel = this.getView().getModel('model');
            const data = oModel.getProperty("/");
            // const aOriginalData = await data.requestContexts().then(contexts => {
            //   return contexts.map(ctx => ctx.getObject());
            // })
            return data;
        },
        onSelectChange: function (oEvent) {
            const aParams = oEvent.getParameters();
            const oTable = this.byId("table");
            MultiSelectionPlugin.findOn(oTable).setSelectionMode(aParams.selectedItem.getKey());
        },
        extractData: function (oRowContext, oColumn) {
            const oValue = oRowContext.getProperty(oColumn.getSortProperty());
            return oColumn.__type ? oColumn.__type.formatValue(oValue, "string") : oValue;
        },
        onCopy: function (oEvent) {
            MessageToast.show("Selection copied to clipboard");
        },
        onPaste: function (oEvent) {
            const oView = this.getView();

            async function handlePaste(aData, oCellInfo) {
                // Step 1. OData에서 현재 바인딩된 데이터 가져오기
                
                const oModel = oView.getModel("model");
                const data = oModel.getProperty("/");
                
                let aExtraData = [];

                // Step 2. 가공 또는 추가 데이터 생성
                for(let i = 0; i < aData.length; i++){
                    aExtraData.push({com_code: aData[i][0], com_name: aData[i][1], account_code: aData[i][2], account_name: aData[i][3], amt: aData[i][4] }) ;
                }

                 // Step 3. 합치기
                // const aCombinedData = [...aOriginalData, ...aExtraData];

                // Step 4. JSONModel에 넣기
                oModel.setProperty("/items", aExtraData);
                // 테이블 재바인딩
                oTable.bindItems({
                    path: "combined>/items",
                    template: oTable.getBindingInfo("items").template.clone()
                });
                MessageToast.show("Pasted Data (on " + (oCellInfo ? "Cell (" + (oCellInfo.from.rowIndex + "/" + oCellInfo.from.colIndex) + ")" : "Table") + " Level):\n\n" + aData);
            }

            const aData = oEvent.getParameter("data");
            const oRange = oCellSelector.getSelectionRange();

            if (oRange) {
                MessageBox.confirm("Do you want to paste at position " + (oRange.from.rowIndex + "/" + oRange.from.colIndex) + "?", {
                    onClose: function (sAction) {
                        handlePaste(aData, sAction === "OK" ? oRange : null);
                    }
                });
            } else {
                handlePaste(aData, null);
            }
        }
    });
});