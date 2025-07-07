using {cm.Mst_NoteCode as NoteCode} from '../../db/cds/cm/Cm_Mst_NoteCode-model';
using {cm.Mst_NoteRow as NoteRow} from '../../db/cds/cm/Cm_Mst_NoteRow-model';
using {cm.Mst_NoteCol as NoteCol} from '../../db/cds/cm/Cm_Mst_NoteCol-model';
using {nt.ZTCD2000 as ZTCD2000} from '../../db/cds/nt/NT_ZTCD2000-model';
using {nt.ZTCD2010 as ZTCD2010} from '../../db/cds/nt/NT_ZTCD2010-model';

namespace cm;

@impl: 'srv/noteService.js'
service noteService {
    entity ListNote     as projection on NoteCode;
    entity ListRow      as projection on NoteRow;
    entity ListCol      as projection on NoteCol;
    
    entity ListZTCD2000 as projection on ZTCD2000 {
        key note_code,
        key note_row,
        key note_col,
            calcforamt
    } actions {
            action updateZTCD2000(in: many $self)
    };

    entity ListZTCD2010 as select from ZTCD2010 {
        key mandt,
        key yyyymm,
        key com_code,
        key note_code,
        key note_row,
        key note_col,
        key inputtype,
        amt
    } where inputtype in ('INPUT', 'EXTRACT')
    actions {
        action updateZTCD2010(in: many $self);
    };

    entity ListAdjZTCD2010 as select from ZTCD2010 {
        key mandt,
        key yyyymm,
        key com_code,
        key note_code,
        key note_row,
        key note_col,
        key inputtype,
        amt
    } where inputtype in ('ADJ');

    // c
    action executeLogic(param: array of ListZTCD2010);

    // ztcd2010 합계 구하기
    function get_amt_total(note_code: String, yyyymm: String, com_code: String) returns array of ListZTCD2010;
    
    // 법인별 ztcd2010 가져오기
    function get_com_ztcd2010(yyyymm: String, com_code: String) returns array of ListZTCD2010;
}