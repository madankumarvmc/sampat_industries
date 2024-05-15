# Copyright (c) 2024, Niraj and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class InternalMoneyTransfer(Document):
	pass


@frappe.whitelist()
def update_balance_amount_in_account(from_account_name, to_account_name, amount):
    from_account_doc = frappe.get_doc('Account', from_account_name)
    to_account_doc = frappe.get_doc('Account', to_account_name)
    
    from_balance_amount = float(from_account_doc.balance_amount)
    to_balance_amount = float(to_account_doc.balance_amount)
    amount = float(amount)
    
    from_total_amount = from_balance_amount - amount
    to_total_amount = to_balance_amount + amount
    
    from_account_doc.balance_amount = from_total_amount
    to_account_doc.balance_amount = to_total_amount
    
    from_account_doc.save()
    to_account_doc.save()
    
    return True

@frappe.whitelist()
def after_expense_balance_amount_in_account(from_account_name, amount):
    from_account_doc = frappe.get_doc('Account', from_account_name)
    
    from_balance_amount = float(from_account_doc.balance_amount)
    amount = float(amount)
    
    from_total_amount = from_balance_amount - amount
    
    from_account_doc.balance_amount = from_total_amount
    
    from_account_doc.save()
    
    return True

@frappe.whitelist()
def cancelled_after_expense_balance_amount_in_account(from_account_name, amount):
    from_account_doc = frappe.get_doc('Account', from_account_name)
    
    from_balance_amount = float(from_account_doc.balance_amount)
    amount = float(amount)
    
    from_total_amount = from_balance_amount + amount
    
    from_account_doc.balance_amount = from_total_amount
    
    from_account_doc.save()
    
    return True


@frappe.whitelist()
def add_to_employee_advances(employee, date, amount):
    a_doc = frappe.new_doc("Sampat Employee Advances")
    
    a_doc.employee = employee
    a_doc.date = date
    a_doc.advance_amount = amount
    
    # a_doc.insert(ignore_permissions=True)
    
    a_doc.save()
    a_doc.submit()
    frappe.msgprint("Advance Added")
    


@frappe.whitelist()
def get_advance_doc_to_cancel(employee, current_advance):
    return frappe.db.sql(f"""SELECT sea.name FROM `tabSampat Employee Advances`sea WHERE sea.employee = '{employee}' AND sea.prev_balance='{current_advance}' AND sea.docstatus = '1' ORDER BY sea.modified DESC """, as_dict=True)


@frappe.whitelist()
def cancel_advance_document(docname):
    doc = frappe.get_doc("Sampat Employee Advances", docname)
    doc.cancel()
    frappe.db.commit()
    return "advance doc cancelled successfully."



@frappe.whitelist()
def get_current_employee_advance(employee):
    return frappe.db.sql(f"""SELECT e.employee, e.advances_balance FROM `tabEmployee` e WHERE e.employee = '{employee}' """, as_dict=True)