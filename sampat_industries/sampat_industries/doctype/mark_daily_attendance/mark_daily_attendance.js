// Copyright (c) 2023, Niraj and contributors
// For license information, please see license.txt

frappe.ui.form.on('Mark Daily Attendance', {

	// refresh: function(frm) {
	// 	// get_all_employees();
	// 	},

	company: function(frm) {

		if (frm.doc.date){
			frm.set_value('date', frm.doc.date);
		}else{
			frm.set_value('date', frappe.datetime.get_today() );

		}

		let company = frm.doc.company
		if (!company) {
			company = ""
		}
			frappe.call({
				method: "sampat_industries.sampat_industries.doctype.mark_daily_attendance.mark_daily_attendance.get_employees_checkin",
				args: {date: frm.doc.date, company: frm.doc.company}
			}).done((r) => {
					frm.doc.daily_attendance_child = [];
					// console.log(r)
				$.each(r.message, function(_i,e) {
					// console.log("printing!!!!!" + e.attendance)
					let entry = frm.add_child("daily_attendance_child");
					entry.employee = e.name;
					entry.employee_name = e.employee_name;
					entry.in_time = e.LOG_IN
					entry.out_time = e.LOG_OUT
					entry.login_checkinid = e.login_checkinid
					entry.logout_checkinid = e.logout_checkinid
					entry.attendance_id = e.attendance_id

					if (e.attendance == "Present") {
						// entry.absent = "0"
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
		},
		

	refresh: function(frm) {
			// Set the "Date" field to today's date when the form is loaded
			if (frm.doc.date){
				frm.set_value('date', frm.doc.date);
			}else{
				frm.set_value('date', frappe.datetime.get_today() );

			}

			let company = frm.doc.company
			// console.log (company)
			if (!company) {
			company = ""
			}
			// frm.set_value('company', null);
			// console.log(frm.doc)

			frappe.call({
				method: "sampat_industries.sampat_industries.doctype.mark_daily_attendance.mark_daily_attendance.get_employees_checkin",
				args: {date: frm.doc.date, company: company}
			}).done((r) => {
					frm.doc.daily_attendance_child = [];
					// console.log(r)
				$.each(r.message, function(_i,e) {
					// console.log("printing!!!!!" + e.attendance)
					let entry = frm.add_child("daily_attendance_child");
					entry.employee = e.name;
					entry.employee_name = e.employee_name;
					entry.in_time = e.LOG_IN
					entry.out_time = e.LOG_OUT
					entry.login_checkinid = e.login_checkinid
					entry.logout_checkinid = e.logout_checkinid
					entry.attendance_id = e.attendance_id
					
					updateTotalHrs(e.LOG_IN, e.LOG_OUT )

					if (e.attendance == "Present") {
						// entry.absent = "0"
					} else if (e.attendance == "Absent") {
						entry.absent = "1"
					} else if (e.attendance == "On Leave") {
						entry.absent = "1"
						entry.approved = "1"
					} else {
						// console.log("Do Nothing")
					}
				})
				refresh_field("daily_attendance_child");
				// frm.refresh_field('total_hrs');
				})


		},

	date : function (frm) {
		
		let company = frm.doc.company
			// console.log (company)
			if (!company) {
			company = ""
			}

		frappe.call({
			method: "sampat_industries.sampat_industries.doctype.mark_daily_attendance.mark_daily_attendance.get_employees_checkin",
			args: {date: frm.doc.date, company: company}
		}).done((r) => {
				frm.doc.daily_attendance_child = [];
				// console.log(r)
			$.each(r.message, function(_i,e) {
				let entry = frm.add_child("daily_attendance_child");
				// console.log(e.LOG_IN)
				entry.employee = e.name;
				entry.employee_name = e.employee_name;
				entry.in_time = e.LOG_IN
				entry.out_time = e.LOG_OUT
				entry.login_checkinid = e.login_checkinid
				entry.logout_checkinid = e.logout_checkinid
				entry.attendance_id = e.attendance_id

				if (e.attendance == "Present") {
					// entry.absent = "0"
				} else if (e.attendance == "Absent") {
					entry.absent = "1"
				} else if (e.attendance == "On Leave") {
					entry.absent = "1"
					entry.approved = "1"
				} else {
					// console.log("Do Nothing")
				}
			})
			refresh_field("daily_attendance_child");
			})
		},


		validate: function(frm) {
			let data = frm.doc.daily_attendance_child;
		
			function updateEmployeeCheckin(employee, time, loginType, checkinid, date) {
				frappe.call({
					method: "sampat_industries.sampat_industries.doctype.mark_daily_attendance.mark_daily_attendance.update_to_employee_checkin",
					args: { employee, time, login_type: loginType, checkinid, date }
				}).done(() => {
					refresh_field("daily_attendance_child");
				});
			}
		
			function addEmployeeCheckin(employee, time, loginType, checkinid, date) {
				frappe.call({
					method: "sampat_industries.sampat_industries.doctype.mark_daily_attendance.mark_daily_attendance.add_to_employee_checkin",
					args: { employee, time, login_type: loginType, checkinid, date }
				}).done(() => {
					refresh_field("daily_attendance_child");
				});
			}
		
			data.forEach(e => {
				if (e.in_time) {
					const time = Date.parse(frm.doc.date + "T" + e.in_time);
		
					if (e.login_checkinid) {
						updateEmployeeCheckin(e.employee, e.in_time, "IN", e.login_checkinid, frm.doc.date);
					} else {
						addEmployeeCheckin(e.employee, e.in_time, "IN", e.login_checkinid, frm.doc.date);
					}
				}
		
				if (e.out_time) {
					const time = Date.parse(frm.doc.date + "T" + e.out_time);
		
					if (e.logout_checkinid) {
						updateEmployeeCheckin(e.employee, e.out_time, "OUT", e.logout_checkinid, frm.doc.date);
					} else {
						addEmployeeCheckin(e.employee, e.out_time, "OUT", e.logout_checkinid, frm.doc.date);
					}
				}
		

				// Define a function to mark attendance
				function markAttendance(employee, date, company, status, leaveType = null) {
					frappe.call({
						method: "sampat_industries.sampat_industries.doctype.mark_daily_attendance.mark_daily_attendance.add_to_attendance",
						args: { employee, date, company, status, leave_type: leaveType },
					}).done((r) => {
						// Handle the response if needed
					});
				}

				// Check conditions and mark attendance
				if (e.attendance_id == null && e.in_time !== null) {
						// Mark Present	
					markAttendance(e.employee, frm.doc.date, frm.doc.company, "Present");

					} else if (e.absent === "1" && e.approved === "0") {
						// Mark Absent
						markAttendance(e.employee, frm.doc.date, frm.doc.company, "Absent");
					} else if (e.absent === "1" && e.approved === "1") {
						// Mark On Leave
						markAttendance(e.employee, frm.doc.date, frm.doc.company, "On Leave", "Casual Leave");
					} else {
						// Do Nothing
					}
				
			});

		},


		onload: (frm) => {
			let dailyAttendanceChild = frm.doc.daily_attendance_child;
			dailyAttendanceChild.forEach((row) => {
				console.log({row})
				row.total_hrs = updateTotalHrs(row.in_time, row.out_time)
				console.log(row.total_hrs)
			})
			// frm.refresh_field('total_hrs');
		},


		after_save: function (frm) {
			frappe.call({
				method: "sampat_industries.sampat_industries.doctype.mark_daily_attendance.mark_daily_attendance.get_employees_checkin",
				args: {date: frm.doc.date, company: frm.doc.company}
			}).done((r) => {
					frm.doc.daily_attendance_child = [];
					// console.log(r)
				$.each(r.message, function(_i,e) {
					let entry = frm.add_child("daily_attendance_child");
					entry.employee = e.name;
					entry.employee_name = e.employee_name;
					entry.in_time = e.LOG_IN
					entry.out_time = e.LOG_OUT
					entry.login_checkinid = e.login_checkinid
					entry.logout_checkinid = e.logout_checkinid
					entry.attendance_id = e.attendance_id

					if (e.attendance == "Present") {
						// entry.absent = "0"
					} else if (e.attendance == "Absent") {
						entry.absent = "1"
					} else if (e.attendance == "On Leave") {
						entry.absent = "1"
						entry.approved = "1"
					} else {
						console.log("Do Nothing")
					}
				})
				refresh_field("daily_attendance_child");
				})
		}

});

frappe.ui.form.on('Daily Attendance Child', {
    in_time: function (frm, cdt, cdn) {
        calculateTotalHrs(frm, cdt, cdn);
    },
    out_time: function (frm, cdt, cdn) {
        calculateTotalHrs(frm, cdt, cdn);
    },
});

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



