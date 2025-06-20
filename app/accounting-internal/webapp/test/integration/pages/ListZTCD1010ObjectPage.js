sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'accountinginternal',
            componentId: 'ListZTCD1010ObjectPage',
            contextPath: '/ListZTCD1010'
        },
        CustomPageDefinitions
    );
});