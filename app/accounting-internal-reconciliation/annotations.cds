using cm.excelUploadService as service from '../../srv/cds/excelUpload';

annotate service.ListZTCD1010 with {
    matchkey @UI.MultiLineText : true
};

