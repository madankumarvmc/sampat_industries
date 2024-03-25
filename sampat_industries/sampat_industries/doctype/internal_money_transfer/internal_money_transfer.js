// Copyright (c) 2024, Niraj and contributors
// For license information, please see license.txt

frappe.ui.form.on("Internal Money Transfer", {
  onload: function (frm) {
    // Set the date field to today's date
    frm.set_value("date", frappe.datetime.nowdate());
  },

  type: function (frm) {
    if (frm.doc.type == "Credit") {
      frm.set_value("from", "Niraj Bhatera - SI");
    }
  },

  on_submit: function (frm) {
    if (frm.doc.type == "Expense") {
      frappe.call({
        method:
          "sampat_industries.sampat_industries.doctype.internal_money_transfer.internal_money_transfer.after_expense_balance_amount_in_account",
        args: {
          from_account_name: frm.doc.from,
          to_account_name: frm.doc.to,
          amount: parseFloat(frm.doc.amount),
        },

        callback: function (response) {
          //*********** */
        },
      });
    }

    if (frm.doc.type == "Transfer" || frm.doc.type == "Credit") {
      frappe.call({
        method:
          "sampat_industries.sampat_industries.doctype.internal_money_transfer.internal_money_transfer.update_balance_amount_in_account",
        args: {
          from_account_name: frm.doc.from,
          to_account_name: frm.doc.to,
          amount: parseFloat(frm.doc.amount),
        },

        callback: function (response) {
          //*********** */
        },
      });
    }
  },
});
