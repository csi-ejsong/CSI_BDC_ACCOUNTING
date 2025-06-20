sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'accounting',
            componentId: 'ListZTCD1000ObjectPage',
            contextPath: '/ListZTCD1000'
        },
        CustomPageDefinitions
    );
});