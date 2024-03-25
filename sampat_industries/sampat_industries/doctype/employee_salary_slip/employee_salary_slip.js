// Copyright (c) 2023, Niraj and contributors
// For license information, please see license.txt

frappe.ui.form.on("Employee Salary Slip", {
  end_date: async function (frm) {
    console.log("running!!!!!!!");
    await generateAttendanceReport(frm);
  },
});

async function generateAttendanceReport(frm) {
  let start_date = frm.doc.start_date;
  let end_date = frm.doc.end_date;

  // CALCULATE TOTAL SALARY DAYS
  let date1 = new Date(frm.doc.start_date);
  let date2 = new Date(frm.doc.end_date);

  var time_difference = date2.getTime() - date1.getTime();
  //calculate days difference by dividing total milliseconds in a day
  var days_difference = time_difference / (1000 * 60 * 60 * 24);
  let total_salary_days = days_difference + 1;

  let gross_pay = 0;
  let present_days = 0;
  let absent_days = 0;
  let leave_days = 0;
  let present_on_holiday = 0;
  let holiday_days = 0;
  let total_ot = 0;

  frappe
    .call({
      method:
        "sampat_industries.sampat_industries.doctype.employee_salary_slip.employee_salary_slip.get_working_hours",
      args: { start_date, end_date },
    })
    .done(async (r) => {
      console.log(r);
      let temp_employee = r.message[0].employee;
      let temp_esi_number = r.message[0].esi_number;
      let temp_pf_number = r.message[0].pf_number;
      let temp_pf_salary = r.message[0].pf_salary;

      let week_leaves = 0;

      for (const e of r.message) {
        // Get Employee Salary Details
        let employee_type = e.employee_type;
        let monthly_basic_pay = e.monthly_basic_pay;
        let regular_duty_hours = e.regular_duty_hours;
        let holiday_duty_hours = e.holiday_duty_hours;
        let holiday_status = e.holiday_status;
        let attendance_status = e.attendance_status;

        let entry = frm.add_child("employee_attendance_table");

        entry.employee = e.employee;
        entry.employee_name = e.employee_name;
        entry.date = e.monthDate;
        entry.in_time = e.in_time;
        entry.out_time = e.out_time;
        entry.holiday_status = e.holiday_status;

        entry.company = e.company;

        entry.pf_number = e.pf_number;
        entry.esi_number = e.esi_number;
        entry.monthly_basic_pay = e.monthly_basic_pay;
        entry.pf_salary = e.pf_salary;
        entry.employee_type = e.employee_type;

        // Get Weekday
        let weekdayName = await getWeekday(e.monthDate);
        entry.weekday = weekdayName;

        // printing work hours
        let totalHrs = await calculateDailyWorkHours(e.in_time, e.out_time);
        entry.work_hours = totalHrs.toFixed(1);

        // printing pay Hours (i.e work hour - lunch hours)
        let payHrs = await calculateDailyPayHours(e.in_time, e.out_time);
        entry.pay_hours = payHrs.toFixed(1);

        // Printing OT Hours
        let otHrs = await calculateOtHours(
          payHrs,
          regular_duty_hours,
          holiday_duty_hours,
          holiday_status
        );
        entry.ot_hours = parseFloat(otHrs.toFixed(1));

        // Printing Daily Pay
        let dailyPay = await dailyPayment(
          employee_type,
          monthly_basic_pay,
          total_salary_days,
          regular_duty_hours,
          holiday_duty_hours,
          holiday_status,
          totalHrs,
          payHrs
        );

        // ********CALCULATIONS********

        if (temp_employee != e.employee) {
          // Allocating new values in temp variables
          temp_employee = e.employee;
          temp_esi_number = e.esi_number;
          temp_pf_number = e.pf_number;
          temp_pf_salary = e.pf_salary;

          // Mark grossPay = 0 when employee changes
          gross_pay = 0;

          // Zeroing Present, Absent, On Leave days
          present_days = 0;
          absent_days = 0;
          leave_days = 0;
          present_on_holiday = 0;
          holiday_days = 0;
          week_leaves = 0;
          total_ot = 0;
          console.log(e.employee, "Employee Change", week_leaves);
        }
        // **********************************************

        // Calculating Present, Absent, On leave
        if (e.attendance_status == "Present") {
          present_days += 1;
        }
        if (e.attendance_status == "Absent") {
          absent_days += 1;
        }
        if (e.attendance_status == "On Leave") {
          leave_days += 1;
        }
        if (
          e.attendance_status == "Present" &&
          e.holiday_status == "holidays"
        ) {
          present_on_holiday += 1;
        }
        if (e.holiday_status == "holidays") {
          holiday_days += 1;
        }

        // ********MANAGING ABSENTISM IN THE WEEK***********

        // Calculate if(absent > 3 days) in a week. If YES, No sunday payment.
        if (
          weekdayName != "Sunday" &&
          (attendance_status == "On Leave" || attendance_status == null)
        ) {
          week_leaves += 1;
        }

        let dayPay = dailyPay;
        if (weekdayName == "Sunday") {
          if (week_leaves >= 3) {
            if (
              employee_type != "Weekly Visit Pay" &&
              employee_type != "Daily Basis"
            ) {
              let perDaySalary = monthly_basic_pay / total_salary_days;
              dayPay = dayPay - perDaySalary;
            }
          }
          week_leaves = 0;
        }
        entry.day_pay = parseFloat(dayPay.toFixed(1));

        // *********MANAGING GROSS PAY AND OT*************

        gross_pay = parseFloat(gross_pay) + parseFloat(dayPay.toFixed(2));

        // MANAGING ALL DAYS ABSENT EMPLOYEE PAY SLIP(PUT GROSS PAY = 0)
        let month_date = new Date(e.monthDate);
        if (month_date.getDate() + 1 == date2.getDate()) {
          if (present_days == 0) {
            gross_pay = 0;
          }
        }

        entry.gross_pay = parseFloat(Math.round(gross_pay));

        total_ot = parseFloat(total_ot) + parseFloat(otHrs.toFixed(1));
        entry.total_ot = parseFloat(total_ot.toFixed(1));

        // ESI AND PF DEDUCTIONS**************
        let month_present_days_ratio =
          (present_days - present_on_holiday + holiday_days) /
          total_salary_days;
        let esi_deduction = 0.0;
        let pf_deduction = 0.0;

        let gross_wage = temp_pf_salary * month_present_days_ratio;

        esi_deduction = gross_wage * 0.0075;
        if (esi_deduction == 0) {
          esi_deduction = 0.0;
        }
        if (temp_esi_number != null) {
          entry.esi_deduction = parseFloat(Math.round(esi_deduction));
        } else {
          entry.esi_deduction = 0.0;
        }

        let pf_basic_wage = gross_wage * 0.7;
        pf_deduction = pf_basic_wage * 0.12;
        if (pf_deduction == 0) {
          pf_deduction = 0.0;
        }
        if (temp_pf_number != null) {
          entry.pf_deduction = parseFloat(Math.round(pf_deduction));
        } else {
          entry.pf_deduction = 0.0;
        }
      }
      refresh_field("employee_attendance_table");
    });
}

