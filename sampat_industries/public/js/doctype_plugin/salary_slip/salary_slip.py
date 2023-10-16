import frappe


# @frappe.whitelist()
# def get_daily_working_hours(employee, start_date,end_date):
#     return frappe.db.sql(f"""
#         SELECT 
#     DATE(ci.time) Date,
#     TIME(ci.time) LOG_IN,
#     TIME(co.time) LOG_OUT,
#     TIMEDIFF(TIME(co.time), TIME(ci.time)) AS WORK_HOURS
# FROM 
#     `tabEmployee Checkin` ci
# LEFT OUTER JOIN 
#     `tabEmployee Checkin` co 
#     ON
#     DATE(co.time) = DATE(ci.time)
#     and co.log_type = 'OUT' 
#     and co.employee = "{employee}"
    
# WHERE
#     ci.log_type="IN" and
#     ci.employee = "{employee}" and
#     DATE(ci.time) BETWEEN STR_TO_DATE('{start_date}','%Y-%m-%d') AND STR_TO_DATE('{end_date}','%Y-%m-%d')    
#     """, as_dict=True)

@frappe.whitelist()
def get_daily_working_hours(employee, start_date, end_date):
    result = frappe.db.sql(f"""
        SELECT 
        DATE(ci.time) Date,
            TIMEDIFF(TIME(co.time), TIME(ci.time)) AS WORK_HOURS,
            ht.parentfield
        FROM 
            `tabEmployee Checkin` ci
        LEFT OUTER JOIN 
            `tabEmployee Checkin` co 
            ON
            DATE(co.time) = DATE(ci.time)
            AND co.log_type = 'OUT' 
            AND co.employee = "{employee}"
        LEFT OUTER JOIN
            (SELECT h.parentfield, h.holiday_date FROM tabHoliday h WHERE h.parent = 'Sampat Industries' AND h.holiday_date BETWEEN STR_TO_DATE('{start_date}', '%Y-%m-%d') AND STR_TO_DATE('{end_date}', '%Y-%m-%d')) ht
            ON 
            ht.holiday_date = DATE(ci.time)
        WHERE
            ci.log_type = "IN"
            AND ci.employee = "{employee}"
            AND DATE(ci.time) BETWEEN STR_TO_DATE('{start_date}', '%Y-%m-%d') AND STR_TO_DATE('{end_date}', '%Y-%m-%d')    
        """, as_dict=True)

    total_work_hours = result
    # # result[0].TOTAL_WORK_HOURS if result and result[0].TOTAL_WORK_HOURS else 0
    return total_work_hours

    
@frappe.whitelist()
def get_total_working_days(employee, start_date, end_date):
    result = frappe.db.sql(f"""
        SELECT 
            a.employee AS employee_name, a.attendance_date, a.status 
        FROM 
            `tabAttendance` a 
        WHERE 
            a.employee = '{employee}' AND 
            a.attendance_date BETWEEN STR_TO_DATE('{start_date}', '%Y-%m-%d') AND STR_TO_DATE('{end_date}', '%Y-%m-%d')
        """, as_dict=True)
    
    return result


@frappe.whitelist()
def get_employee_salary_details(employee):
    result = frappe.db.sql(f"""
            SELECT e.monthly_basic_pay, e.regular_duty_hours, e. holiday_duty_hrs, e.pf_salary, e.employee_type FROM `tabEmployee` e WHERE e.employee = '{employee}'    
        """, as_dict=True)
    
    return result

    
