// Copyright (c) 2024, Niraj and contributors
// For license information, please see license.txt

frappe.ui.form.on("Sampat Employee Advances", {
  advance_amount: function (frm) {
    let prev_balance = parseFloat(frm.doc.prev_balance);
    let advance_amount = parseFloat(frm.doc.advance_amount);
    let new_advance = prev_balance + advance_amount;
    frm.set_value("new_advance", new_advance);
  },

  before_save: function (frm) {
    let prev_balance = parseFloat(frm.doc.prev_balance);
    let advance_amount = parseFloat(frm.doc.advance_amount);
    let new_advance = prev_balance + advance_amount;
    frm.set_value("new_advance", new_advance);
    frm.trigger("advance_amount");
  },

  on_submit: function (frm) {
    let employee = frm.doc.employee;
    let new_advance =
      parseFloat(frm.doc.prev_balance) + parseFloat(frm.doc.advance_amount);
    frappe
      .call({
        method:
          "sampat_industries.sampat_industries.doctype.sampat_employee_advances.sampat_employee_advances.update_advance_in_employee_master",
        args: { employee: employee, new_advance: new_advance },
        callback: function (r) {
          if (r.message) {
            frappe.msgprint("Advance updated successfully:");
          } else {
            frappe.msgprint("Failed to update advance.");
          }
        },
      })
      .fail(function (err) {
        frappe.msgprint("An error occurred:", err);
      });
  },
  after_cancel: function (frm) {
    let employee = frm.doc.employee;
    let advance_amount = frm.doc.advance_amount;
    let new_advance = frm.doc.new_advance;
    let after_cancel_amount = new_advance - advance_amount;
    frappe
      .call({
        method:
          "sampat_industries.sampat_industries.doctype.sampat_employee_advances.sampat_employee_advances.update_advance_in_employee_master",
        args: { employee: employee, new_advance: after_cancel_amount },
        callback: function (r) {
          if (r.message) {
            frappe.msgprint(
              "Advance updated successfully \n Do not Amend this doc. Create new entry"
            );
          } else {
            frappe.msgprint("Failed to update advance.");
          }
        },
      })
      .fail(function (err) {
        frappe.msgprint("An error occurred:", err);
      });
  },
});
