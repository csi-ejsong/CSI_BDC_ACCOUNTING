sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ListReport(
        {
            appId: 'accounting',
            componentId: 'ListZTCD1000List',
            contextPath: '/ListZTCD1000'
        },
        CustomPageDefinitions
    );
});