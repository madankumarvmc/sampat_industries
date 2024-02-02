# Copyright (c) 2023, Niraj and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class YearlyIncrementEntry(Document):
	pass


@frappe.whitelist()
def employee_details():
    result = frappe.db.sql(f"""
        SELECT
	e.name,
	e.employee_name,
	e.monthly_basic_pay

	FROM`tabEmployee` e
	WHERE e.status = 'active'
 	ORDER BY e.name
        """, as_dict=True)
    
    return result