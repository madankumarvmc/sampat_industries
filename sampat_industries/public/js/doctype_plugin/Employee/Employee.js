frappe.ui.form.on("Employee", {
  aadhar_number_: function (frm) {
    console.log("entered aadhar");
    let aadhar_number = frm.doc.aadhar_number_;
    if (aadhar_number) {
      frappe
        .call({
          method:
            "sampat_industries.public.js.doctype_plugin.Employee.Employee.get_employee_aadhar_detail",
          args: { aadhar_number },
        })
        .done((r) => {
          console.log(r.message);
          if (r.message != false) {
            frappe.throw(
              "Employee " +
                r.message.employee +
                " with this aadhar already exist"
            );
            frm.set_value("aadhar_number_", null);
          }
        });
    }
  },

  bank_ac_no: function (frm) {
    console.log("entered bank details");
    let bank_ac_no = frm.doc.bank_ac_no;
    if (bank_ac_no) {
      frappe
        .call({
          method:
            "sampat_industries.public.js.doctype_plugin.Employee.Employee.get_employee_bank_ac_detail",
          args: { bank_ac_no },
        })
        .done((r) => {
          console.log(r.message);
          if (r.message != false) {
            frappe.throw(
              "Employee " +
                r.message.employee +
                " with this bank account already exist"
            );
            frm.set_value("bank_ac_no", null);
          }
        });
    }
  },

  validate: function (frm) {
    let aadhar_number = frm.doc.aadhar_number_;
    if (aadhar_number) {
      frappe
        .call({
          method:
            "sampat_industries.public.js.doctype_plugin.Employee.Employee.get_employee_aadhar_detail",
          args: { aadhar_number },
        })
        .done((r) => {
          if (r.message != false && r.message.employee != frm.doc.employee) {
            frappe.throw(
              "Employee " +
                r.message.employee +
                " with this aadhar already exist"
            );
          }
        });
    }

    let bank_ac_no = frm.doc.bank_ac_no;
    if (bank_ac_no) {
      frappe
        .call({
          method:
            "sampat_industries.public.js.doctype_plugin.Employee.Employee.get_employee_bank_ac_detail",
          args: { bank_ac_no },
        })
        .done((r) => {
          if (r.message != false && r.message.employee != frm.doc.employee) {
            frappe.throw(
              "Employee " +
                r.message.employee +
                " with this bank account already exist. Refresh the page and enter correct bank details"
            );
          }
        });
    }
  },
});
