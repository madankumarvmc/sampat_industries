# Copyright (c) 2023, Niraj and contributors
# For license information, please see license.txt

import frappe


def execute(filters=None):
    start_date = filters.get('start_date')
    end_date = filters.get('end_date')
    
    columns = [
        {"label": "Employee ID", "fieldname": "employee_id", "fieldtype": "Link", "options": "Employee"},
        {"label": "Employee Name", "fieldname": "employee_name", "fieldtype": "Data"},
        {"label": "Duty Hours", "fieldname": "duty_hours", "fieldtype": "Data"},
        {"label": "Salary PM", "fieldname": "salary_pm", "fieldtype": "Data"},
        {"label": "Gross Salary", "fieldname": "gross_salary", "fieldtype": "Data"},
        {"label": "ESI Ded", "fieldname": "esi_ded", "fieldtype": "Data"},
        {"label": "PF Ded", "fieldname": "pf_ded", "fieldtype": "Data"},
        {"label": "Total Penalty", "fieldname": "total_penalty", "fieldtype": "Data"},
		{"label": "Advance Deduction", "fieldname": "advance_deductions", "fieldtype": "Data"},
		{"label": "Total Deductions", "fieldname": "total_deductions", "fieldtype": "Data"},
  		{"label": "Net Salary", "fieldname": "net_salary", "fieldtype": "Data"}

    ]

    data = get_employee_salary_sheet(start_date, end_date)

    return columns, data

def get_employee_salary_sheet(start_date, end_date):
    return frappe.db.sql(f"""
	SELECT 

ess.employee AS employee_id,
ess.employee_name,
ess.duty_hours,
ROUND(ess.salary_pm, 0) AS salary_pm,
ROUND(ess.gross_salary, 0) AS gross_salary,
ROUND(ess.esi_ded, 0) AS esi_ded,
ROUND(ess.pf_ded, 0) AS pf_ded,
ROUND(ess.total_penalty, 0) AS total_penalty,
ess.advance_deductions,
ROUND(ess.total_deductions, 0) AS total_deductions,
ROUND(ess.net_salary, 0) AS net_salary


FROM `tabEmployee Salary Sheet` ess

WHERE ess.salary_start_date = '{start_date}' and ess.salary_end_date = '{end_date}'

ORDER BY ess.employee

    """, as_dict=True)