sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel"
], (BaseController, JSONModel) => {
  "use strict";

  return BaseController.extend("note.controller.DetailPage", {
    onInit() {
      // Component.js에만
      this.getView().setModel(this.getOwnerComponent().getModel());
      this.getOwnerComponent().getRouter().getRoute("DetailPage").attachPatternMatched(this._onPatternMatched, this);
    },
    onClickDisplay() {
      this.getZTCD2000(this._note_code);
    },
    _onPatternMatched: async function (oEvent) {
      const note_code = oEvent.getParameter("arguments").note_code;
      this._note_code = note_code;

      this.getZTCD2000(note_code)
    },
    getZTCD2000: async function (note_code) {
      //======================Reset Table Column======================
      const oTable = this.byId("TreeTableDetail");
      this.resetTable(oTable);

      //======================Variables======================
      const oView = this.getView();
      const oModel = this.getView().getModel();

      const oListRow = oModel.bindList("/ListRow");
      const oListCol = oModel.bindList("/ListCol");
      const oListZTCD2000 = oModel.bindList("/ListZTCD2000");

      const listZTCD2000 = await oListZTCD2000.requestContexts().then(contexts => {
        return contexts.map(ctx => ctx.getObject());
      })

      let listCol = await oListCol.requestContexts().then(contexts =>
        contexts
          .filter(ctx => (ctx.getObject().note_col || "").includes(note_code))
          .map(ctx => ctx.getObject()) // ← 원하면 제거 가능
      );

      let listRow = await oListRow.requestContexts().then(contexts =>
        contexts
          .filter(ctx => (ctx.getObject().note_row || "").includes(note_code))
          .map(ctx => ctx.getObject()) // ← 원하면 제거 가능
      );

      //======================Archive======================
      const rowZTCD2000 = new Map(listZTCD2000.map(data => [data.note_row, data]))
      const colZTCD2000 = new Map(listZTCD2000.map(data => [data.note_col, data]))
      //======================Row======================

      listRow.forEach((ctx, index) => {
        let obj = ctx,
          lst = '',
          calcforamt = '';

        listCol.forEach((ctxC, index) => {
          const objC = ctxC,
            fieldName = 'calcforamt_' + objC.note_col;


          lst = listZTCD2000.find(ctx =>
            ctx.note_row === obj.note_row &&
            ctx.note_col === objC.note_col
          );


          if (lst && lst?.note_col == objC.note_col) {
            calcforamt = lst.calcforamt
            obj[fieldName] = calcforamt;
          } else {
            obj[fieldName] = "";
          }
          obj.note_code = note_code;
          obj["editable"] = true;
        })

        // 하드코딩, 합계는 editable 불가
        if (index == 5) {
          obj["editable"] = false;

        }
        return obj;
      });

      const treeListRow = this.convertFlatToTree(listRow);
      //======================Column======================

      listCol = listCol.map((ctx, index) => {
        let obj = ctx;

        // 첫번째 컬럼만
        if (index == 0) {
          obj.template = new sap.m.Text({ text: "{row>note_row_name}" })
        } else {
          obj.template = new sap.m.Input({ value: `{row>calcforamt_${ctx.note_col}}`, editable: `{row>editable}` })

        }
        return obj

      });

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
    async onClickSaveDetail(oEvent) {
      const oModel = this.getView().getModel("row");
      const data = oModel.getProperty("/");

      const flatData = this.flattenTree(data);
      let result = [];

      flatData.forEach(row => {
        const common = {
          note_row: row.note_row,
          note_code: row.note_code
        };

        Object.entries(row)
          .forEach(([key, value]) => {
            if (key.startsWith("calcforamt_") &&
              value != ""
              && value != undefined) {
              result.push({
                ...common,
                "note_col": key.substring(11),
                "calcforamt": value
              })
            }
          })
      });

      const param = {
        in: result
      };

      const response = await fetch(`/odata/v4/note/ListZTCD2000/updateZTCD2000`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(param)
      });

      if (!response.ok) {
        throw new Error("Failed to update ZTCD2000: " + response.statusText);
      }

      sap.m.MessageToast.show('저장이 완료되었습니다.');

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
    flattenTree(treeData) {
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
    resultListRow(treeData) {
      let total = 0;

      // 자식 먼저 재귀 호출
      if (treeData.children && treeData.children.length > 0) {

      }
    }
  });
});