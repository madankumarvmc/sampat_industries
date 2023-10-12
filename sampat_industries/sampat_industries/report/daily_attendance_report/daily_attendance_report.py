# Copyright (c) 2023, Niraj and contributors
# For license information, please see license.txt

# import frappe


# def execute(filters=None):
# 	columns, data = [], []
# 	return columns, data

import frappe

def execute(filters=None):
    from_date = filters.get('from_date')
    to_date = filters.get('to_date')
    company = filters.get('company')
    
    columns = [
        {"label": "Employee ID", "fieldname": "employee_id", "fieldtype": "Link", "options": "Employee"},
        {"label": "Employee Name", "fieldname": "employee_name", "fieldtype": "Data"},
        {"label": "Date", "fieldname": "attendance_date", "fieldtype": "Date"},
        {"label": "Log In Time", "fieldname": "LOG_IN", "fieldtype": "Time"},
        # {"label": "Log In Checkin ID", "fieldname": "login_checkinid", "fieldtype": "Data"},
        {"label": "Log Out Time", "fieldname": "LOG_OUT", "fieldtype": "Time"},
        {"label": "Total Hours", "fieldname": "total_hrs", "fieldtype": "Data"},
        # {"label": "Log Out Checkin ID", "fieldname": "logout_checkinid", "fieldtype": "Data"},
        {"label": "Attendance Status", "fieldname": "attendance_status", "fieldtype": "Data"},
        # {"label": "Attendance ID", "fieldname": "attendance_id", "fieldtype": "Link", "options": "Attendance"}
    ]

    data = get_employees_checkin(from_date, to_date, company)

    return columns, data


def get_employees_checkin(from_date, to_date,company):
    return frappe.db.sql(f"""
        SELECT
    t1.employee_id,
    t1.employee_name,
    t1.checkin_date ,
    t1.checkin_time AS LOG_IN,
    t2.checkin_time AS LOG_OUT,
    t3.status AS attendance_status,
    t3.attendance_date,
    t3.employee_id,
    t3.employee_name,
    TIMEDIFF(t2.checkin_time, t1.checkin_time) AS total_hrs
FROM
    (SELECT
        e.name AS employee_id,
        e.employee_name,
        DATE(ci.time) AS checkin_date,
        TIME(ci.time) AS checkin_time
     FROM
        `tabEmployee` e
        LEFT JOIN `tabEmployee Checkin` ci ON e.name = ci.employee
     WHERE
        e.company = '{company}' AND log_type = 'IN' AND DATE(ci.time) BETWEEN '{from_date}' AND '{to_date}') AS t1
    JOIN
    (SELECT
        e.name AS employee_id,
        DATE(ci.time) AS checkin_date,
        TIME(ci.time) AS checkin_time
     FROM
        `tabEmployee` e
        LEFT JOIN `tabEmployee Checkin` ci ON e.name = ci.employee
     WHERE
        e.company = '{company}' AND log_type = 'OUT' AND DATE(ci.time) BETWEEN '{from_date}' AND '{to_date}') AS t2
    ON t1.employee_id = t2.employee_id AND t1.checkin_date = t2.checkin_date
    RIGHT OUTER JOIN
    (SELECT
        e.name AS employee_id,
        e.employee_name AS employee_name,
        ma.status,
        ma.attendance_date
     FROM
        `tabEmployee` e
        LEFT JOIN `tabAttendance` ma ON e.name = ma.employee AND ma.docstatus != 2
     WHERE
        e.company = '{company}' AND ma.attendance_date BETWEEN '{from_date}' AND '{to_date}') AS t3
    ON t1.employee_id = t3.employee_id AND t1.checkin_date = t3.attendance_date;


    """, as_dict=True)





# SELECT
#     e.name AS employee_id,
#     e.employee_name AS employee_name,
#     DATE(ci.time) AS checkin_date,
#     TIME(ci.time) AS checkin_time,
#     log_type
# --     TIME(co.time) AS checkout_time,
# --     ma.status attendance
# FROM
#     `tabEmployee` e
#     LEFT JOIN `tabEmployee Checkin` ci ON e.name = ci.employee
# --     LEFT JOIN `tabEmployee Checkin` co ON e.name = co.employee AND DATE(ci.time) = DATE(co.time)  -- Join on employee and same date
# --     LEFT JOIN `tabAttendance` ma ON e.name = ma.employee AND ma.docstatus != 2 AND ma.attendance_date = 
# WHERE
#     e.company = 'Sampat Industries';


# with t1 as (
# 	SELECT
#     e.name AS employee_id,
#     e.employee_name AS employee_name,
#     DATE(ci.time) AS checkin_date,
#     TIME(ci.time) AS checkin_time
# --     TIME(co.time) AS checkout_time,
# --     ma.status attendance
# FROM
#     `tabEmployee` e
#     LEFT JOIN `tabEmployee Checkin` ci ON e.name = ci.employee
# --     LEFT JOIN `tabEmployee Checkin` co ON e.name = co.employee AND DATE(ci.time) = DATE(co.time)  -- Join on employee and same date
# --     LEFT JOIN `tabAttendance` ma ON e.name = ma.employee AND ma.docstatus != 2 AND ma.attendance_date = 
# WHERE
#     e.company = 'Sampat Industries' and log_type = 'IN'
# ),
# t2 as (
#  SELECT
#     e.name AS employee_id,
#     e.employee_name AS employee_name,
#     DATE(ci.time) AS checkin_date,
#     TIME(ci.time) AS checkin_time
# --     TIME(co.time) AS checkout_time,
# --      ma.status attendance
# FROM
#     `tabEmployee` e
#     LEFT JOIN `tabEmployee Checkin` ci ON e.name = ci.employee
# --     LEFT JOIN `tabEmployee Checkin` co ON e.name = co.employee AND DATE(ci.time) = DATE(co.time)  -- Join on employee and same date
# --     LEFT JOIN `tabAttendance` ma ON e.name = ma.employee AND ma.docstatus != 2 AND ma.attendance_date = 
# WHERE
#     e.company = 'Sampat Industries' and log_type = 'OUT'
# ),
# t3 as (
#  SELECT
#     e.name AS employee_id,
#     ma.status,
#     attendance_date
# --     TIME(co.time) AS checkout_time,
# --      ma.status attendance
# FROM
#     `tabEmployee` e
# --     LEFT JOIN `tabEmployee Checkin` ci ON e.name = ci.employee
# --     LEFT JOIN `tabEmployee Checkin` co ON e.name = co.employee AND DATE(ci.time) = DATE(co.time)  -- Join on employee and same date
#      LEFT JOIN `tabAttendance` ma ON e.name = ma.employee AND ma.docstatus != 2 
# WHERE
#     e.company = 'Sampat Industries' 
# )
# select t1.employee_id, t1.employee_name, t1.checkin_date, t1.checkin_time, t2.checkin_time as 'checkout_time', t3.*
# from t1 join t2 on 
# t1.employee_id = t2.employee_id
# and t1.checkin_date = t2.checkin_date
# right outer join t3 on t1.employee_id = t3.employee_id and t1.checkin_date=t3.attendance_date
# -- order by attendance_date, t1.employee_id
