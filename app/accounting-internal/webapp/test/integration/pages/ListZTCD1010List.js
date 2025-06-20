sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ListReport(
        {
            appId: 'accountinginternal',
            componentId: 'ListZTCD1010List',
            contextPath: '/ListZTCD1010'
        },
        CustomPageDefinitions
    );
});