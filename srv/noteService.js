module.exports = class NoteService extends cds.ApplicationService {

    async init() {
        // 저장버튼 클릭 시 ZTCD2000 업데이트
        this.on('updateZTCD2000', async (req) => {
            // 디버깅용 console
            console.log(req.data.in);

            const tx = cds.transaction(req);
            const param = req.data.in;

            if (!Array.isArray(param)) {
                return req.error(400, "'in' must be an array");
            }

            const now = new Date().toISOString();
            const user_id = 'SYSTEM DATA';

            console.log("param:", param)
            for (const entry of param) {
                const { note_code, note_row, note_col, calcforamt } = entry;

                const existing = await tx.run(
                    SELECT.one.from('NT_ZTCD2000').where({ note_code, note_row, note_col })
                );

                try {
                    if (existing) {
                        await tx.run(
                            UPDATE('NT_ZTCD2000')
                                .set({
                                    calcforamt,
                                    update_user_id: user_id,
                                    local_update_dtm: now,
                                    system_update_dtm: now
                                }).where({ note_code, note_row, note_col })
                        );

                    } else {
                        await tx.run(
                            INSERT.into('NT_ZTCD2000')
                                .entries({
                                    ...entry,
                                    create_user_id: user_id,
                                    local_create_dtm: now,
                                    system_create_dtm: now
                                })
                        )
                    }
                } catch (e) {
                    await tx.rollback();
                    return req.error(500, `업데이트 실패: ${e.message}`)
                }
            }
            await tx.commit();
            return { status: "success", message: "업데이트 완료" }
        })

        this.on('updateZTCD2010', async (req) => {
            console.log(req.data.in);

            const tx = cds.transaction(req);
            const param = req.data.in;

            if (!Array.isArray(param)) {
                return req.error(400, "'in' must be an array");
            }

            const now = new Date().toISOString();
            const user_id = 'SYSTEM DATA';

            for (const entry of param) {
                const { mandt, yyyymm, com_code, note_code, note_row, note_col, curtype, inputtype, amt } = entry;

                const existing = await tx.run(
                    SELECT.one.from('NT_ZTCD2010').where({ mandt, yyyymm, com_code, note_code, note_row, note_col, curtype, inputtype })
                );
                try {
                    if (existing) {
                        await tx.run(
                            UPDATE('NT_ZTCD2010')
                                .set({
                                    amt,
                                    update_user_id: user_id,
                                    local_update_dtm: now,
                                    system_update_dtm: now
                                }).where({ note_code, note_row, note_col })
                        );

                    } else {
                        await tx.run(
                            INSERT.into('NT_ZTCD2010')
                                .entries({
                                    ...entry,
                                    curtype: curtype,
                                    create_user_id: user_id,
                                    local_create_dtm: now,
                                    system_create_dtm: now
                                })
                        )
                    }
                }
                catch (e) {
                    await tx.rollback();
                    return req.error(500, `업데이트 실패: ${e.message}`)

                    throw e;
                }
            }
            await tx.commit();
            return { status: "success", message: "업데이트 완료" }
        })
        // 주석 추출 (UPDATE ZTCD2010)
        this.on('executeLogic', async (req) => {
            const tx = cds.tx(req);

            // 임의값
            const mandt = "100",
                yyyymm = "202503",
                com_code = "K001",
                now = new Date().toISOString();

            const lstZtcd1000 = await tx.run(SELECT.from('FM_ZTCD1000').where({ yyyymm, com_code }));
            const rstZtcd1000 = new Map(lstZtcd1000.map(data => [data.ACCOUNT_CODE, data.AMT]));

            const lstZtcd2000 = await tx.run(SELECT.from('NT_ZTCD2000'));
            const rstZtcd2000 = [];

            let trxResult = '';

            for (const row of lstZtcd2000) {
                const sign = row.CALCFORAMT.split("+");
                let totalAmt = 0;

                for (const acct of sign) {
                    const amt = rstZtcd1000.get(acct.trim());

                    if (amt) totalAmt += Number(amt);
                }

                try {
                    trxResult = await tx.run(
                        UPDATE("NT_ZTCD2010")
                            .set({ AMT: totalAmt, local_update_dtm: now })
                            .where({
                                MANDT: mandt,
                                YYYYMM: yyyymm,
                                COM_CODE: com_code,
                                NOTE_CODE: row.NOTE_CODE,
                                NOTE_ROW: row.NOTE_ROW,
                                NOTE_COL: row.NOTE_COL
                            })
                    )
                } catch (e) {
                    await tx.rollback();

                    return req.error(500, `업데이트 실패: ${e.message}`)
                    throw e;
                }
            }
            await tx.commit();
            return { status: "success", message: "추출 완료" }

            // await UPSERT.into("NT_ZTCD2010").entries(rstZtcd2000);
        });
        /**
         * company별 취합 데이터 가져오기
         */
        this.on('get_com_ztcd2010', async (req) => {
            const tx = cds.tx(req);
            const { yyyymm, com_code } = req.data;

        });
        this.on('get_amt_total', async (req) => {
            const tx = cds.tx(req);
            const { note_code, com_code, yyyymm } = req.data;

            const whereClause = {
                note_code,
                yyyymm,
                inputtype: { in: ['INPUT', 'EXTRACT'] }
            };

            if (com_code != 'undefined') {
                whereClause.com_code = com_code
            }

            // 1. 원본 트랜잭션
            const lstZtcd2010 = await tx.run(
                SELECT.from('NT_ZTCD2010').where(whereClause)
            );

            // 2. row코드 마스터 테이블
            const lstNoteRow = await tx.run(
                SELECT.from('CM_MST_NOTEROW').where({ note_row: { like: `%${note_code}%` } })
            );

            // 3. hierarchy 정보 가져오기
            // ""(Parent) => [](Children)
            let rowTreeMap = new Map();

            lstNoteRow.map((ctx, index) => {
                const obj = ctx;
                // []에 최상위 root 셋팅
                if (!rowTreeMap.has(obj.UPPERROW)) rowTreeMap.set(obj.UPPERROW, []);
                rowTreeMap.get(obj.UPPERROW).push(obj.NOTE_ROW);
            });

            // ""(Parent) 형태만 배열형태로 간직
            const parentRows = [...rowTreeMap.keys()];

            // 4. 자식 데이터는 모두 가져오는 함수
            function getAllChildren(parent, acc = []) {
                const children = rowTreeMap.get(parent) || [];
                for (const child of children) {
                    acc.push(child);
                }
                return acc;
            }

            // 5. 집계
            // children들만 집계하면됨. Parent는 다 합계니까
            let result = [];
            for (const parent of parentRows) {
                const children = getAllChildren(parent);
                const filtered = lstZtcd2010.filter(r => children.includes(r.NOTE_ROW));
                const note_row = lstNoteRow.filter(r => r.NOTE_ROW === parent);
                const note_row_name = note_row[0]?.NOTE_ROW_NAME;

                const grouped = {};

                for (const f of filtered) {
                    const key = `${f.NOTE_CODE}|${f.NOTE_COL}`;
                    grouped[key] = (grouped[key] || 0) + Number(f.AMT || 0);
                }

                const obj = {
                    note_code: note_code,
                    note_row: com_code != 'undefined' ? parent + '_' + com_code : parent,
                    note_row_name: note_row_name
                }

                for (const key in grouped) {
                    const [note_code, note_col] = key.split('|');
                    const fieldName = `calcforamt_${note_col}`;

                    obj[fieldName] = grouped[key];
                    obj.note_row_name = note_row_name;
                }
                // calcforamt_ 값이 있는 것만 추출
                if (Object.keys(obj).some(key => key.startsWith('calcforamt_'))) result.push(obj);
            }
            return result;
        })

        await super.init();
    }
}