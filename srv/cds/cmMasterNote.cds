using {cm.Mst_NoteCode as NoteCode} from '../../db/cds/cm/Cm_Mst_NoteCode-model';
using {cm.Mst_NoteRow as NoteRow} from '../../db/cds/cm/Cm_Mst_NoteRow-model';
using {cm.Mst_NoteCol as NoteCol} from '../../db/cds/cm/Cm_Mst_NoteCol-model';
using {nt.ZTCD2000 as ZTCD2000} from '../../db/cds/nt/NT_ZTCD2000-model';
using {nt.ZTCD2010 as ZTCD2010} from '../../db/cds/nt/NT_ZTCD2010-model';

namespace cm;

service noteService {
    entity ListNote as projection on NoteCode;

    entity ListRow as projection on NoteRow;
    
    entity ListCol as projection on NoteCol;

    entity ListZTCD2000 as projection on ZTCD2000;

    entity ListZTCD2100 as projection on ZTCD2010;
}