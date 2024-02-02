# Copyright (c) 2023, Niraj and contributors
# For license information, please see license.txt

import frappe


def execute(filters=None):
    start_date = filters.get('start_date')
    end_date = filters.get('end_date')
    
    columns = [
        {"label": "Employee ID", "fieldname": "employee_id", "fieldtype": "Link", "options": "Employee"},
		{"label": "Date", "fieldname": "monthDate", "fieldtype": "Date"},
  		{"label": "Weekday", "fieldname": "weekday", "fieldtype": "Data"},
      	{"label": "Holiday", "fieldname": "holiday_status", "fieldtype": "Data"},
		{"label": "In Time", "fieldname": "in_time", "fieldtype": "Data"},
		{"label": "Out Time", "fieldname": "out_time", "fieldtype": "Data"},
  		{"label": "Total Hours", "fieldname": "total_hours", "fieldtype": "Data"}

    ]

    data = get_employee_attendance_details(start_date, end_date)

    return columns, data

def get_employee_attendance_details(start_date, end_date):
    employee_attendance_data =  frappe.db.sql(f"""
	
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
        e.employee AS employee_id,
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
        
        a.attendance_date,
        a.docstatus,
        a.status attendance_status,
        
        TIME(ci.time) in_time,
        TIME(co.time) out_time,
        TIMEDIFF(TIME(co.time), TIME(ci.time)) AS total_hours,
        DATE(ci.time) date,
        
        ht.parentfield holiday_status,
        ht.parent
        
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

    ORDER BY
        e.employee,
        dr.date;


    """, as_dict=True)
    
    return employee_attendance_data