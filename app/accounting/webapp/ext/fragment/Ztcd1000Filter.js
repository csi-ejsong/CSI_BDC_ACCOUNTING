sap.ui.define(["sap/ui/model/Filter", "sap/ui/model/FilterOperator"], function (Filter, FilterOperator) {
    "use strict";
    return {
        onChangeDatePicker: function (oEvent) {
            const oDate = oEvent.getSource().getDateValue();

            if (!oDate) return;
            const yyyymm = oDate ? `${oDate.getFullYear()}${('0' + (oDate.getMonth() + 1)).slice(-2)}` : "";
            
            this.setFilterValues("yyyymm", yyyymm)

        },
        onFilterInputFormatValue: function(sValue){
            if (!sValue) {
                return ValueState.Error;
            } else {
                return ValueState.None;
            }
        }
    };
});
