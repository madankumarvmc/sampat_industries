# Copyright (c) 2024, Niraj and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class WorkerProductionSheet(Document):
	pass


@frappe.whitelist()
def get_employee_operation_cost(employee, operation):
    
    return frappe.db.sql(f""" SELECT oc.cost FROM `tabOperation Cost For Employee` oc WHERE oc.employee = '{employee}' AND oc.parent = '{operation}' """, as_dict = True)