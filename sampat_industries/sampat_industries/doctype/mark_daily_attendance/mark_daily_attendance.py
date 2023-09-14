# # Copyright (c) 2023, Niraj and contributors
# # For license information, please see license.txt

import frappe

import json

from frappe.model.document import Document

class MarkDailyAttendance(Document):
	pass

@frappe.whitelist()
def get_all_employees(company):
		# Query to fetch all employees from the 'Employee' doctype
	return frappe.get_all("Employee", filters={"status": "Active", "company":company}, fields=["name", "employee_name"])
	# return company
 
@frappe.whitelist()
def get_employees_checkin(date,company):
    
    return frappe.db.sql(f"""SELECT e.name,e.employee_name,TIME(ci.time) LOG_IN,ci.name login_checkinid, TIME(co.time) LOG_OUT,co.name logout_checkinid, ma.status attendance, ma.name attendance_id FROM `tabEmployee` e LEFT OUTER JOIN `tabEmployee Checkin` ci on e.name=ci.employee and ci.log_type='IN' and DATE(ci.time)=STR_TO_DATE('{date}','%Y-%m-%d') LEFT OUTER JOIN `tabEmployee Checkin` co on e.name = co.employee and co.log_type = 'OUT' and DATE(co.time)=STR_TO_DATE('{date}','%Y-%m-%d') LEFT OUTER JOIN `tabAttendance` ma on e.name = ma.employee and ma.docstatus != 2 and ma.attendance_date = STR_TO_DATE('{date}','%Y-%m-%d') where e.company = '{company}' """, as_dict=True)

	# return y


# def before_save(doc, method):
#     add_to_employee_checkin(doc)
#     frappe.msgprint(__("Save Event"))



# @frappe.whitelist()
# def update_to_employee_checkin(employee, time, login_type, checkinid, date):
#     # frappe.msgprint("try save/insert " )
#     if checkinid is not None:
#         # frappe.msgprint("try save/insert " )
#         ec_doc = frappe.get_doc("Employee Checkin", checkinid)
        
#         ec_doc.employee = employee
#         ec_doc.log_type = login_type
#         if time is not None:
#             ec_doc.time = date + " " + time
        
#         ec_doc.save(ignore_permissions=True)
#         # frappe.msgprint("Employee Checkin Updated")

# @frappe.whitelist()
# def add_to_employee_checkin(employee, time, login_type, date):
#         # frappe.msgprint("inserting " )
#         ec_doc = frappe.new_doc("Employee Checkin")
        
#         ec_doc.employee = employee
#         ec_doc.log_type = login_type
#         if time is not None:
#             ec_doc.time = date + " " + time
        
#         ec_doc.insert(ignore_permissions=True)
#         # frappe.msgprint("Employee Checkin Inserted")
     

@frappe.whitelist()
def add_to_attendance(employee, date, company, status):
    # if attendance_id is None:
        # frappe.msgprint(attendance_id)
        a_doc = frappe.new_doc("Attendance")
        
        a_doc.employee = employee
        a_doc.attendance_date = date
        a_doc.company = company
        a_doc.status = status
        if status == "On Leave":
            a_doc.leave_type = "Casual Leave"
        
        a_doc.insert(ignore_permissions=True)
        # frappe.msgprint("Attendance Updated")
        
        
        
@frappe.whitelist()
def update_to_employee_checkin(updateEmployeeCheckinArray):
    # frappe.msgprint("try save/insert " )
    
    result = json.loads(updateEmployeeCheckinArray)
    
    for x in result :
        
        
    
        frappe.msgprint(x["employee"])
        
        checkinid_1 = x["checkinid"]
        employee_1 = x["employee"]
        login_type_1 = x["loginType"]
        date_1 = x["date"]
        time_1 = x["time"]
        
    
        if checkinid_1 is not None:
            # frappe.msgprint("try save/insert " )
            ec_doc = frappe.get_doc("Employee Checkin", checkinid_1)
            
            ec_doc.employee = employee_1
            ec_doc.log_type = login_type_1
            if time_1 is not None:
                ec_doc.time = date_1 + " " + time_1
            
            ec_doc.save(ignore_permissions=True)
            # frappe.msgprint("Employee Checkin Updated")

        
@frappe.whitelist()
def add_to_employee_checkin(addEmployeeCheckinArray):
# frappe.msgprint("inserting " )

    result = json.loads(addEmployeeCheckinArray)
    
    for x in  result :
        
        frappe.msgprint(x["employee"])
       
        employee_1 = x["employee"]
        login_type_1 = x["loginType"]
        date_1 = x["date"]
        time_1 = x["time"]
        

        ec_doc = frappe.new_doc("Employee Checkin")
        
        ec_doc.employee = employee_1
        ec_doc.log_type = login_type_1
        if time_1 is not None:
            ec_doc.time = date_1 + " " + time_1
    
        ec_doc.insert(ignore_permissions=True)
    # frappe.msgprint("Employee Checkin Inserted")
    
    
    
    
    
