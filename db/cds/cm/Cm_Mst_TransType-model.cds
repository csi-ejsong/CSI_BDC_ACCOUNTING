namespace cm;

using util from '../util/util-model';

entity Mst_TransType {
    key transtype       : String(10) not null @title: '거래유형';
        transtype_name  : String(30) not null @title: '거래유형명';
}

extend Mst_TransType with util.Managed;
