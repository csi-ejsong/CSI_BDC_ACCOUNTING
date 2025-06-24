namespace nt;
using util from '../util/util-model';


entity ZTCD2000 {
    key note_code  : String(10) not null @title: '주석코드';
    key note_row   : String(10) not null @title: '주석행';
    key note_col   : String(10) not null @title: '주석열';
        calcforamt : Decimal(15, 3)      @title: 'AMOUNT';
        attribute1 : String(100)         @title: '예비1';
        attribute2 : String(100)         @title: '예비2';
        attribute3 : String(100)         @title: '예비3';
}

extend ZTCD2000 with util.Managed;
