# Copyright (c) 2024, Niraj and contributors
# For license information, please see license.txt

import frappe


def execute(filters=None):
    
    month_start_date = filters.get('month_start_date')
    month_end_date = filters.get('month_end_date')
    
    
    columns= [
		{"label": "Employee", "fieldname": "employee", "fieldtype": "Link", "options": "Employee"},
        {"label": "Employee Name", "fieldname": "employee_name", "fieldtype": "Data"},
        {"label": "Date", "fieldname": "date", "fieldtype": "Data"},
        {"label": "Operation", "fieldname": "operation", "fieldtype": "Link", "options": "Operation"},
        {"label": "Operation Cost", "fieldname": "operation_cost", "fieldtype": "Data"},
        {"label": "Quantity", "fieldname": "qty", "fieldtype": "Data"},
        {"label": "Work Hrs", "fieldname": "work_hrs", "fieldtype": "Data"},
	]
    
    data = get_production_sheet_details(month_start_date, month_end_date)
    return columns, data




def get_production_sheet_details(month_start_date, month_end_date):
    return frappe.db.sql(f"""
        SELECT 
            wps.date as date, 
            wpsc.employee as employee, 
            wpsc.employee_name as employee_name, 
            wpsc.operation as operation, 
            wpsc.operation_cost as operation_cost, 
            wpsc.qty as qty,
            wpsc.work_hrs as work_hrs
        FROM `tabWorker Production Sheet` wps 
        LEFT JOIN `tabWorker Production Sheet Child` wpsc ON wps.name = wpsc.parent 
        WHERE wpsc.docstatus = '1' AND wps.date BETWEEN '{month_start_date}' AND '{month_end_date}' ORDER BY wpsc.employee, wps.date ASC
    """, as_dict=True)

