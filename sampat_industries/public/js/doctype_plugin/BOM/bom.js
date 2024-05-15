frappe.ui.form.on("BOM", {
  // refresh: function (frm) {
  //   console.log("ACCESSING BOM");
  // },
});

frappe.ui.form.on("BOM Item", {
  item_code: function (frm, cdt, cdn) {
    const child = locals[cdt][cdn];
    let item_code = child.item_code;
    frappe
      .call({
        method:
          "sampat_industries.public.js.doctype_plugin.BOM.bom.get_alternate_uom_from_item_master",
        args: { item_code },
      })
      .done((r) => {
        console.log(r.message);
        let alternate_uom = r.message.alternate_uom;
        let conversion_factor = 1 / r.message.conversion_factor;

        setTimeout(() => {
          frappe.model.set_value(cdt, cdn, "uom", alternate_uom);
        }, 1000);
        setTimeout(() => {
          frappe.model.set_value(
            cdt,
            cdn,
            "conversion_factor",
            conversion_factor
          );
        }, 2000);
      });
  },
});
