using {fm.ZTCD1000 as ZTCD1000} from '../../db/cds/fm/Fm_ZTCD1000-model';
using {fm.ZTCD1010 as ZTCD1010} from '../../db/cds/fm/Fm_ZTCD1010-model';
using {cm.Mst_Account as Account} from '../../db/cds/cm/Cm_Mst_Account-model';
using {cm.Mst_Company as Company} from '../../db/cds/cm/Cm_Mst_Company-model';
using {cm.Mst_TransType as TransType} from '../../db/cds/cm/Cm_Mst_TransType-model';

namespace cm;

service excelUploadService {
    
    entity ListCompany as projection on Company;
    entity ListAccount as projection on Account;
    entity ListTransType as projection on TransType;

    // @odata.draft.enabled    Aaed
    entity ListZTCD1000 as projection on ZTCD1000 {
    
        key mandt,
        key yyyymm,
        company,
        key com_code,
        account,
        key account_code,
        amt,

        local_create_dtm: Timestamp,
        create_user_id: String,
        system_create_dtm: Timestamp,
    };
    
    annotate ListZTCD1000 with @UI.LineItem: [
        { Value: account.account_name},
        { Value: company.com_name},
    ];
    entity ListZTCD1010 as projection on ZTCD1010 {
    
        key mandt,     
        key yyyymm,       
        key com_code,     
        com_name,     
        key trd_com_code, 
        trd_com_name, 
        key account_code, 
        account_name, 
        ocdate,       
        key transtype,    
        matchkey,     
        amt,          
        def_Amt,  
        detail_desc,    

        local_create_dtm: Timestamp,
        create_user_id: String,
        system_create_dtm: Timestamp,

    };
    
}

