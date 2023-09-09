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


					// // Example in time and out time in 24-hour format (HH:mm)
					// const inTime = e.LOG_IN;
					// const outTime = e.LOG_OUT;

					// // Split the time strings into hours and minutes
					// const inTimeParts = inTime.split(":");
					// const outTimeParts = outTime.split(":");

					// // Create Date objects for in time and out time
					// const inDateTime = new Date();
					// inDateTime.setHours(parseInt(inTimeParts[0], 10));
					// inDateTime.setMinutes(parseInt(inTimeParts[1], 10));

					// const outDateTime = new Date();
					// outDateTime.setHours(parseInt(outTimeParts[0], 10));
					// outDateTime.setMinutes(parseInt(outTimeParts[1], 10));

					// // Calculate the time difference in milliseconds
					// const timeDifferenceMs = outDateTime - inDateTime;

					// // Convert the time difference to hours and minutes
					// const hours = Math.floor(timeDifferenceMs / (1000 * 60 * 60));
					// const minutes = Math.round((timeDifferenceMs % (1000 * 60 * 60)) / (1000 * 60));

					// console.log(`Total working hours: ${hours} hours ${minutes} minutes`);


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
			$.each(data, function(_i, e) {
				
				if (e.in_time) {
					if (e.login_checkinid) {
						// console.log("if running !!!!!!!")

						var dateObj = new Date(frm.doc.date);


						let time = Date.parse(frm.doc.date + "T" + e.in_time);
						let time1 = new Date(frm.doc.date + " " + e.in_time);
						// console.log(time1)
						    
						frappe.call({
							method: "sampat_industries.sampat_industries.doctype.mark_daily_attendance.mark_daily_attendance.update_to_employee_checkin",
							args: {employee: e.employee, time: e.in_time, login_type: "IN", checkinid: e.login_checkinid, date: frm.doc.date }
						}).done((r) => {
								
							})
							refresh_field("daily_attendance_child");
					} else {
						// console.log("else running !!!!!!!")
						let time1 = new Date(frm.doc.date + " " + e.in_time);

						let time = Date.parse(frm.doc.date + "T" + e.in_time);
						// console.log(time1);
						frappe.call({
							method: "sampat_industries.sampat_industries.doctype.mark_daily_attendance.mark_daily_attendance.add_to_employee_checkin",
							args: {employee: e.employee, time: e.in_time, login_type: "IN", checkinid: e.login_checkinid, date: frm.doc.date }
						}).done((r) => {
								
							})
							refresh_field("daily_attendance_child");
					}
				}
		
				if (e.out_time) {
					if (e.logout_checkinid) {
						frappe.call({
							method: "sampat_industries.sampat_industries.doctype.mark_daily_attendance.mark_daily_attendance.update_to_employee_checkin",
							args: {employee: e.employee, time: e.out_time, login_type: "OUT", checkinid: e.logout_checkinid, date: frm.doc.date }
						}).done((r) => {
								
							})
							refresh_field("daily_attendance_child");
					} 
					else {
						// console.log("else running !!!!!!!")
						let time = Date.parse(frm.doc.date + "T" + e.in_time);
						// console.log(time);
						frappe.call({
							method: "sampat_industries.sampat_industries.doctype.mark_daily_attendance.mark_daily_attendance.add_to_employee_checkin",
							args: {employee: e.employee, time: e.out_time, login_type: "OUT", checkinid: e.logout_checkinid, date: frm.doc.date }
						}).done((r) => {
								
							})
							refresh_field("daily_attendance_child");
					}
				}


				// console.log(e.attendance_id)

				// console.log(e.absent)
				if (e.in_time !== null && e.attendance_id == null ) {
					// console.log("Mark Present")
					// Mark Present in Attendance Doctype
					frappe.call({
						method: "sampat_industries.sampat_industries.doctype.mark_daily_attendance.mark_daily_attendance.add_to_attendance",
						args: {employee: e.employee, date: frm.doc.date, company: frm.doc.company, status: "Present", leave_type: "Casual Leave" }
					}).done((r) => {
							
						})
				} else if(e.in_time == null && e.absent == "1" && e.approved == "0" && e.attendance_id == null) {
					// Mark Absent
					// console.log("Mark Absent")
					frappe.call({
						method: "sampat_industries.sampat_industries.doctype.mark_daily_attendance.mark_daily_attendance.add_to_attendance",
						args: {employee: e.employee, date: frm.doc.date, company: frm.doc.company, status: "Absent", leave_type: "Casual Leave" }
					}).done((r) => {
							
						})

				} else if (e.in_time == null && e.absent == "1" && e.approved == "1" && e.attendance_id == null) {
					// Mark On Leave
					// console.log("Mark On Leave")
					frappe.call({
						method: "sampat_industries.sampat_industries.doctype.mark_daily_attendance.mark_daily_attendance.add_to_attendance",
						args: {employee: e.employee, date: frm.doc.date, company: frm.doc.company, status: "On Leave", leave_type: "Casual Leave" }
					}).done((r) => {
							
						})
				} else {
					// console.log("Do Nothing")
				}

				
			});

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

        frappe.model.set_value('total_hrs', totalHrs);
		console.log("Total Hrs Calculated")
    }
}



// frappe.ui.form.on("Daily Attendance Child", "in_time", function(frm, cdt, cdn){
//     cur_frm.doc.daily_attendance_child.forEach(function(child){
//         var sel = 'div[data-fieldname="daily_attendance_child"] > div.grid-row[data-idx="' + child.idx + '"]';
// 		console.log(sel)
//         if (child.in_time !== '00:00:00'){
//             $(sel).css('background-color', 'lightgreen');
//         } else {
//             $(sel).css('background-color', 'transparent');
//         }
//     });
// });





// frappe.ui.form.on('Daily Attendance Child', {
// 	refresh: function(frm) {
// 		console.log("hello!!!")
// 		// console.log(frm.doc)
// 	//   frm.fields_dict['scrap_items_section'].wrapper.css('background-color', '#FFFFE0');
// 	//   frm.fields_dict['workstation_mapping'].wrapper.css('background-color', '#90EE90');
// 	}
//   });

// frappe.ui.form.on('Daily Attendance Child', {
//     refresh: function(frm, cdt, cdn) {
// 		console.log("hello!!!!")


//         // Get the child table field
//         var child_table = locals[cdt][cdn];

//         // Iterate through the rows in the child table
//         child_table.daily_attendance_child.forEach(function(row) {
//             // Check if the in_time is not "00:00:00"
//             if (row.in_time !== "00:00:00") {
//                 // Add a CSS class to mark the cell as green
//                 frm.fields_dict.daily_attendance_child.grid.get_field('in_time').get_query_status(row).style = 'background-color: #00ff00; color: #fff;';
//             }

//             // Check if the out_time is not "00:00:00"
//             if (row.out_time !== "00:00:00") {
//                 // Add a CSS class to mark the cell as green
//                 frm.fields_dict.daily_attendance_child.grid.get_field('out_time').get_query_status(row).style = 'background-color: #00ff00; color: #fff;';
//             }
//         });
//     }
// });



