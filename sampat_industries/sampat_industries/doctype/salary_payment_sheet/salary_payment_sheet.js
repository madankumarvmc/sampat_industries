// Copyright (c) 2024, Niraj and contributors
// For license information, please see license.txt

frappe.ui.form.on("Salary Payment Sheet", {
  month_end_date: async function (frm) {
    let print = await getSalariesInTable(frm);
    console.log(print);
  },
});

async function getSalariesInTable(frm) {
  return new Promise((resolve) => {
    let month_end_date = frm.doc.month_end_date;
    frappe
      .call({
        method:
          "sampat_industries.sampat_industries.doctype.salary_payment_sheet.salary_payment_sheet.get_employee_salary_details",
        args: { end_date: month_end_date },
      })
      .done((r) => {
        resolve(r);
        for (const e of r.message) {
          let employee = e.employee;
          let employee_name = e.employee_name;
          let gross_pay = parseFloat(e.gross_pay);
          let deductions =
            parseFloat(e.pf_deduction) +
            parseFloat(e.esi_deduction) +
            parseFloat(e.advance_deduction) +
            parseFloat(e.penalty);
          let additions = parseFloat(e.add_salary);
          let net_pay = parseFloat(gross_pay - deductions);

          let entry = frm.add_child("salary_payment_sheet_table");

          entry.employee = employee;
          entry.employee_name = employee_name;
          entry.gross_pay = gross_pay;
          entry.deductions = deductions;
          entry.additions = additions;
          entry.net_pay = net_pay;
        }
        refresh_field("salary_payment_sheet_table");
      });
  });
}

frappe.ui.form.on("Salary Payment Sheet Table", {
  hold: function (frm, cdt, cdn) {
    manageHoldCheck(frm, cdt, cdn);
  },

  paid: function (frm, cdt, cdn) {
    managePaidCheck(frm, cdt, cdn);
  },
});

function manageHoldCheck(frm, cdt, cdn) {
  const child = locals[cdt][cdn];
  const hold = child.hold;
  const paid = child.paid;

  if (paid == "1" && hold == "1") {
    frappe.model.set_value(cdt, cdn, "paid", "0");
  }
}
function managePaidCheck(frm, cdt, cdn) {
  const child = locals[cdt][cdn];
  const hold = child.hold;
  const paid = child.paid;

  if (paid == "1" && hold == "1") {
    frappe.model.set_value(cdt, cdn, "hold", "0");
  }
}
