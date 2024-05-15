frappe.ui.form.on("Stock Entry", {
  refresh: function (frm) {
    console.log("Accessing Stock Entry");
    // refresh_field("items");
  },
});

// frappe.ui.form.on("Stock Entry Detail", {
//   refresh: function (frm, cdt, cdn) {
//     frappe.model.set_value(cdt, cdn, "allow_zero_valuation_rate", "1");
//     console.log("entered");
//     refresh_field("items");
//   },
// });
