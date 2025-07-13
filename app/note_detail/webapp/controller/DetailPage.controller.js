sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/MessageToast",
  "notedetail/utils/util"
], (BaseController, JSONModel,Filter, FilterOperator, MessageToast, Util) => {
  "use strict";

  return BaseController.extend("notedetail.controller.DetailPage", {
    onInit() {
      this.getView().setModel(this.getOwnerComponent().getModel());
      this.getOwnerComponent().getRouter().getRoute("DetailPage").attachPatternMatched(this._onPatternMatched, this);
    },
    _onPatternMatched(oEvent) {
      const note_code = oEvent.getParameter("arguments").note_code;
      this._note_code = note_code;

      this.getZTCD2010(note_code)
    },
    async getZTCD2010(note_code) {
      //======================Reset Table Column======================
      const oTable = this.byId("TreeTableDetail");
      this.resetTable(oTable);

      const oView = this.getView();
      const oModel = this.getView().getModel();

      const oListRow = oModel.bindList("/ListRow");
      const oListCol = oModel.bindList("/ListCol");
      const oListZTCD2010 = oModel.bindList("/ListZTCD2010");

      const com_code = 'K001';

      const listZTCD2010 = await oListZTCD2010.requestContexts().then(contexts => {
        return contexts.map(ctx => ctx.getObject());
      })

      let listCol = await oListCol.requestContexts().then(contexts =>
        contexts
          .filter(ctx => (ctx.getObject().note_col || "").includes(note_code))
          .map(ctx => ctx.getObject())
      );

      const listRow = await oListRow.requestContexts().then(contexts =>
        contexts
          .filter(ctx => (ctx.getObject().note_row || "").includes(note_code))
          .map(ctx => ctx.getObject())
      );

      let lstRow = [...listRow];

      const lstHie = this.getInfoHie(lstRow);
      const lstAmtTotal = await this.getAmtTotal(note_code);
      //======================Row======================
      lstRow = lstRow.map((row) => {
        const newRow = {
          ...row,
          note_code: note_code,
          editable: lstHie && !lstHie.includes(row.note_row)
        };

        listCol.forEach((col) => {
          const objC = col,
            fieldName = 'calcforamt_' + objC.note_col,
            propertyName = 'editable_' + objC.note_col;

          const matched = listZTCD2010.find(data =>
            data.note_row === row.note_row &&
            data.note_col === objC.note_col
          );

          newRow[fieldName] = matched?.amt || "";
          newRow[propertyName] =
            matched?.inputtype === "INPUT" ||
            matched?.inputtype === undefined &&
            !lstHie?.includes(row.note_row)
        })
        return newRow;
      });
      this.setAmtTotal(lstRow, lstAmtTotal);

      //======================Column======================

      listCol = listCol.map((ctx, index) => {
        let obj = ctx;

        // 첫번째 컬럼만
        if (index == 0) {
          obj.template = new sap.m.Text({ text: "{row>note_row_name}" })
        } else {
          obj.template = new sap.m.Input({
            value: {
              parts: [
                { path: `row>calcforamt_${ctx.note_col}`},
                { value: '', type: 'sap.ui.model.type.String'}
              ],
              type: new sap.ui.model.type.Currency({
                showMeasure: false
              })
            }, 
            editable:
            {
              parts: [
                // { path: `row>calcforamt_${ctx.note_col}` },
                { path: `row>editable_${ctx.note_col}` },
              ],
              formatter: function (editableFlag) {
                return editableFlag;
              }

            }
          })
        }
        return obj

      });
      
      // 임시 하드 코딩 - 결산년월과 법인코드 구해야함.
      const response = await fetch(`/odata/v4/note/get_amt_total(yyyymm='202503', com_code='K001', note_code='${note_code}')`, {
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
      lstRow.push(...data.value);
      let treeListRow = this.convertFlatToTree(lstRow);

      const jModelRow = new JSONModel(treeListRow);
      oView.setModel(jModelRow, "row");

      const jModelCol = new JSONModel(listCol);
      oView.setModel(jModelCol, "col");

      //======================Add Column======================

      const aColumns = jModelCol.getProperty("/");

      aColumns.forEach(data => {
        oTable.addColumn(new sap.ui.table.Column({
          label: new sap.m.Label({ text: data.note_col_name }),
          template: data.template
        }))
      })
    },
    resetTable(table) {
      table.removeAllColumns();
    },
    // 트리변환
    convertFlatToTree(data) {
      const idMap = {};
      const rootNotes = [];

      data.forEach(item => {
        idMap[item.note_row] = { ...item, children: [] };
      });

      data.forEach(item => {
        if (item.upperrow && idMap[item.upperrow]) {
          idMap[item.upperrow].children.push(idMap[item.note_row]);
        } else {
          rootNotes.push(idMap[item.note_row]);
        }
      });
      return rootNotes[0]?.children;
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
    async onClickSaveDetail(oEvent) {
      const oModel = this.getView().getModel("row");
      const data = oModel.getProperty("/");

      const mandt = '100',
        yyyymm = '202503',
        com_code = 'K001',
        curtype = 'LC',
        inputtype = 'INPUT';

      const lstRow = this.flattenTree(data);
      const lstHie = this.getInfoHie(lstRow);

      let result = [];
      const sumByNoteCol = {};

      lstRow.forEach((row, index) => {
        if (lstHie.includes(row.note_row)) return [];

        const common = {
          mandt: mandt,
          yyyymm: yyyymm,
          com_code: com_code,
          curtype: curtype,
          inputtype: inputtype,
          note_row: row.note_row,
          note_code: row.note_code
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
                "amt": value
              })
            }

          })
      });

      const param = {
        in: result
      };
      

      try {
        const response = await Util.callService('/odata/v4/note/ListZTCD2010/updateZTCD2010', "POST", param)

        console.log("response", response);
        if (response.status == 204) {
          sap.m.MessageToast.show('저장이 완료되었습니다.');
        } else {
          sap.m.MessageToast.show('저장이 실패하였습니다.');
        }
      }
      catch (err) {
        console.log("err", err.message, err)
      }

    }, async onClickDisplay(oEvent) {
      // 일단 비추하는 방식으로 get note_code 
      this.getZTCD2010(this._note_code);
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
     * 합계 테이블에 적용하는 함수
     * @param {Array} lstRow 
     * @param {object} lstAmtTotal 
     */
    setAmtTotal(lstRow, lstAmtTotal) {
      const dataRow = [...lstRow];
      const dataAmtTotal = [...lstAmtTotal.value];

      dataAmtTotal.forEach(obj => {
        // 합계가 들어갈 note_row
        const target = dataRow.find(item => item.note_row.includes(obj.note_row));

        // 있으면 해당 값에 amtTotal값을 넣어줌
        if (target) {
          Object.keys(obj).forEach(key => {
            if (key !== 'note_row' && key !== 'note_col') {
              target[key] = obj[key]
            }
          })
        }
      })
    }
  });
});