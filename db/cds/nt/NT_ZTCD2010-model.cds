namespace nt;
using util from '../util/util-model';


entity ZTCD2010 {
    key mandt      : String(10) not null @title: 'MANDT';
    key yyyymm     : String(30) not null @title: '결산년월';
    key com_code   : String(10) not null @title: '회사코드';
    key note_code  : String(10)          @title: '주석코드';
    key note_row   : String(10)          @title: '주석행';
    key note_col   : String(10)          @title: '주석열';
        curtype    : String(2)           @title: '환율타입';
        amt        : Decimal(15, 3)      @title: 'AMOUNT';
        attribute1 : String(100)         @title: '예비1';
        attribute2 : String(100)         @title: '예비2';
        attribute3 : String(100)         @title: '예비3';
}

extend ZTCD2010 with util.Managed;
