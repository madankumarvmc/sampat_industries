# Copyright (c) 2024, Niraj and contributors
# For license information, please see license.txt

import frappe


def execute(filters=None):
    start_date = filters.get('start_date')
    end_date = filters.get('end_date')
    
    columns = [
        {"label": "Employee ID", "fieldname": "employee", "fieldtype": "Data"},
        {"label": "Employee Name", "fieldname": "employee_name", "fieldtype": "Data"},
        {"label": "Gross Salary", "fieldname": "gross_pay", "fieldtype": "int"},
        {"label": "PF", "fieldname": "pf_deduction", "fieldtype": "int"},
        {"label": "ESI", "fieldname": "esi_deduction", "fieldtype": "int"},
        {"label": "Advance Ded", "fieldname": "advance_deduction", "fieldtype": "int"},
        {"label": "Penalty", "fieldname": "penalty", "fieldtype": "int"},
        {"label": "Add Salary", "fieldname": "add_salary", "fieldtype": "int"},
        # {"label": "Adjustment", "fieldname": "salary_adjustment", "fieldtype": "int"},
        {"label": "Net Salary", "fieldname": "net_pay", "fieldtype": "int"},
        {"label": "Company", "fieldname": "company", "fieldtype": "Data"},
        {"label": "Employee Type", "fieldname": "employee_type", "fieldtype": "Data"},
        {"label": "Monthly Basic Pay", "fieldname": "monthly_basic_pay", "fieldtype": "Data"},
        {"label": "PF Salary", "fieldname": "pf_salary", "fieldtype": "Data"},
        {"label": "ESI Number", "fieldname": "esi_number", "fieldtype": "Data"},
        {"label": "PF Number", "fieldname": "pf_number", "fieldtype": "Data"},
        {"label": "ESI Company", "fieldname": "esi_company", "fieldtype": "Data"},
        {"label": "Salary Mode", "fieldname": "salary_mode", "fieldtype": "Data"},
        {"label": "Bank Name", "fieldname": "bank", "fieldtype": "Data"},
        {"label": "Bank Ac No", "fieldname": "bank_ac_no", "fieldtype": "Data"},
        {"label": "IFSC Code", "fieldname": "ifsc_code", "fieldtype": "Data"}
    ]
    data = get_employee_salary_details(end_date)

    return columns, data


def get_employee_salary_details(end_date):
    
	day_wise_pay_details = frappe.db.get_list ("Employee Attendance Table",
		filters={
			'date': end_date
		},
		fields=['employee', 'employee_name', 'date', 'gross_pay', 'pf_deduction', 'esi_deduction', 'company', 'employee_type', 'monthly_basic_pay', 'pf_salary', 'esi_number', 'pf_number', 'advance_deduction', 'penalty', 'add_salary' ],
		order_by='employee asc',
		ignore_permissions=True,
		# start=10,
		# page_length=20,
		as_list= 0
	)

	pay_details_list = []

	for entry in day_wise_pay_details:
		employee = entry.employee
		employee_name = entry.employee_name
		gross_pay = float(entry.gross_pay)
		pf_deduction = float(entry.pf_deduction)
		esi_deduction = float(entry.esi_deduction)
		advance_deduction = float(entry.advance_deduction)
		penalty = float(entry.penalty)
		add_salary = float(entry.add_salary)
		company = entry.company
  
		employee_type = entry.employee_type
		monthly_basic_pay = entry.monthly_basic_pay
		pf_salary = entry.pf_salary
		esi_number = entry.esi_number
		pf_number = entry.pf_number
  
		employee_data = frappe.db.get_value("Employee", employee,
			["esi_company", "salary_mode", "bank", "bank_ac_no", "ifsc_code"],
			as_dict=True) 

		esi_company = employee_data.esi_company
		salary_mode = employee_data.salary_mode
		bank = employee_data.bank
		bank_ac_no = employee_data.bank_ac_no
		ifsc_code = employee_data.ifsc_code
		
		net_pay = gross_pay - (pf_deduction + esi_deduction + advance_deduction + penalty) + (add_salary)

		if(gross_pay == 0):
			pf_deduction = 0
			esi_deduction = 0
			net_pay = 0
		
		# Create a dictionary for current entry
		pay_entry = {
			'employee': employee,
			'employee_name': employee_name,
			'gross_pay': gross_pay,
			'pf_deduction': pf_deduction,
			'esi_deduction': esi_deduction,
			'advance_deduction' : advance_deduction,
			'penalty' : penalty,
			'add_salary' : add_salary,
			'salary_adjustment': '0',
			'net_pay': net_pay,
			'company': company,
			'employee_type' : employee_type,
			'monthly_basic_pay' : monthly_basic_pay,
			'pf_salary' : pf_salary,
			'esi_number' : esi_number,
			'pf_number' : pf_number,
			'esi_company' : esi_company,
			'salary_mode' : salary_mode,
			'bank' : bank,
			'bank_ac_no' : bank_ac_no,
			'ifsc_code' : ifsc_code
   }
		
		# Append the dictionary to the list
		if(gross_pay > 0):
			pay_details_list.append(pay_entry)

	return pay_details_list

  
