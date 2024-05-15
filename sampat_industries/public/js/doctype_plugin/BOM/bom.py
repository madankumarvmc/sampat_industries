# Copyright (c) 2024, Niraj and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class SampatEmployeeAdvances(Document):
	pass

@frappe.whitelist()
def get_alternate_uom_from_item_master(item_code):
    item_alternate_uom = frappe.db.get_value('Item', {'item_code': item_code}, ['alternate_uom', 'conversion_factor'], as_dict=1)
    
    return item_alternate_uom