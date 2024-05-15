# Copyright (c) 2024, Niraj and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

# @frappe.whitelist()
# def get_employee_details(employee):
#     result = frappe.db.sql(f"""
#                   SELECT e.employee as employee, e.aadhar_number_ as aadhar_number, e.bank_ac_no as bank_acc_no FROM `tabEmployee` e
#                   """, as_dict=True)
    
#     return result


@frappe.whitelist()
def get_employee_aadhar_detail(aadhar_number):
    employee_detail = frappe.db.get_value('Employee', {'aadhar_number_': aadhar_number}, ['employee'], as_dict=True)
    
    if employee_detail is not None:
        return employee_detail
    else:
        return False


@frappe.whitelist()
def get_employee_bank_ac_detail(bank_ac_no):
    employee_detail = frappe.db.get_value('Employee', {'bank_ac_no': bank_ac_no}, ['employee'], as_dict=True)
    
    if employee_detail is not None:
        return employee_detail
    else:
        return False