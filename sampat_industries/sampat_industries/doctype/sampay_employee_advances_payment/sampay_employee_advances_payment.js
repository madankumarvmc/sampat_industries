// Copyright (c) 2024, Niraj and contributors
// For license information, please see license.txt

frappe.ui.form.on("Sampay Employee Advances Payment", {
  // refresh: function(frm) {
  // }

  month_end_date: function (frm) {
    frappe
      .call({
        method:
          "sampat_industries.sampat_industries.doctype.sampay_employee_advances_payment.sampay_employee_advances_payment.get_employees_with_advances",
        args: {},
      })
      .done((r) => {
        console.log(r);
        $.each(r.message, function (_i, e) {
          let entry = frm.add_child("sampat_employee_advance_table");
          entry.employee = e.employee;
          entry.employee_name = e.employee_name;
          entry.total_adv = e.advances_balance;
          entry.advance_balance = e.advances_balance;
        });
        refresh_field("sampat_employee_advance_table");
      });
  },

  before_submit: function (frm) {
    console.log("entered on_submit");
    let data = frm.doc.sampat_employee_advance_table;
    console.log(data);
    data.forEach((e) => {
      console.log(e);
      let employee = e.employee;
      let new_advance = e.advance_balance;
      frappe
        .call({
          method:
            "sampat_industries.sampat_industries.doctype.sampay_employee_advances_payment.sampay_employee_advances_payment.update_advance_in_employee_master",
          args: { employee: employee, new_advance: new_advance },
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
    });
  },

  after_cancel: function (frm) {
    console.log("entered on_cancel");
    let data = frm.doc.sampat_employee_advance_table;
    console.log(data);
    data.forEach((e) => {
      console.log(e);
      let employee = e.employee;
      let new_advance = e.total_adv;
      console.log("total advances", e.total_adv);
      frappe
        .call({
          method:
            "sampat_industries.sampat_industries.doctype.sampay_employee_advances_payment.sampay_employee_advances_payment.update_advance_in_employee_master",
          args: { employee: employee, new_advance: new_advance },
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
    });
  },
});

frappe.ui.form.on("Sampat Employee Advance Table", {
  to_deduct: function (frm, cdt, cdn) {
    let child = locals[cdt][cdn];
    let advance_amount = child.total_adv;
    let to_deduct = child.to_deduct;
    let advance_balance = advance_amount - to_deduct;
    frappe.model.set_value(cdt, cdn, "advance_balance", advance_balance);
    console.log(advance_balance);
    // Refresh the form after updating the field value
    frm.refresh_field("sampat_employee_advance_table");
  },
});
