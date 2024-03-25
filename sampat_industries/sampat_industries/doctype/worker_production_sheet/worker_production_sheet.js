// Copyright (c) 2024, Niraj and contributors
// For license information, please see license.txt

frappe.ui.form.on("Worker Production Sheet", {
  // refresh: function(frm) {
  // }
});

frappe.ui.form.on("Worker Production Sheet Child", {
  //   refresh: function (frm, cdt, cdn) {},

  operation: async function (frm, cdt, cdn) {
    let emp_op_cost = await get_cost_for_employee(frm, cdt, cdn);

    if (emp_op_cost != "undefined") {
      frappe.model.set_value(cdt, cdn, "operation_cost", emp_op_cost);
      frm.refresh_field("operation_cost");
    } else {
      let op_cost = await get_operation_cost(frm, cdt, cdn);
      frappe.model.set_value(cdt, cdn, "operation_cost", op_cost);
      frm.refresh_field("operation_cost");
    }
  },
});

async function get_cost_for_employee(frm, cdt, cdn) {
  return new Promise((resolve) => {
    const child = locals[cdt][cdn];
    const employee = child.employee;
    const operation = child.operation;
    frappe
      .call({
        method:
          "sampat_industries.sampat_industries.doctype.worker_production_sheet.worker_production_sheet.get_employee_operation_cost",
        args: { employee, operation },
      })
      .done((r) => {
        console.log(r);
        if (r.message[0]) {
          resolve(r.message[0].cost);
        } else {
          resolve("undefined");
        }
      });
  });
}

async function get_operation_cost(frm, cdt, cdn) {
  return new Promise((resolve) => {
    const child = locals[cdt][cdn];
    const operation = child.operation;
    console.log(operation);
    frappe.call({
      method: "frappe.client.get_value",
      args: {
        doctype: "Operation",
        filters: { name: operation },
        fieldname: ["general_operation_cost_per_unit"],
      },
      callback: function (r) {
        console.log(r.message);
        resolve(r.message.general_operation_cost_per_unit);
      },
    });
  });
}
