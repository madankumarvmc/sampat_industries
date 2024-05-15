# Copyright (c) 2023, Niraj and contributors
# For license information, please see license.txt


import frappe
from frappe.model.document import Document
import datetime
from dateutil.relativedelta import relativedelta


class EmployeeSalarySlip(Document):
   pass




# result = frappe.db.sql(f"""
#   SELECT e.employee, e.first_name, e.monthly_basic_pay, e.pf_salary, e.regular_duty_hours, e.holiday_duty_hours, e.employee_type FROM `tabEmployee` e WHERE e.status = 'Active'              
#   """, as_dict=True)


@frappe.whitelist()
def get_working_hours(start_date, end_date):
   result = frappe.db.sql(f"""
       # SELECT 


       # e.employee, e.employee_name, e.employee_type, e.date_of_joining, e.company, e.esi_number_ AS esi_number, e.pf_number, a.attendance_date, TIME(ci.time) in_time, TIME(co.time) out_time, DATE(ci.time) date, a.status attendance_status, a.docstatus, ht.parentfield holiday_status, ht.parent,
       # e.monthly_basic_pay, e.regular_duty_hours, e.holiday_duty_hours, e.holiday_payable, e.pf_salary, e.holiday_payable


       # FROM `tabEmployee` e
      
       # LEFT JOIN `tabAttendance` a ON e.employee = a.employee
      
       # LEFT JOIN `tabEmployee Checkin` ci ON e.employee = ci.employee AND ci.log_type = 'IN' AND DATE(ci.time) = a.attendance_date
      
       # LEFT JOIN `tabEmployee Checkin` co ON e.employee = co.employee AND co.log_type = 'OUT' AND DATE(co.time) = a.attendance_date
      
       # LEFT JOIN (SELECT h.parentfield, h.holiday_date, h.parent FROM tabHoliday h WHERE h.holiday_date BETWEEN STR_TO_DATE('{start_date}', '%Y-%m-%d') AND STR_TO_DATE('{end_date}', '%Y-%m-%d')) ht
       #     ON a.attendance_date = ht.holiday_date AND e.company = ht.parent
      
       # WHERE a.attendance_date BETWEEN STR_TO_DATE('{start_date}', '%Y-%m-%d') AND STR_TO_DATE('{end_date}', '%Y-%m-%d') AND  a.docstatus != 2
      
       # ORDER BY e.employee, attendance_date; 
      
      
      
      
   WITH RECURSIVE DateRange AS (
   SELECT CAST(STR_TO_DATE('{start_date}', '%Y-%m-%d') AS DATE) AS date
   UNION ALL
   SELECT date + INTERVAL 1 DAY
   FROM DateRange
   WHERE date + INTERVAL 1 DAY <= STR_TO_DATE('{end_date}', '%Y-%m-%d')
   )


   SELECT
       dr.date monthDate,
       DAYNAME(dr.date) AS weekday,
       e.employee,
       e.employee_name,
       e.employee_type,
       e.date_of_joining,
       e.company,
       e.monthly_basic_pay,
       e.regular_duty_hours,
       e.holiday_duty_hours,
       e.pf_salary,
       e.esi_number_ AS esi_number,
       e.pf_number,
       e.holiday_payable,
       e.status,
      
       a.attendance_date,
       a.docstatus,
       a.status attendance_status,
      
       TIME(ci.time) in_time,
       TIME(co.time) out_time,
       DATE(ci.time) date,
      
       ht.parentfield holiday_status,
       ht.parent,
       
       ap.to_deduct,
       ap.advance_balance
      
   FROM
       DateRange dr
   CROSS JOIN
       `tabEmployee` e
   LEFT JOIN
       `tabAttendance` a ON e.employee = a.employee AND dr.date = a.attendance_date AND a.docstatus != '2'
   LEFT JOIN
       `tabEmployee Checkin` ci ON e.employee = ci.employee AND ci.log_type = 'IN' AND DATE(ci.time) = a.attendance_date
   LEFT JOIN
       `tabEmployee Checkin` co ON e.employee = co.employee AND co.log_type = 'OUT' AND DATE(co.time) = a.attendance_date
   LEFT JOIN (SELECT h.parentfield, h.holiday_date, h.parent FROM tabHoliday h WHERE h.holiday_date BETWEEN STR_TO_DATE('{start_date}', '%Y-%m-%d') AND STR_TO_DATE('{end_date}', '%Y-%m-%d')) ht
       ON dr.date = ht.holiday_date AND e.company = ht.parent
       
    LEFT JOIN (SELECT eap.name, eap.month_start_date,eap.month_end_date, seat.employee, seat.to_deduct, seat.advance_balance FROM `tabSampay Employee Advances Payment`eap LEFT JOIN `tabSampat Employee Advance Table` seat ON seat.parent = eap.name WHERE eap.docstatus = '1' AND eap.month_start_date = STR_TO_DATE('{start_date}', '%Y-%m-%d') AND eap.month_end_date = STR_TO_DATE('{end_date}', '%Y-%m-%d')) ap
        ON ap.employee = e.employee


   ORDER BY
       e.employee,
       dr.date;


      
       """, as_dict=True)


   total_work_hours = result
   # # result[0].TOTAL_WORK_HOURS if result and result[0].TOTAL_WORK_HOURS else 0
   return total_work_hours


