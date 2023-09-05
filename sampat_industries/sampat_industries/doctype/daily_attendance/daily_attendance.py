# # Copyright (c) 2023, Niraj and contributors
# # For license information, please see license.txt

import frappe
from frappe.model.document import Document

class DailyAttendance(Document):
	pass

@frappe.whitelist()
def get_all_employees(company):
		# Query to fetch all employees from the 'Employee' doctype
	return frappe.get_all("Employee", filters={"status": "Active", "company":company}, fields=["name", "employee_name"])
	# return company
 
@frappe.whitelist()
def get_employees_checkin(date,company):
    
    return frappe.db.sql(f"""SELECT e.name,e.employee_name,TIME(ci.time) LOG_IN,ci.name login_checkinid, TIME(co.time) LOG_OUT,co.name logout_checkinid  FROM `tabEmployee` e left outer join `tabEmployee Checkin` ci on e.name=ci.employee and ci.log_type='IN' and DATE(ci.time)=STR_TO_DATE('{date}','%Y-%m-%d') left outer join `tabEmployee Checkin` co on e.name = co.employee and co.log_type = 'OUT' and DATE(co.time)=STR_TO_DATE('{date}','%Y-%m-%d') where e.company = '{company}'  """, as_dict=True)

	# return y


# def before_save(doc, method):
#     add_to_employee_checkin(doc)
#     frappe.msgprint(__("Save Event"))

@frappe.whitelist()
def update_to_employee_checkin(employee, time, login_type, checkinid, date):
    frappe.msgprint("try save/insert " )
    if checkinid is not None:
        frappe.msgprint("try save/insert " )
        ec_doc = frappe.get_doc("Employee Checkin", checkinid)
        ec_doc.employee = employee
        ec_doc.log_type = login_type
        ec_doc.time = date + " " + time
        ec_doc.save(ignore_permissions=True)
        frappe.msgprint("Employee Checkin Updated")

@frappe.whitelist()
def add_to_employee_checkin(employee, time, login_type, date):
        frappe.msgprint("inserting " )
        ec_doc = frappe.new_doc("Employee Checkin")
        ec_doc.employee = employee
        ec_doc.log_type = login_type
        ec_doc.time = date + " " + time
        ec_doc.insert(ignore_permissions=True)
        frappe.msgprint("Employee Checkin Inserted")
     
	# 	frappe.msgprint("inserting " )
	# 	ec_doc = frappe.new_doc("Employee Checkin")
	# 	ec_doc.employee = "HR-EMP-00001"
	# 	ec_doc.log_type = "IN"
	# 	ec_time = "05-09-2023 17:10:21"
	# 	ec_doc.insert(ignore_permissions=True)
	# 	frappe.msgprint("Employee Checkin Created")