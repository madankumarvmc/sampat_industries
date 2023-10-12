// Copyright (c) 2023, Niraj and contributors
// For license information, please see license.txt

frappe.ui.form.on('Mark Daily Attendance', {

	company: function(frm) {
			setDefaultDate(frm);
			fetchEmployeeAttendance(frm);
		},

	refresh: function(frm) {
		setDefaultDate(frm);
        fetchEmployeeAttendance(frm);
	},

	date : function (frm) {
		setDefaultDate(frm);
        fetchEmployeeAttendance(frm);
		
	},

	after_save: function (frm) {
		setDefaultDate(frm);
        fetchEmployeeAttendance(frm);
	},


	validate: function(frm) {
		let data = frm.doc.daily_attendance_child;

		function addEmployeeCheckinArrayFunction(addEmployeeCheckinArray) {
			frappe.call({
				method: "sampat_industries.sampat_industries.doctype.mark_daily_attendance.mark_daily_attendance.add_to_employee_checkin",
				args: { addEmployeeCheckinArray }
			}).done(() => {
				refresh_field("daily_attendance_child");
			});
		}

		function updateEmployeeCheckinArrayFunction(updateEmployeeCheckinArray) {
			frappe.call({
				method: "sampat_industries.sampat_industries.doctype.mark_daily_attendance.mark_daily_attendance.update_to_employee_checkin",
				args: { updateEmployeeCheckinArray }
			}).done(() => {
				refresh_field("daily_attendance_child");
			});
		}

		// Define a function to mark attendance

		function markAttendance(employee, date, company, status) {
			frappe.call({
				method: "sampat_industries.sampat_industries.doctype.mark_daily_attendance.mark_daily_attendance.add_to_attendance",
				args: { employee, date, company, status },
			}).done((r) => {
				// Handle the response if needed
			});
		}

		function addEmployeeAdvance(employee, date, advanceAmt) {
			frappe.call({
				method: "sampat_industries.sampat_industries.doctype.mark_daily_attendance.mark_daily_attendance.add_to_employee_advance",
				args: { employee, date, advanceAmt },
			}).done((r) => {
				// Handle the response if needed
			});
		}

		function deleteEmployeeCheckinDoc(absent, login_checkinid, logout_checkinid) {
			if (absent == "1" && (login_checkinid != null || logout_checkinid != null) ) {
				// Delete Employee Checkin Entry
				if (login_checkinid != null) {
					frappe.call({
						method: "sampat_industries.sampat_industries.doctype.mark_daily_attendance.mark_daily_attendance.delete_from_employee_checkin",
						args: { checkin_id : login_checkinid },
					}).done((r) => {
						refresh_field("daily_attendance_child");
					});
				} 
				if (logout_checkinid != null) {
					frappe.call({
						method: "sampat_industries.sampat_industries.doctype.mark_daily_attendance.mark_daily_attendance.delete_from_employee_checkin",
						args: { checkin_id : logout_checkinid },
					}).done((r) => {
						refresh_field("daily_attendance_child");
					});
				}
			}
		}
		
		let updateEmployeeCheckinArray = []
		let addEmployeeCheckinArray = []

		function pushUpdateEmployeeCheckinfunction(employee, time, loginType, checkinid, date) {
			updateEmployeeCheckinArray.push({ "employee": employee, "time": time, "loginType" : loginType, "checkinid" :checkinid, "date": date });
		}
	
		function pushAddEmployeeCheckinFunction(employee, time, loginType, checkinid, date) {
			addEmployeeCheckinArray.push({"employee": employee, "time": time, "loginType" : loginType, "checkinid" :checkinid, "date": date});
		}

		data.forEach(e => {
			if (e.in_time) {
				const time = Date.parse(frm.doc.date + "T" + e.in_time);
				
				if (e.login_checkinid) {
					// updateEmployeeCheckin(e.employee, e.in_time, "IN", e.login_checkinid, frm.doc.date);
					pushUpdateEmployeeCheckinfunction(e.employee, e.in_time, "IN", e.login_checkinid, frm.doc.date)
				} else {
					// addEmployeeCheckin(e.employee, e.in_time, "IN", e.login_checkinid, frm.doc.date);
					pushAddEmployeeCheckinFunction(e.employee, e.in_time, "IN", e.login_checkinid, frm.doc.date)
				}
			}
	
			if (e.out_time) {
				const time = Date.parse(frm.doc.date + "T" + e.out_time);
	
				if (e.logout_checkinid) {
					// updateEmployeeCheckin(e.employee, e.out_time, "OUT", e.logout_checkinid, frm.doc.date);
					pushUpdateEmployeeCheckinfunction(e.employee, e.out_time, "OUT", e.logout_checkinid, frm.doc.date)
				} else {
					// addEmployeeCheckin(e.employee, e.out_time, "OUT", e.logout_checkinid, frm.doc.date);
					pushAddEmployeeCheckinFunction(e.employee, e.out_time, "OUT", e.logout_checkinid, frm.doc.date)
				}
			}

			// delete doc from employye checkin

			deleteEmployeeCheckinDoc(e.absent, e.login_checkinid, e.logout_checkinid)

			// Check conditions and mark attendance
			if (e.attendance_id == null && e.in_time !== null) {
					// Mark Present	
				markAttendance(e.employee, frm.doc.date, frm.doc.company, "Present");

				} else if (e.in_time == null && e.absent == "1" && e.approved == "0" && e.attendance_id == null) {
					// Mark Absent
					markAttendance(e.employee, frm.doc.date, frm.doc.company, "Absent");
				} else if (e.in_time == null && e.absent == "1" && e.approved == "1" && e.attendance_id == null) {
					// Mark On Leave
					markAttendance(e.employee, frm.doc.date, frm.doc.company, "On Leave");
				} else if (e.attendance_id !== null && e.in_time == null && e.absent == null) {
					frappe.msgprint({
						title: __("Attendance Already Marked. \n Wait while document is saved. \n Ask the administrator to edit attendance sheet for these employees"),
						message: __(`Attendance Already marked for ${e.employee}`)
					});
				} else {

				}
			

			if (e.advance_amt) {
				addEmployeeAdvance(e.employee , frm.doc.date, e.advance_amt)
			}
		});

		if (addEmployeeCheckinArray.length > 0){
			addEmployeeCheckinArrayFunction(addEmployeeCheckinArray)
		}
		if (updateEmployeeCheckinArray.length > 0){
			updateEmployeeCheckinArrayFunction(updateEmployeeCheckinArray)
		}


	},

});


