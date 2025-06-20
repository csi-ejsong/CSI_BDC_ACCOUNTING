namespace cm;

using util from '../util/util-model';

entity Mst_Company {
      key com_code   : String(10) not null @title: '법인코드';
          com_name   : String(30) not null @title: '법인명';
          attribute1 : String(200)         @title: '예비1';
          attribute2 : String(200)         @title: '예비2';
          attribute3 : String(200)         @title: '예비3';
}

extend Mst_Company with util.Managed;
