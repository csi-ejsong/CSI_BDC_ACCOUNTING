sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'accounting/test/integration/FirstJourney',
		'accounting/test/integration/pages/ListZTCD1000List',
		'accounting/test/integration/pages/ListZTCD1000ObjectPage'
    ],
    function(JourneyRunner, opaJourney, ListZTCD1000List, ListZTCD1000ObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('accounting') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheListZTCD1000List: ListZTCD1000List,
					onTheListZTCD1000ObjectPage: ListZTCD1000ObjectPage
                }
            },
            opaJourney.run
        );
    }
);