@frappe.whitelist()
def get_production_pay_details(start_date, end_date):
    result = frappe.db.sql(f"""SELECT  ep.date, epc.parent, epc.employee, epc.operation_cost, epc.qty, epc.work_hrs  FROM `tabWorker Production Sheet` ep RIGHT JOIN `tabWorker Production Sheet Child`epc ON epc.parent = ep.name WHERE epc.docstatus = '1' AND ep.date BETWEEN '{start_date}' AND '{end_date}'""", as_dict = True)
    
    return result

@frappe.whitelist()
def get_salary_adjustment_details(start_date, end_date):
    result = frappe.db.sql(f"""SELECT sa.employee, sas.month_start_date, sas.month_end_date, sa.type, sa.amount 
                            FROM `tabSalary Adjustment Sheet` sas 
                            LEFT JOIN `tabSalary Adjustment` sa ON sas.name = sa.parent 
                            WHERE sa.docstatus = '1' AND sas.month_start_date = STR_TO_DATE('{start_date}', '%Y-%m-%d') 
                            AND sas.month_end_date = STR_TO_DATE('{end_date}', '%Y-%m-%d') ORDER BY sa.employee""", as_dict=True)
    return result



@frappe.whitelist()
def get_holidays(start_date, end_date):
   result = frappe.db.sql(f"""
       SELECT h.holiday_date holiday_date, h.description holiday_reason, h.parent holiday_unit
      
       FROM `tabHoliday` h 
      
       WHERE
           h.holiday_date BETWEEN STR_TO_DATE('{start_date}', '%Y-%m-%d') AND STR_TO_DATE('{end_date}', '%Y-%m-%d')
      
       ORDER BY h.holiday_date
       """, as_dict=True)
  
   return result

@frappe.whitelist()
def get_previous_month_attendance_details(start_date, end_date):
    # Calculate the start date based on the given start_date minus 7 days from the last month
    # last_month_end = datetime.datetime.strptime(start_date, '%Y-%m-%d') - relativedelta(months=1)
    start_date_obj = datetime.datetime.strptime(start_date, '%Y-%m-%d')
    last_month_end = start_date_obj.replace(day=1) - datetime.timedelta(days=1)
    start_date_last_month_minus_7_days = (last_month_end - datetime.timedelta(days=6)).strftime('%Y-%m-%d')
    
    result = frappe.db.sql(f""" 
        WITH RECURSIVE DateRange AS (
        SELECT CAST(STR_TO_DATE('{start_date_last_month_minus_7_days}', '%Y-%m-%d') AS DATE) AS date
        UNION ALL
        SELECT date + INTERVAL 1 DAY
        FROM DateRange
        WHERE date + INTERVAL 1 DAY <= STR_TO_DATE('{last_month_end}', '%Y-%m-%d')
        )
        
        SELECT dr.date monthDate, DAYNAME(dr.date) AS weekday, e.employee, a.status attendance_status, ht.parentfield holiday_status, ht.parent
        
        FROM DateRange dr 
        
        CROSS JOIN `tabEmployee` e 
        
        LEFT JOIN
       `tabAttendance` a ON e.employee = a.employee AND dr.date = a.attendance_date AND a.docstatus != '2'
       
        LEFT JOIN (SELECT h.parentfield, h.holiday_date, h.parent FROM tabHoliday h WHERE h.holiday_date BETWEEN STR_TO_DATE('{start_date_last_month_minus_7_days}', '%Y-%m-%d') AND STR_TO_DATE('{last_month_end}', '%Y-%m-%d')) ht
        ON dr.date = ht.holiday_date AND e.company = ht.parent
                           
        """, as_dict= True)
    
    return result