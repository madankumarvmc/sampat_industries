// Copyright (c) 2023, Niraj and contributors
// For license information, please see license.txt

frappe.ui.form.on('Daily Attendance', {

	// refresh: function(frm) {
	// 	// get_all_employees();
	// 	},
	
	company: function(frm) {
			frappe.call({
				method: "sampat_industries.sampat_industries.doctype.daily_attendance.daily_attendance.get_employees_checkin",
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
			// frm.set_value('company', null);
			// console.log(frm.doc)

			frappe.call({
				method: "sampat_industries.sampat_industries.doctype.daily_attendance.daily_attendance.get_employees_checkin",
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
				})
				refresh_field("daily_attendance_child");
				})


		},

	date : function (frm) {
		frappe.call({
			method: "sampat_industries.sampat_industries.doctype.daily_attendance.daily_attendance.get_employees_checkin",
			args: {date: frm.doc.date, company: frm.doc.company}
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
			})
			refresh_field("daily_attendance_child");
			})
		},


		validate: function(frm) {
			let data = frm.doc.daily_attendance_child;
			$.each(data, function(_i, e) {
				console.log(e)
				if (e.in_time) {
					if (e.login_checkinid) {
						// console.log("if running !!!!!!!")

						var dateObj = new Date(frm.doc.date);


						let time = Date.parse(frm.doc.date + "T" + e.in_time);
						let time1 = new Date(frm.doc.date + " " + e.in_time);
						console.log(time1)
						
						let employee = e.employee
    
						frappe.call({
							method: "sampat_industries.sampat_industries.doctype.daily_attendance.daily_attendance.update_to_employee_checkin",
							args: {employee: employee, time: e.in_time, login_type: "IN", checkinid: e.login_checkinid, date: frm.doc.date }
						}).done((r) => {
								
							})
							refresh_field("daily_attendance_child");
					} else {
						console.log("else running !!!!!!!")
						let time1 = new Date(frm.doc.date + " " + e.in_time);

						let time = Date.parse(frm.doc.date + "T" + e.in_time);
						console.log(time1);
						frappe.call({
							method: "sampat_industries.sampat_industries.doctype.daily_attendance.daily_attendance.add_to_employee_checkin",
							args: {employee: e.employee, time: e.in_time, login_type: "IN", checkinid: e.login_checkinid, date: frm.doc.date }
						}).done((r) => {
								
							})
							refresh_field("daily_attendance_child");
					}
				}
		
				if (e.out_time) {
					if (e.logout_checkinid) {
						frappe.call({
							method: "sampat_industries.sampat_industries.doctype.daily_attendance.daily_attendance.update_to_employee_checkin",
							args: {employee: employee, time: e.out_time_time, login_type: "OUT", checkinid: e.logout_checkinid, date: frm.doc.date }
						}).done((r) => {
								
							})
							refresh_field("daily_attendance_child");
					} 
					else {
						console.log("else running !!!!!!!")
						let time = Date.parse(frm.doc.date + "T" + e.in_time);
						console.log(time);
						frappe.call({
							method: "sampat_industries.sampat_industries.doctype.daily_attendance.daily_attendance.add_to_employee_checkin",
							args: {employee: e.employee, time: e.out_time, login_type: "OUT", checkinid: e.logout_checkinid, date: frm.doc.date }
						}).done((r) => {
								
							})
							refresh_field("daily_attendance_child");
					}
				}

				
			});

		},

		after_save: function (frm) {
			frappe.call({
				method: "sampat_industries.sampat_industries.doctype.daily_attendance.daily_attendance.get_employees_checkin",
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
				})
				refresh_field("daily_attendance_child");
				})
		}

});




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



