// Copyright (c) 2024, Niraj and contributors
// For license information, please see license.txt

frappe.ui.form.on("Internal Money Transfer", {
  refresh: function (frm) {
    let user = frappe.session.user;
    console.log("USER", user);
  },

  setup: function (frm) {
    frm.set_query("from", function () {
      return {
        filters: [
          ["Account", "parent_account", "in", "Internal Transfers - SI"],
        ],
      };
    });
    frm.set_query("to", function () {
      return {
        filters: [
          ["Account", "parent_account", "in", "Internal Transfers - SI"],
        ],
      };
    });
  },

  onload: function (frm) {
    // Set the date field to today's date
    frm.set_value("date", frappe.datetime.nowdate());
  },

  type: function (frm) {
    // Map user and account
    let user = {
      "anusha@sampat.co.in": "Anita - SI",
      "karunakar@sampat.co.in": "Karunakar - SI",
      "niraj@sampat.co.in": "Niraj Bhatera - SI",
    };

    if (frm.doc.type == "Credit") {
      frm.set_value("from", "Niraj Bhatera - SI");
    }
    if (frm.doc.type == "Bank Credit") {
      frm.set_value("from", "Bank IT - SI");
      frm.set_value("to", "Niraj Bhatera - SI");
    }
    if (frm.doc.type == "Transfer") {
      frm.set_value("from", user[frappe.session.user]);
    }
    if (frm.doc.type == "Expense") {
      frm.set_value("from", user[frappe.session.user]);
    }
  },

  on_submit: function (frm) {
    if (frm.doc.type == "Expense") {
      frappe.call({
        method:
          "sampat_industries.sampat_industries.doctype.internal_money_transfer.internal_money_transfer.after_expense_balance_amount_in_account",
        args: {
          from_account_name: frm.doc.from,
          amount: parseFloat(frm.doc.amount),
        },

        callback: function (response) {
          //*********** */
        },
      });
    }

    if (
      frm.doc.type == "Expense" &&
      frm.doc.expense_head == "Employee Advances"
    ) {
      let employee = frm.doc.employee;
      let amount = frm.doc.amount;
      let date = frm.doc.date;
      add_to_sampat_employee_advance(employee, date, amount);

      let total_amount =
        parseFloat(frm.doc.current_advance) + parseFloat(frm.doc.amount);
      frappe
        .call({
          method:
            "sampat_industries.sampat_industries.doctype.sampat_employee_advances.sampat_employee_advances.update_advance_in_employee_master",
          args: {
            employee: employee,
            new_advance: total_amount,
          },
        })
        .done((r) => {
          console.log("entered req**********", employee, total_amount, r);
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

    if (frm.doc.type == "Bank Credit") {
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

  after_cancel: async function (frm) {
    if (frm.doc.type == "Expense") {
      frappe.call({
        method:
          "sampat_industries.sampat_industries.doctype.internal_money_transfer.internal_money_transfer.cancelled_after_expense_balance_amount_in_account",
        args: {
          from_account_name: frm.doc.from,
          amount: parseFloat(frm.doc.amount),
        },
        callback: function (response) {
          // Handle response if needed
        },
      });
    }

    if (frm.doc.expense_head == "Employee Advances") {
      console.log("Entered Employee Advances");
      let employee = frm.doc.employee;
      let current_advance = parseFloat(frm.doc.current_advance);

      let after_cancel_amount = parseFloat(frm.doc.current_advance);

      const result = await frappe.call({
        method:
          "sampat_industries.sampat_industries.doctype.internal_money_transfer.internal_money_transfer.get_current_employee_advance",
        args: { employee },
      });
      console.log("result:  ", result);

      await new Promise((resolve) => setTimeout(resolve, 2000));
      let get_employee_advance = result.advances_balance;
      console.log("******", employee, get_employee_advance);

      let after_cancel_advance_amount = get_employee_advance - frm.doc.amount;
      console.log(
        "HEYYYYYYY",
        after_cancel_advance_amount,
        current_advance,
        frm.doc.amount
      );

      const advanceDoc = await frappe.call({
        method:
          "sampat_industries.sampat_industries.doctype.internal_money_transfer.internal_money_transfer.get_advance_doc_to_cancel",
        args: { employee, current_advance },
      });

      console.log("advance data", advanceDoc.message[0].name);
      let docname = advanceDoc.message[0].name;
      if (docname) {
        const cancelResult = await frappe.call({
          method:
            "sampat_industries.sampat_industries.doctype.internal_money_transfer.internal_money_transfer.cancel_advance_document",
          args: { docname },
        });

        console.log(
          "return after running advance cancel",
          cancelResult.message
        );

        const updateResult = await frappe.call({
          method:
            "sampat_industries.sampat_industries.doctype.sampat_employee_advances.sampat_employee_advances.update_advance_in_employee_master",
          args: {
            employee: employee,
            new_advance: after_cancel_advance_amount,
          },
        });

        console.log(updateResult);
      }
    }
  },
});

function add_to_sampat_employee_advance(employee, date, amount) {
  frappe
    .call({
      method:
        "sampat_industries.sampat_industries.doctype.internal_money_transfer.internal_money_transfer.add_to_employee_advances",
      args: { employee, date, amount },
    })
    .done((r) => {});
}
