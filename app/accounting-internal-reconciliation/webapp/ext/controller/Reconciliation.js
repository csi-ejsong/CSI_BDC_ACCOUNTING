sap.ui.define([
    "sap/m/MessageToast"
], function(MessageToast) {
    'use strict';

    return {
        onInit: function(oEvent) {
            MessageToast.show("Custom handler invoked.");
        },
        onBeforeRebindTableExtension: function(oEvent) {
        },
        callCheckInternal: async function(oEvent) { 
            let transType = '';
            let oFilter_yearMonth = sap.ui.core.Fragment.byId("accountinginternalreconciliation::ListZTCD1010List--fe::FilterBar::ListZTCD1010::CustomFilterField::YearMonth", "YearMonth"),
                oFilter_transType = sap.ui.getCore().byId("accountinginternalreconciliation::ListZTCD1010List--fe::FilterBar::ListZTCD1010::FilterField::transtype");
            
            if (!oFilter_yearMonth || !oFilter_transType) {
                MessageToast.show("❌ FilterBar를 찾을 수 없습니다.");
                return;
              }
        
              // FilterBar의 필터 입력 값 가져오기
                let yyyymm = oFilter_yearMonth.getValue();

              const oConditions = oFilter_transType.getConditions();
              transType = oConditions?.[0]?.values?.[0] || "";

            if(yyyymm == '') {
                MessageToast.show("결산년월을 입력해주세요.");
                return;
            }
            
            //URLSearchParams

            const response = await fetch(`/odata/v4/ztcd1010/getZTCD1010DataFunc(yyyymm= '${oFilter_yearMonth.getValue()}')`, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  "Accept": "application/json"
                }
              });

              if(!response.ok){
                throw new Error("Failed to call function: " + response.statusText);
              }

              sap.m.MessageToast.show("Function Result: " + '완료되었습니다.');
            
        }
    };
});