async function getWeekday(monthDate) {
  return new Promise((resolve) => {
    let date = new Date(monthDate);
    var dayOfWeek = date.getDay();
    var weekdays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    var weekdayName = weekdays[dayOfWeek];

    resolve(weekdayName);
  });
}

async function calculateDailyWorkHours(in_time, out_time) {
  return new Promise((resolve) => {
    // Calculate total working hours for the employee
    let inTime = moment.duration(in_time);
    let outTime = moment.duration(out_time);
    let totalWorkingHours = outTime.subtract(inTime);

    // Convert totalWorkingHours to numeric hours
    let totalHrs = totalWorkingHours.hours() + totalWorkingHours.minutes() / 60;

    resolve(totalHrs);
  });
}

// Deducting Lunch time if workhour > 5 hours
async function calculateDailyPayHours(in_time, out_time) {
  return new Promise((resolve) => {
    // Calculate total working hours for the employee
    let inTime = moment.duration(in_time);
    let outTime = moment.duration(out_time);
    let totalWorkingHours = outTime.subtract(inTime);

    // Convert totalWorkingHours to numeric hours
    let totalHrs = totalWorkingHours.hours() + totalWorkingHours.minutes() / 60;
    let payHrs = 0;

    if (totalHrs > 5) {
      payHrs =
        totalWorkingHours.hours() + (totalWorkingHours.minutes() - 30) / 60;
    } else {
      payHrs = totalHrs;
    }

    resolve(payHrs);
  });
}

