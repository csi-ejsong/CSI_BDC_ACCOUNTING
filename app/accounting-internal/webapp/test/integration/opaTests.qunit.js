sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'accountinginternal/test/integration/FirstJourney',
		'accountinginternal/test/integration/pages/ListZTCD1010List',
		'accountinginternal/test/integration/pages/ListZTCD1010ObjectPage'
    ],
    function(JourneyRunner, opaJourney, ListZTCD1010List, ListZTCD1010ObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('accountinginternal') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheListZTCD1010List: ListZTCD1010List,
					onTheListZTCD1010ObjectPage: ListZTCD1010ObjectPage
                }
            },
            opaJourney.run
        );
    }
);