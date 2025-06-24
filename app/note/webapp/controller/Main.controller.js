sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel"
], (Controller, JSONModel) => {
  "use strict";

  return Controller.extend("note.controller.Main", {
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

    // 트리변환함
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
    onCellButtonPress: function (oEvent) {
      const oButton = oEvent.getSource();
      const oContext = oButton.getBindingContext("note");
      const note_code = oContext.getProperty("note_code");

      const oRouter = this.getOwnerComponent().getRouter();
      oRouter.navTo('DetailPage', { note_code: note_code });

    }


  });
});