// Calculating OT
async function calculateOtHours(
  payHrs,
  regular_duty_hours,
  holiday_duty_hours,
  holiday_status
) {
  return new Promise((resolve) => {
    let otHrs = 0;

    if (holiday_status == "holidays" && payHrs > holiday_duty_hours) {
      otHrs = payHrs - holiday_duty_hours;
    }
    if (holiday_status != "holidays" && payHrs > regular_duty_hours) {
      otHrs = payHrs - regular_duty_hours;
    }
    resolve(otHrs);
  });
}

// Calculating daily pay
async function dailyPayment(
  employee_type,
  monthly_basic_pay,
  total_salary_days,
  regular_duty_hours,
  holiday_duty_hours,
  holiday_status,
  totalHrs,
  payHrs
) {
  return new Promise((resolve) => {
    // For Fixed Salaried Employee
    if (employee_type == "Fixed Salary") {
      let perDaySalary = monthly_basic_pay / total_salary_days;
      if (holiday_status == "holidays") {
        let dailyPay = perDaySalary;
        resolve(dailyPay);
      } else if (holiday_status == null && payHrs >= regular_duty_hours) {
        let dailyPay = perDaySalary;
        resolve(dailyPay);
      } else {
        let dailyPay = (perDaySalary / regular_duty_hours) * payHrs;
        resolve(dailyPay);
      }
    }
    // For Hourly Paid Employee
    else if (employee_type == "Hourly Salary") {
      let perDaySalary = monthly_basic_pay / total_salary_days;
      let hourlySalary = 0;
      if (regular_duty_hours != 0) {
        hourlySalary = perDaySalary / regular_duty_hours;
      }
      if (holiday_status == "holidays" && payHrs >= holiday_duty_hours) {
        let holiday_ot = payHrs - holiday_duty_hours;
        let dailyPay = perDaySalary + perDaySalary + holiday_ot * hourlySalary;
        resolve(dailyPay);
      } else if (holiday_status == "holidays" && payHrs < holiday_duty_hours) {
        let dailyPay = perDaySalary + payHrs * hourlySalary;
        resolve(dailyPay);
      } else {
        let dailyPay = payHrs * hourlySalary;
        resolve(dailyPay);
      }
    }

    // For Daily Basis Hourly Paid Employee
    else if (employee_type == "Daily Basis") {
      let perDaySalary = monthly_basic_pay / total_salary_days;
      let hourlySalary = 0;
      if (regular_duty_hours != 0) {
        hourlySalary = perDaySalary / regular_duty_hours;
      }
      let dailyPay = payHrs * hourlySalary;
      resolve(dailyPay);
    }

    // For One Weekly(6hrs) Visit Employee
    else if (employee_type == "Weekly Visit Pay") {
      let perDaySalary = monthly_basic_pay / total_salary_days;
      let hourlySalary = 0;
      if (regular_duty_hours != 0) {
        hourlySalary = perDaySalary / regular_duty_hours;
      }
      if (payHrs < 6) {
        let dailyPay = payHrs * hourlySalary;
        resolve(dailyPay);
      } else {
        let dailyPay = 6 * hourlySalary;
        resolve(dailyPay);
      }
    }
    // Else..No condition satisfied
    else {
      let dailyPay = 0;
      resolve(dailyPay);
    }
    // } else if (employee_type == "Production Salary") {
    //   // production salary.......
  });
}

// frappe.ui.form.on("Employee Salary Slip", {
//   end_date: function (frm) {
//     let start_date = frm.doc.start_date;
//     let end_date = frm.doc.end_date;

//     frappe
//       .call({
//         method:
//           "sampat_industries.sampat_industries.doctype.employee_salary_slip.employee_salary_slip.get_previous_month_attendance_details",
//         args: { start_date, end_date },
//       })
//       .done(async (r) => {
//         console.log(r);
//         let weekdayName = await getWeekday(r.message[0]);
//         console.log(weekdayName);
//       });
//   },
// });
