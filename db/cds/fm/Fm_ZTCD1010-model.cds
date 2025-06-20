namespace fm;

using util from '../util/util-model';

entity ZTCD1010 {
    key mandt        : String(10)           not null @title: 'MANDT';
    key yyyymm       : String(30)           not null @title: '결산년월';
    key com_code     : String(10)           not null @title: '법인코드';
        com_name     : String(30)                    @title: '법인명';
    key trd_com_code : String(10)           not null @title: '거래법인코드';
        trd_com_name : String(30)                    @title: '거래법인명';
    key account_code : String(10)           not null @title: '계정코드';
        account_name : String(30)                    @title: '계정명';
        ocdate       : String(8)                     @title: '증빙일자';
    key transtype    : String(2)                     @title: '전표유형';
        matchkey     : String(30)                    @title: '대사키';
        amt          : Decimal(15, 3)       not null @title: '금액';
        def_Amt      : Decimal(15, 3)                @title: '차이금액';
        detail_desc  : String(50)                    @title: '비고';
        attribute1   : String(200)                   @title: '예비1';
        attribute2   : String(200)                   @title: '예비2';
        attribute3   : String(200)                   @title: '예비3';

        @cds.on.insert : $localNow
        local_create_dtm: Timestamp                  @title: '로컬생성일시';

        @cds.on.insert : $user
        create_user_id : String(255)                  @title: '생성자';

        @cds.on.insert : $localNow
        system_create_dtm: Timestamp                  @title: '시스템생성일시';
}

extend ZTCD1010 with util.Managed;