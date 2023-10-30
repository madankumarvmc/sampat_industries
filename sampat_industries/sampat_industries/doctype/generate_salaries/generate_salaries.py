# Copyright (c) 2023, Niraj and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class GenerateSalaries(Document):
	pass


# result = frappe.db.sql(f"""
# 	SELECT e.employee, e.first_name, e.monthly_basic_pay, e.pf_salary, e.regular_duty_hours, e.holiday_duty_hours, e.employee_type FROM `tabEmployee` e WHERE e.status = 'Active'               
# 	""", as_dict=True)

@frappe.whitelist()
def get_working_hours(start_date, end_date):
    result = frappe.db.sql(f"""
        SELECT  

        e.employee, e.employee_type, e.esi_number_ AS esi_number, e.pf_number, a.attendance_date, TIME(ci.time) in_time, TIME(co.time) out_time, DATE(ci.time) date, a.status attendance_status, a.docstatus, ht.parentfield holiday_status,
        e.monthly_basic_pay, e.regular_duty_hours, e.holiday_duty_hours, e.pf_salary 

        FROM `tabEmployee` e 
        
        LEFT JOIN `tabAttendance` a ON e.employee = a.employee
        
        LEFT JOIN `tabEmployee Checkin` ci ON e.employee = ci.employee AND ci.log_type = 'IN' AND DATE(ci.time) = a.attendance_date
        
        LEFT JOIN `tabEmployee Checkin` co ON e.employee = co.employee AND co.log_type = 'OUT' AND DATE(co.time) = a.attendance_date 
        
        LEFT JOIN (SELECT h.parentfield, h.holiday_date FROM tabHoliday h WHERE h.parent = 'Sampat Industries' AND h.holiday_date BETWEEN STR_TO_DATE('{start_date}', '%Y-%m-%d') AND STR_TO_DATE('{end_date}', '%Y-%m-%d')) ht 
            ON a.attendance_date = ht.holiday_date 
        
        WHERE a.attendance_date BETWEEN STR_TO_DATE('{start_date}', '%Y-%m-%d') AND STR_TO_DATE('{end_date}', '%Y-%m-%d') AND  a.docstatus != 2 
        
        ORDER BY e.employee, date;  
        
        """, as_dict=True)

    total_work_hours = result
    # # result[0].TOTAL_WORK_HOURS if result and result[0].TOTAL_WORK_HOURS else 0
    return total_work_hours


@frappe.whitelist()
def get_holidays(start_date, end_date):
    result = frappe.db.sql(f"""
        SELECT h.holiday_date holiday_date, h.description holiday_reason 
        
        FROM `tabHoliday` h  
        
        WHERE 
            h.holiday_date BETWEEN STR_TO_DATE('{start_date}', '%Y-%m-%d') AND STR_TO_DATE('{end_date}', '%Y-%m-%d') AND h.parent = 'Sampat Industries'
        
        ORDER BY h.holiday_date
        """, as_dict=True)
    
    return result
