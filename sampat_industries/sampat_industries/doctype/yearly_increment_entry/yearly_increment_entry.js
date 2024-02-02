// Copyright (c) 2023, Niraj and contributors
// For license information, please see license.txt

frappe.ui.form.on("Yearly Increment Entry", {
  applicable_from: function (frm) {
    frm.increment_entry_date = //Todays Date
      frappe
        .call({
          method:
            "sampat_industries.sampat_industries.doctype.yearly_increment_entry.yearly_increment_entry.employee_details",
          args: {},
        })
        .done((r) => {
          console.log(r);
          $.each(r.message, function (_i, e) {
            let entry = frm.add_child("employee_yearly_increment_table");
            entry.employee = e.name;
            entry.employee_name = e.employee_name;
            entry.current_salary = e.monthly_basic_pay;
          });
        });
    refresh_field("employee_yearly_increment_table");
  },
});

frappe.ui.form.on("Yearly Increment Table", {
  increment_amount: function (frm, cdt, cdn) {
    calculateNewSalary(frm, cdt, cdn);
  },
});

function calculateNewSalary(frm, cdt, cdn) {
  let child = locals[cdt][cdn];
  let incrementAmount = child.increment_amount;
  let currentSalary = child.current_salary;
  //   let newSalary = child.new_salary;
  let newSalary = 0;

  if (currentSalary) {
    newSalary = currentSalary + incrementAmount;
  }

  frappe.model.set_value(cdt, cdn, "new_salary", newSalary);
  frm.refresh_field("new_salary");
}
