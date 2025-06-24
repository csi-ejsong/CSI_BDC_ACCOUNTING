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
    _onPatternMatched: async function (oEvent) {
      //======================Reset Table Column======================
      const oTable = this.byId("TreeTableDetail");
      this.resetTable(oTable);

      const note_code = oEvent.getParameter("arguments").note_code;
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
            fieldName = 'calcforamt_' + index;

          lst = listZTCD2000.find(ctx =>
            ctx.note_row === obj.note_row &&
            ctx.note_col === objC.note_col
          );

          // console.log(lst, lst?.note_col == objC.note_col)

          if (lst && lst?.note_col == objC.note_col) {
            calcforamt = lst.calcforamt
            obj[fieldName] = calcforamt;
          } else {
            obj[fieldName] = "";
          }

        })
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
          obj.template = new sap.m.Input({ value: `{row>calcforamt_${index}}`, type: "Number", editable: true }) 

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
    // 트리변환함
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

      return rootNotes;
    },
    resetTable(table) {
      table.removeAllColumns();
    }
  });
});