frappe.ui.form.on('Daily Attendance Child', {
	refresh: function(frm, cdt, cdn) {
		
	},

    in_time: function (frm, cdt, cdn) {
        calculateTotalHrs(frm, cdt, cdn);
    },

    out_time: function (frm, cdt, cdn) {
        calculateTotalHrs(frm, cdt, cdn);
    },
});



function setDefaultDate(frm) {
	if (frm.doc.date){
		frm.set_value('date', frm.doc.date);
	}else{
		frm.set_value('date', frappe.datetime.get_today() );
	}
}


function fetchEmployeeAttendance(frm) {
	const company = frm.doc.company || '';
	const date = frm.doc.date;

	frappe.call({
		method: "sampat_industries.sampat_industries.doctype.mark_daily_attendance.mark_daily_attendance.get_employees_checkin",
		args: {date, company}
	}).done((r) => {
			frm.doc.daily_attendance_child = [];
			// console.log(r)
		$.each(r.message, function(_i,e) {
			// console.log("printing!!!!!" + e.attendance)
			let entry = frm.add_child("daily_attendance_child");
			if (e.attendance == "Absent"){
				entry.employee = "<span style='color:red'>" + e.name + "</span>";
				entry.employee_name = "<span style='color:red'>" + e.employee_name + "</span>";
			} else {
				entry.employee = e.name;
				entry.employee_name = e.employee_name;
			}
			
			entry.in_time = e.LOG_IN
			entry.out_time = e.LOG_OUT
			entry.login_checkinid = e.login_checkinid
			entry.logout_checkinid = e.logout_checkinid
			entry.attendance_id = e.attendance_id
			let total_hrs_toupdate = updateTotalHrs(e.LOG_IN, e.LOG_OUT)
			let total_hrs = parseInt(total_hrs_toupdate, 10);
			if (total_hrs <= 0) {
				console.log(total_hrs_toupdate)
				entry.total_hrs = "<span style='color:red'>" + total_hrs_toupdate + "</span>";
			} else if ( 0 < total_hrs && total_hrs <= 5) {
				entry.total_hrs = "<span style='color:orange'>" + total_hrs_toupdate + "</span>";
			} else {
				entry.total_hrs = total_hrs_toupdate
			}

			if (e.attendance == "Present") {
				entry.present = "1"
			} else if (e.attendance == "Absent") {
				entry.absent = "1"
			} else if (e.attendance == "On Leave") {
				entry.absent = "1"
				entry.approved = "1"
			}else {
				// console.log("Do Nothing")
			}
		})
		refresh_field("daily_attendance_child");
		})
}


function calculateTotalHrs(frm, cdt, cdn) {
    const child = locals[cdt][cdn];
    const inTime = child.in_time;
    const outTime = child.out_time;

    if (inTime && outTime) {
        const timeDiff = moment(outTime, 'HH:mm').diff(moment(inTime, 'HH:mm'));
        const duration = moment.duration(timeDiff);
        const totalHrs = Math.floor(duration.asHours()) + moment.utc(timeDiff).format(":mm");

        frappe.model.set_value(cdt, cdn, 'total_hrs', totalHrs);
        frm.refresh_field('total_hrs');
    }
}

function updateTotalHrs(in_time, out_time) {
    const inTime = in_time;
    const outTime = out_time;

    if (inTime && outTime) {
        const timeDiff = moment(outTime, 'HH:mm').diff(moment(inTime, 'HH:mm'));
        const duration = moment.duration(timeDiff);
        const totalHrs = Math.floor(duration.asHours()) + moment.utc(timeDiff).format(":mm");

        // frappe.model.set_value('total_hrs', totalHrs);
		// console.log("Total Hrs Calculated")

		return totalHrs;
    }
}






