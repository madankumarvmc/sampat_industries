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
