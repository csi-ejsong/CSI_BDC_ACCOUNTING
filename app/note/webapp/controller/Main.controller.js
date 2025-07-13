sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast"
], (Controller, JSONModel, MessageToast) => {
  "use strict";

  return Controller.extend("note.controller.Main", {
    /**
     * Controller LifeCycle Function으로, 처음 페이지 로드 시 호출됨
     */
    async onInit() {
      // Component.js에만
      this.getView().setModel(this.getOwnerComponent().getModel());

      const oModel = this.getView().getModel();
      const oList = oModel.bindList("/ListNote");
      const listNote = await oList.requestContexts().then(contexts => {
        return contexts.map(ctx => ctx.getObject())
      });

      const treeListNote = this.convertFlatToTree(listNote);

      const jModel = new JSONModel(treeListNote);
      this.getView().setModel(jModel, "note");
    },

    // Flat to Tree
    convertFlatToTree(data) {
      const idMap = {};
      const rootNotes = [];

      data.forEach(item => {
        idMap[item.note_code] = { ...item, children: [], visible: false };
      });

      data.forEach(item => {
        if (item.uppernote && idMap[item.uppernote]) {
          let childernItem = idMap[item.note_code];
          childernItem.visible = true
          idMap[item.uppernote].children.push(childernItem);
        } else {
          rootNotes.push(idMap[item.note_code]);
        }
      });
      return rootNotes;
    },
    /**
     * '열기'버튼 클릭 시 발생하는 함수
     * @param {*} oEvent 
     */
    onCellButtonPress: function (oEvent) {
      const oButton = oEvent.getSource();
      const oContext = oButton.getBindingContext("note");
      const note_code = oContext.getProperty("note_code"),
            note_name = oContext.getProperty("note_name");

      const oNoteModel =new sap.ui.model.json.JSONModel();
      this.getOwnerComponent().setModel(oNoteModel, "note");

      const oModel = this.getOwnerComponent().getModel("note");
      oModel.setProperty('/detail', note_name);

      const oRouter = this.getOwnerComponent().getRouter();
      oRouter.navTo('DetailPage', { note_code: note_code });

    },
    onPressExecute: async function (oEvent) {
      // 하드코딩, 만약 yyyymm과 com_code 정보 전달 할 생각이면 여기에 넣어서 param으로 전달
      const yyyymm = '',
            com_code = '';

      const param = [];
      try {
        const response = await fetch(`/odata/v4/note/executeLogic`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(param)
        });

        // HTTP 통신 
        if (!response.ok) {

        }

        if(response.status == 204){
          MessageToast.show("추출 성공하였습니다.");
        }

      } catch (e) {
        MessageToast.error("오류: " + e.message);
      }
    }
  });
});