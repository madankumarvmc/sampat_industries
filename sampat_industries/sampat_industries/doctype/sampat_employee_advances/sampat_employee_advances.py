# Copyright (c) 2024, Niraj and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class SampatEmployeeAdvances(Document):
	pass


@frappe.whitelist()
def update_advance_in_employee_master(employee, new_advance):
    frappe.db.set_value('Employee', employee , {'advances_balance': new_advance})
    
    return True

