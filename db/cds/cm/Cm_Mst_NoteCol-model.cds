namespace cm;
using util from '../util/util-model';

entity Mst_NoteCol {
      key note_col      : String(10) not null @title: '주석열';
          note_col_name : String(30)          @title: '주석열명';
          level         : Integer             @title: '레벨';
          uppercol      : String(10)          @title: '상위주석열';
          sortorder     : Integer             @title: '정렬순서';
          attribute1    : String(100)         @title: '예비1';
          attribute2    : String(100)         @title: '예비2';
          attribute3    : String(100)         @title: '예비3';
}

extend Mst_NoteCol with util.Managed;
