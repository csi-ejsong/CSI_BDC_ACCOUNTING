sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/MessageToast"
], (BaseController, JSONModel, Filter, FilterOperator, MessageToast) => {
  "use strict";

  return BaseController.extend("notemenu.controller.DetailPage", {
    onInit() {
      this.getView().setModel(this.getOwnerComponent().getModel());
      this.getOwnerComponent().getRouter().getRoute("DetailPage").attachPatternMatched(this._onPatternMatched, this);
    },
    _onPatternMatched: async function (oEvent) {
      const note_code = oEvent.getParameter("arguments").note_code;
      this._note_code = note_code;

      this.getZTCD2010(note_code);
    },
    async getZTCD2010(note_code) {
      //======================Reset Table Column======================
      const oView = this.getView();

      //======================변수 선언======================
      const aTableIds = oView.findAggregatedObjects(true, function (oControl) {
        return oControl instanceof sap.ui.table.TreeTable;
      }).map(oTable => {
        const prefix = "container-notemenu---DetailPage--"
        const fullId = oTable.getId()
        return fullId.substring(prefix.length);
      });

      this.resetTable(aTableIds);

      const oModel = this.getOwnerComponent().getModel();
      const oCommonModel = this.getView().getModel("commonService");

      const oListRow = oModel.bindList("/ListRow");
      const oListCol = oModel.bindList("/ListCol");
      const oListZTCD2010 = oModel.bindList("/ListZTCD2010");
      const oListAdjZTCD2010 = oModel.bindList("/ListAdjZTCD2010");
      const oListCompany = oCommonModel.bindList("/ListCompany");

      const listZTCD2010 = await oListZTCD2010.requestContexts().then(contexts =>
        contexts
          .filter(ctx => (ctx.getObject().note_code).includes(note_code))
          .map(ctx => ctx.getObject())
      )

      const listAdjZTCD2010 = await oListAdjZTCD2010.requestContexts().then(contexts =>
        contexts
          .filter(ctx => (ctx.getObject().note_code).includes(note_code))
          .map(ctx => ctx.getObject())
      )

      const listCompany = await oListCompany.requestContexts().then(contexts =>
        contexts
          .filter(ctx => !(ctx.getObject().com_code).includes("TOTAL"))
          .map(ctx => ctx.getObject())
      );

      const listCol = await oListCol.requestContexts().then(contexts =>
        contexts
          .filter(ctx => (ctx.getObject().note_col || "").includes(note_code))
          .map(ctx => ctx.getObject())
      );

      const listRow = await oListRow.requestContexts().then(contexts =>
        contexts
          .filter(ctx => (ctx.getObject().note_row || "").includes(note_code))
          .map(ctx => ctx.getObject())
      );

      const column = {
        note_col: "-1",
        note_col_name: "법인"
      }

      listCol.unshift(column);

      //======================list Row/Col/ZTCD2010 데이터======================

      let listRowFinal = [...listRow],
        listRowAdj = [...listRow],
        listRowCom = [...listRow];

      let lstZtcd2010Final = [...listZTCD2010],
        lstZtcd2010Adj = [...listAdjZTCD2010],
        lstZtcd2010Com = [...listZTCD2010];

      const tmpAmtTotal = await this.getAmtTotal(note_code);
      //======================Row 및 Column 생성======================

      for (let id of aTableIds) {
        const jModelRow = new sap.ui.model.json.JSONModel();
        let treeListRow = '',
          lstAmtTotal = tmpAmtTotal.value;

        switch (id) {
          case 'TreeTableFinal':
            //======================연결 최종 데이터에서 연결 조정 증감데이터 반영======================
            const lstHieFinal = this.getInfoHie(listRowFinal);
            this.setAmt(lstZtcd2010Adj, lstHieFinal, lstZtcd2010Final);

            let baseFinalRow = await this.makeRow(listRowFinal, listCol, lstZtcd2010Final, note_code, id)
            baseFinalRow = baseFinalRow.map(obj => ({ ...obj }));

            let lstRowFinal = [...baseFinalRow];

            const filterFinalFields = lstRowFinal.flatMap(row => {
              if (typeof row !== 'object' || lstHieFinal.includes(row.note_row)) return []; // 객체가 아닌 경우 스킵

              return Object.entries(row)
                .filter(([key, value]) => key.startsWith('calcforamt_') && value !== "")
                .map(([key, value]) => ({
                  note_code: row.note_code,
                  upperrow: row.upperrow,
                  note_row_name: row.note_row_name,
                  note_row: row.note_row,
                  note_col: key,
                  amt: value
                }));
            });

            const lstTmpAmtTotal = await this.getTmpAmtTotal(lstRowFinal, filterFinalFields);
            this.setAmtTotal(lstRowFinal, lstTmpAmtTotal, "전사합계");

            treeListRow = this.convertFlatToTree(lstRowFinal);
            treeListRow = treeListRow[0].children; // 일단 최상위 고민해봐야함.

            break;
          case 'TreeTableAdj':
            const lstHieAdj = this.getInfoHie(listRowAdj);
            let baseRowAdj = await this.makeRow(listRowAdj, listCol, lstZtcd2010Adj, note_code, id, lstHieAdj);
            baseRowAdj = baseRowAdj.map(obj => ({ ...obj }));

            let lstRowAdj = [...baseRowAdj];

            //=====================연결 조정 데이터 합계 반영======================
            const filterFields = lstRowAdj.flatMap(row => {
              if (typeof row !== 'object' || lstHieAdj.includes(row.note_row)) return []; // 객체가 아닌 경우 스킵

              return Object.entries(row)
                .filter(([key, value]) => key.startsWith('calcforamt_') && value !== "")
                .map(([key, value]) => ({
                  note_code: row.note_code,
                  upperrow: row.upperrow,
                  note_row_name: row.note_row_name,
                  note_row: row.note_row,
                  note_col: key,
                  amt: value
                }));
            });

            // 합계 관련 데이터
            const lstAmtTotalAdj = this.getTmpAmtTotal(lstRowAdj, filterFields);
            this.setAmtTotal(lstRowAdj, lstAmtTotalAdj, "연결조정");

            treeListRow = this.convertFlatToTree(lstRowAdj);
            treeListRow = treeListRow[0].children; // 일단 최상위 고민해봐야함.

            break;
          case 'TreeTableCom':
            let baseRow = await this.makeRow(listRowCom, listCol, lstZtcd2010Com, note_code, id);
            baseRow = baseRow.map(obj => ({ ...obj }));
            let baseAmtTotal = lstAmtTotal.map(obj => ({ ...obj }));

            let lstRowCom = [...baseRow];
            let lstComAmtTotal = [...baseAmtTotal];

            //=====================법인 데이터 추가======================
            const results = await Promise.all(listCompany.map(async company => {
              const tmpZtcd2010 = lstZtcd2010Com.filter(r => r.com_code === company.com_code);
              const amtTotal = await this.getAmtTotal(note_code, company.com_code);
              const rows = await this.makeRow(listRowCom, listCol, tmpZtcd2010, note_code, id);

              const adjustedRows = rows.map(row => ({
                ...row,
                note_row: `${row.note_row}_${company.com_code}`,
                upperrow: row.upperrow != null ? `${row.upperrow}_${company.com_code}` : company.com_code
              }));

              return {
                rows: adjustedRows,
                amtTotal: [...amtTotal.value] // 복사
              };
            }));

            results.forEach(({ rows, amtTotal }) => {
              lstRowCom.push(...rows);
              lstComAmtTotal.push(...amtTotal);
            });

            this.setAmtTotal(lstRowCom, lstComAmtTotal);

            treeListRow = this.convertFlatToTree(lstRowCom);
            // 이거 개선필요 - 합계가 있어서 문제임
            treeListRow = [
              ...treeListRow[0].children,
              ...treeListRow[1].children,
              ...treeListRow[2].children
            ]

            break;
          default:
        }

        jModelRow.setData(treeListRow);

        oView.setModel(jModelRow, `row_${id}`);
        this.makeColumn(listCol, id);
      }
    },
    /**
     * Row를 만드는 함수
     * @param {Array} listRow ROW 데이터
     * @param {Array} listCol COLUMN 데이터
     * @param {Array} listZTCD2010 실제 AMT값이 들어있는 ZTCD2010 테이블 데이터 
     * @param {String} note_code 
     * @param {String} id 테이블 아이디 
     * @returns 
     */
    async makeRow(listRow, listCol, listZTCD2010, note_code, id, listHie) {
      return listRow.map((row) => {
        const newRow = {
          ...row,
          note_code: note_code,
          editable: (id === 'TreeTableAdj' && listHie && !listHie.includes(row.note_row))
        };

        listCol.forEach((col) => {
          const fieldName = 'calcforamt_' + col.note_col;

          /**
           * listZTCD2010기준으로 돌면서 현재의 row와 colum이 있는지 체크 
           * calcforamt가 있는 row와 colum 리스트를 찾기 위함
           */
          const matched = listZTCD2010?.find(item =>
            item.note_row === row.note_row &&
            item.note_col === col.note_col
          );

          newRow[fieldName] = matched?.amt || "";
        });

        return newRow;
      })
    },
    /**
     * Column을 만드는 함수
     * @param {Array} listCol 
     * @param {String} id 테이블 아이디
     */
    makeColumn(listCol, id) {
      const oTable = this.byId(id);
      const oView = this.getView();

      const lstCol = listCol.map((ctx, index) => {
        let obj = { ...ctx };

        // 0번째 컬럼은 sum name
        if (index == 0) {
          obj.template = new sap.m.Text({ text: `{row_${id}>sum_name}` })
        }
        // 첫번째 컬럼은 row name
        else if (index == 1) {
          obj.template = new sap.m.Text({ text: `{row_${id}>note_row_name}` })
        }
        else {
          // 조정 테이블인 경우
          if (id == 'TreeTableAdj') {
            obj.template = new sap.m.Input({
              // customData: [
              //   new sap.ui.core.CustomData({ key: 'note_col_code', value: `${ctx.note_col}` })
              // ], 이런식으로 값 저장 가능
              value: {
                parts: [
                  { path: `row_${id}>calcforamt_${ctx.note_col}` },
                  { value: '', type: 'sap.ui.model.type.String' }
                ],
                type: new sap.ui.model.type.Currency({
                  showMeasure: false
                })
              }
              , editable: `{row_${id}>editable}`
              , textAlign:"End"
            }).addEventDelegate({
              onkeydown: function (oEvent) {
                if (oEvent.key === "Enter" || oEvent.keyCode === 13) {
                  this.onEnter(oEvent, this);
                }
              }.bind(this)
            });
          } else {
            obj.template = new sap.m.Input({
              value:
              // `{row_${id}>calcforamt_${ctx.note_col}}` 
              {
                parts: [
                  { path: `row_${id}>calcforamt_${ctx.note_col}` },
                  { value: '', type: 'sap.ui.model.type.String' }
                ],
                type: new sap.ui.model.type.Currency({
                  showMeasure: false
                })
              }
              , editable: `{row_${id}>editable}`
              , textAlign:"End"
            })
          }
        }
        return obj
      });

      const jModelCol = new JSONModel(lstCol);
      oView.setModel(jModelCol, `col_${id}`);

      //======================Add Column======================
      let aColumns = jModelCol.getProperty("/");

      aColumns.forEach(data => {
        oTable?.addColumn(new sap.ui.table.Column({
          label: new sap.m.Label({ text: data.note_col_name }),
          template: data.template
        }))
      })

    },
    /**
     * 합계 테이블에 적용
     * @param {Array} lstZtcd2010Adj 연결조정 테이블 데이터
     * @param {Object} lstHieFinal 연결최종 부모 계층 정보
     * @param {Array} lstZtcd2010Final 연결최종 테이블 데이터
     * @returns 연결최종 테이블에 적용될 LstZtcd2010 반환
     */
    async setAmt(lstZtcd2010Adj, lstHieFinal, lstZtcd2010Final) {

      lstZtcd2010Adj.forEach(item => {
        const target = lstZtcd2010Final.find(itemFinal => itemFinal.note_row == item.note_row && itemFinal.note_col == item.note_col)

        //조정 데이터 중 column 확인 
        if (target && item.note_col == target["note_col"]) {
          const currentVal = Number(target["amt"]) || 0;
          const changeVal = Number(item.amt);

          target["amt"] = currentVal + changeVal
        } else {
          // 조정 데이터에는 있지만 최종 데이터에는 없는거
          lstZtcd2010Final.push(item);
        }

        // 최종 데이터의 column별 AMT 의 합
        const target_sum = lstZtcd2010Final.find(item => lstHieFinal.includes(item.note_row))
        if (target_sum && item.note_col == target["note_col"]) {
          const currentVal = Number(`${target_sum["amt"]}`) || 0;
          const changeVal = Number(item.amt);

          target_sum["amt"] = currentVal + changeVal
        }
      })
      return lstZtcd2010Final;
    },
    /**
     * 합계 테이블에 적용하는 함수
     * @param {Array} lstRow 
     * @param {object} lstAmtTotal 
     * @param {String} sum_name 
     */
    setAmtTotal(lstRow, lstAmtTotal, sum_name) {
      const dataRow = [...lstRow];
      const dataAmtTotal = [...lstAmtTotal];

      dataAmtTotal.forEach(obj => {
        // 합계가 들어갈 note_row
        const target = dataRow.find(item => item.note_row.includes(obj.note_row));
        let tmp = target.upperrow.replace('N201020_', '');

        if (tmp === 'N201020') {
          tmp = '법인합계'
        } else if (tmp === 'K001') {
          tmp = '교보생명'
        } else {
          tmp = '교보증권'
        }
        const rowName = sum_name ? sum_name : tmp

        // 있으면 해당 값에 amtTotal값을 넣어줌
        if (target) {
          Object.keys(obj).forEach(key => {
            if (key !== 'note_row' && key !== 'note_col') {
              target[key] = obj[key]
              target["sum_name"] = rowName
            }
          })
        }
      })
    },
    /**
     * 백단에서 처리한 AMT 합산 값을 받아오는 함수
     * @param {String} note_code 
     * @param {String} com_code 
     * @returns Object 
     */
    async getAmtTotal(note_code, com_code) {
      // 임시 하드 코딩 - 결산년월과 법인코드 구해야함.
      const response = await fetch(`/odata/v4/note/get_amt_total(yyyymm='202503', com_code='${com_code}', note_code='${note_code}')`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to call function: " + response.statusText);
      }

      const data = await response.json();

      return data;
    },
    /**
     * 부모 계층 가져오는 함수
     * @param {Array} listRow
     * @returns Map
     */
    getInfoHie(lstNoteRow) {
      // 1. hierarchy 정보가져오기
      // 형태: ""(Parent) => [](Children)
      let rowTreeMap = new Map();
      const lstRow = [...lstNoteRow];

      lstRow.map((ctx, index) => {
        const obj = ctx;

        // 2. []에 최상위 root 셋팅
        if (!rowTreeMap.has(obj.upperrow)) rowTreeMap.set(obj.upperrow, []);
        rowTreeMap.get(obj.upperrow).push(obj.note_row);

      })

      // 3. ""(Parent) 형태만 배열형태로 간직
      const parentRows = [...rowTreeMap.keys()];
      return parentRows
    },
    /**
     * 조정 테이블 합계 구하기
     * @param {Array} lstNoteRow 
     * @param {Map} filterFields 
     * @returns 
     */
    getTmpAmtTotal(lstNoteRow, filterFields) {
      // 1. hierarchy 정보가져오기
      // ""(Parent) => [](Children)
      let rowTreeMap = new Map();
      const lstRowAdj = [...lstNoteRow];

      lstRowAdj.map((ctx, index) => {
        const obj = ctx;

        //[]에 최상위 root 셋팅
        if (!rowTreeMap.has(obj.upperrow)) rowTreeMap.set(obj.upperrow, []);
        rowTreeMap.get(obj.upperrow).push(obj.note_row);

      })

      // ""(Parent) 형태만 배열형태로 간직
      const parentRows = [...rowTreeMap.keys()];

      // 자식 데이터
      // returns {Array}
      function getAllChildren(parent, acc = []) {
        const children = rowTreeMap.get(parent) || [];
        for (const child of children) {
          acc.push(child);
        }
        return acc;
      }

      //집계
      let result = [];
      for (const parent of parentRows) {
        const children = getAllChildren(parent);
        const filtered = filterFields.filter(r => children.includes(r.note_row))
        const note_row = lstRowAdj.filter(r => r.note_row === parent);
        const note_row_name = note_row[0]?.note_row_name;

        const grouped = {};

        for (const f of filtered) {
          const key = `${f.note_col}`;
          grouped[key] = (grouped[key] || 0) + Number(f.amt || 0);
        }

        const obj = {
          note_row: parent,
          note_row_name: note_row_name
        }

        for (const key in grouped) {
          const note_col = key;
          const fieldName = `${note_col}`;

          obj[fieldName] = grouped[key];
        }
        // calcforamt_ 값이 있는 것만 추출
        if (Object.keys(obj).some(key => key.startsWith('calcforamt_'))) result.push(obj);

      }
      return result;
    },
    /**
     * 연결조정 테이블에서 Enter 이벤트 시 발생하는 함수
     * @param {*} oEvent 
     * @param {*} oController 
     */
    onEnter(oEvent, oController) {
      // 1. 연결조정의 합계구하기 - column만 더하면돼

      // ============= 안쓰는 변수 =============
      // const oCtx = oInput.getBindingContext(`row_TreeTableAdj`);
      // const rowData = oCtx?.getObject();
      // const row_code = rowData.note_row;
      // const oInput = oEvent.srcControl;
      // const col_code = oInput.data("note_col_code");
      // const fieldName = `calcforamt_${col_code}`;

      // ============= 변수 선언 =============
      const oView = this.getView();

      const oTable = oController.byId("TreeTableAdj");
      const oTableFinal = oController.byId("TreeTableFinal");
      const oTableCom = oController.byId("TreeTableCom");

      const oModel = oTable.getModel("row_TreeTableAdj");
      const oModelFinal = oTableFinal.getModel("row_TreeTableFinal");
      const oModelCom = oTableCom.getModel("row_TreeTableCom");

      let lstTreeRowAdj = oModel.getProperty("/");
      let lstTreeRowFinal = oModelFinal.getProperty("/");
      let lstTreeRowCom = oModelCom.getProperty("/");

      const lstRowFinal = this.flattenTree(lstTreeRowFinal);
      const lstRowAdj = this.flattenTree(lstTreeRowAdj);
      const lstRowCom = this.flattenTree(lstTreeRowCom);

      const lstHie = this.getInfoHie(lstRowAdj);
      const lstHieFinal = this.getInfoHie(lstRowFinal);

      // ============= 로직 =============

      const filterFields = lstRowAdj.flatMap(row => {
        if (typeof row !== 'object' || lstHie.includes(row.note_row)) return []; // 객체가 아닌 경우 스킵

        return Object.entries(row)
          .filter(([key, value]) => key.startsWith('calcforamt_') && value !== "")
          .map(([key, value]) => ({
            note_code: row.note_code,
            upperrow: row.upperrow,
            note_row_name: row.note_row_name,
            note_row: row.note_row,
            note_col: key,
            amt: value
          }));
      });

      // 1. 연결 조정 합계 데이터 구하기
      const lstAmtTotalAdj = this.getTmpAmtTotal(lstRowAdj, filterFields);
      this.setAmtTotal(lstRowAdj, lstAmtTotalAdj, "연결조정");
      lstTreeRowAdj = this.convertFlatToTree(lstRowAdj);

      // JSON 모델로 만들어서 바인딩
      const jAdjModelRow = new JSONModel(lstTreeRowAdj);
      oView.setModel(jAdjModelRow, `row_TreeTableAdj`);

      // 2. 전사합계 데이터 변경 - row와 column을 알고 더해야돼 왜냐면 cell의 데이터도 변경해야하니까
      // 각 cell이랑 합계까지
      // 2-1. 연결최종의 cell값, 합계 변경
      filterFields.forEach(filterItem => {
        const target = lstRowFinal.find(item => item.note_row === filterItem.note_row);
        const target_org = lstRowCom.find(item => item.note_row === filterItem.note_row);

        if (target && filterItem.note_col in target) {
          const currentVal = Number(`${target_org[filterItem.note_col]}`) || 0;
          const changeVal = Number(filterItem.amt);

          target[filterItem.note_col] = currentVal + changeVal;
        }

        const target_sum = lstRowFinal.find(item => lstHieFinal.includes(item.note_row))
        const target_org_sum = lstRowCom.find(item => lstHieFinal.includes(item.note_row));

        if (target_sum && filterItem.note_col in target_sum) {
          const currentVal = Number(`${target_org_sum[filterItem.note_col]}`) || 0;
          const changeVal = lstAmtTotalAdj[0][filterItem.note_col];

          target_sum[filterItem.note_col] = currentVal + changeVal
        }
      })

      lstTreeRowFinal = this.convertFlatToTree(lstRowFinal);
      oModelFinal.setProperty("/", lstTreeRowFinal)
    },
    /**
     * table 내의 Column 데이터 Reset
     * @param {array} TableIds 
     */
    resetTable(TableIds) {
      for (let id of TableIds) {
        const oTable = this.byId(id);

        oTable?.removeAllColumns()
      }
    },
    /**
     * 조회 버튼 클릭 시 발생하는 함수
     * @param {event} oEvent 
     */
    onClickDisplay(oEvent) {
      const oView = this.getView();
      const oDatepicker = oView.byId("yyyymm");
      const oDatepickerValue = oDatepicker.getValue();

      if (!oDatepickerValue) {
        MessageToast.show("결산년월을 입력해주세요.");
      }
    },
    /**
     * 저장 버튼 클릭 시 발생하는 함수
     * @param {event} oEvent 
     */
    async onClickSaveDetail(oEvent) {
      const oView = this.getView();
      const oModel = oView.getModel("row_TreeTableAdj");
      const oDatepicker = oView.byId("yyyymm");
      const oDatepickerValue = oDatepicker.getValue();
      const lstTreeRowAdj = oModel.getProperty("/");
      const lstRowAdj = this.flattenTree(lstTreeRowAdj);
      const lstHieAdj = this.getInfoHie(lstRowAdj);

      if (oDatepicker == '') {
        MessageToast.show("결산년월을 입력해주세요.");
        return;
      }

      // 하드코딩
      const mandt = '100',
        yyyymm = `${oDatepickerValue}`,
        com_code = 'K001',
        curtype = 'LC',
        inputtype = 'ADJ';

      let result = [];
      const sumByNoteCol = {};


      lstRowAdj.forEach((row, index) => {
        if (lstHieAdj.includes(row.note_row)) return [];

        const common = {
          mandt: mandt,
          yyyymm: yyyymm,
          com_code: com_code,
          note_row: row.note_row,
          note_code: row.note_code,
          curtype: curtype,
          inputtype: inputtype
        };

        Object.entries(row)
          .forEach(([key, value]) => {
            if (
              key.startsWith("calcforamt_") &&
              value != "" &&
              value != undefined
            ) {
              const note_col = key.substring("calcforamt_".length);
              sumByNoteCol[note_col] = (sumByNoteCol[note_col] || 0) + Number(value);

              result.push({
                ...common,
                "note_col": key.substring(11),
                "amt": value,
              })
            }

          })
      });

      const param = {
        in: result
      };

      try {
        const response = await fetch(`/odata/v4/note/ListZTCD2010/updateZTCD2010`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(param)
        });


        if (response.status == 204) {
          MessageToast.show("저장 완료되었습니다.");
        }
      } catch (e) {
        MessageToast.show("오류: " + e.message);

      }
    },
    // 트리변환
    convertFlatToTree(data) {
      const idMap = {};
      const rootNotes = [];
      const baseData = data.map(obj => ({ ...obj }));

      baseData.forEach(item => {
        idMap[item.note_row] = { ...item, children: [] };
      });

      baseData.forEach(item => {
        const parentId = item.upperrow,
          currentRow = idMap[item.note_row],
          parentRow = idMap[parentId]

        // upperrow가 있으면 부모의 childern에 추가
        if (parentId && parentRow) {
          parentRow.children.push(currentRow);
        } else {
          rootNotes.push(currentRow);
        }
      });
      return rootNotes;

    }, flattenTree(treeData) {
      const result = [];

      function recurse(nodeList) {
        nodeList.forEach(node => {
          const { children, ...rest } = node;
          result.push(rest);
          if (children && children.length > 0) {
            recurse(children);
          }
        });

      }
      recurse(treeData);
      return result;
    }
  });
});