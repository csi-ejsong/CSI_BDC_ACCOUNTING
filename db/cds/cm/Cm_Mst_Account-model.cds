namespace cm;

using util from '../util/util-model';

entity Mst_Account {
    key account_code : String(10) not null @title: '계정코드';
        account_name : String(30) not null @title: '계정명';
        attribute1   : String(200)         @title: '예비1';
        attribute2   : String(200)         @title: '예비2';
        attribute3   : String(200)         @title: '예비3';
}

extend Mst_Account with util.Managed;
