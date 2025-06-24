namespace cm;
using util from '../util/util-model';

entity Mst_NoteCode {
      key note_code  : String(10) not null @title: '주석코드';
          note_name  : String(30)          @title: '주석명';
          level      : Integer             @title: '레벨';
          uppernote  : String(10)          @title: '상위주석코드';
          sortorder  : Integer             @title: '정렬순서';
          attribute1 : String(200)         @title: '예비1';
          attribute2 : String(200)         @title: '예비2';
          attribute3 : String(200)         @title: '예비3';
}

extend Mst_NoteCode with util.Managed;
