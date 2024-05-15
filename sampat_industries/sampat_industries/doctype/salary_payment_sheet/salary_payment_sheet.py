# Copyright (c) 2024, Niraj and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class SalaryPaymentSheet(Document):
	pass

@frappe.whitelist()
def get_employee_salary_details(end_date):
    
	day_wise_pay_details = frappe.db.get_list ("Employee Attendance Table",
		filters={
			'date': end_date
		},
		fields=['employee', 'employee_name', 'date', 'gross_pay', 'pf_deduction', 'esi_deduction', 'company', 'employee_type', 'monthly_basic_pay', 'pf_salary', 'esi_number', 'pf_number', 'advance_deduction', 'penalty', 'add_salary' ],
		order_by='employee asc',
		# start=10,
		# page_length=20,
		as_list= 0,
		ignore_permissions=True
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
		
		net_pay = gross_pay - (pf_deduction + esi_deduction)

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
			'advance_deduction': advance_deduction,
			'penalty' : penalty,
			'add_salary' : add_salary,
			'salary_adjustment': '0',
			'net_pay': net_pay,
			'company': company,
			'employee_type' : employee_type,
			'monthly_basic_pay' : monthly_basic_pay,
			'pf_salary' : pf_salary,
			'esi_number' : esi_number,
			'pf_number' : pf_number
		}
		
		# Append the dictionary to the list
		if(gross_pay > 0):
			pay_details_list.append(pay_entry)

	return pay_details_list