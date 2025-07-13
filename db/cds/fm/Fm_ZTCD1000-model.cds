namespace fm;

using util from '../util/util-model';
using { cm.Mst_Company as Company } from '../cm/Cm_Mst_Company-model';
using { cm.Mst_Account as Account } from '../cm/Cm_Mst_Account-model';

entity ZTCD1000 {
    key mandt        : String(10)                   not null @title: 'MANDT';
    key yyyymm       : String(30)                   not null @title: '결산년월';
        company      : Association to many Company on company.com_code = $self.com_code;
    key com_code     : String(10)                   not null @title: '법인코드';
        // com_name     : String(30)                            @title: '법인명';
        account      : Association to many Account on account.account_code = $self.account_code;
    key account_code : String(10)                   not null @title: '계정코드';
        // account_name : String(30)                            @title: '계정명';
        amt          : Decimal(15, 3)               not null @title: '금액';
        attribute1   : String(200)                           @title: '예비1';
        attribute2   : String(200)                           @title: '예비2';
        attribute3   : String(200)                           @title: '예비3';

        @cds.on.insert : $localNow
        local_create_dtm: Timestamp                          @title: '로컬생성일시';

        @cds.on.insert : $user
        create_user_id : String                              @title: '생성자';

        @cds.on.insert : $localNow
        system_create_dtm: Timestamp                         @title: '시스템생성일시';
}

extend ZTCD1000 with util.Managed;