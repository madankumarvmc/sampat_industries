# Copyright (c) 2024, Niraj and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class SampayEmployeeAdvancesPayment(Document):
	pass


@frappe.whitelist()
def get_employees_with_advances():
    
    return frappe.db.sql(f"""SELECT e.employee, e.employee_name, e.advances_balance FROM `tabEmployee`e WHERE e.advances_balance != 0 ORDER BY e.employee;""", as_dict=True)

@frappe.whitelist()
def update_advance_in_employee_master(employee, new_advance):
    frappe.db.set_value('Employee', employee , {'advances_balance': new_advance})
    
    return True