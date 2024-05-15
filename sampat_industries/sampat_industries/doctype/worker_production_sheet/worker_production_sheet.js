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

  qty: async function (frm, cdt, cdn) {
    const child = locals[cdt][cdn];
    if (child.operation_cost <= 0 || child.operation_cost == null) {
      frappe.msgprint(
        __(
          "Operation Cost is not defined in Operation Master. Please define correct Operation Cost"
        )
      );
      frappe.model.set_value(cdt, cdn, "qty", 0);
      frm.refresh_field("qty");
    }
  },

  start_time: function (frm, cdt, cdn) {
    calculateTotalHrs(frm, cdt, cdn);
  },

  end_time: function (frm, cdt, cdn) {
    calculateTotalHrs(frm, cdt, cdn);
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

function calculateTotalHrs(frm, cdt, cdn) {
  try {
    const child = locals[cdt][cdn];
    const startTime = child.start_time;
    const endTime = child.end_time;

    if (startTime && endTime) {
      const timeDiff = moment(endTime, "HH:mm").diff(
        moment(startTime, "HH:mm")
      );
      const duration = moment.duration(timeDiff);
      // const totalHrs =
      //   Math.floor(duration.asHours()) + moment.utc(timeDiff).format(":mm");

      // let workHours = parseFloat(totalHrs);

      const totalHours = Math.floor(duration.asHours()); // Get total hours without minutes
      const totalMinutes = moment.utc(timeDiff).minutes(); // Get total minutes

      let workHours = totalHours + totalMinutes / 60;

      frappe.model.set_value(cdt, cdn, "work_hrs", workHours);
      console.log(totalHrs);
      frm.refresh_field("work_hrs");
    }
  } catch (error) {
    console.error("An error occurred while setting field value:", error);
  }
}
