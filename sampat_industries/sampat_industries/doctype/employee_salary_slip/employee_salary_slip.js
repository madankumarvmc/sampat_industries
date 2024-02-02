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

  frappe
    .call({
      method:
        "sampat_industries.sampat_industries.doctype.employee_salary_slip.employee_salary_slip.get_working_hours",
      args: { start_date, end_date },
    })
    .done(async (r) => {
      console.log(r);
      for (const e of r.message) {
        let entry = frm.add_child("employee_attendance_table");

        entry.employee = e.employee;
        entry.employee_name = e.employee_name;
        entry.date = e.monthDate;
        entry.in_time = e.in_time;
        entry.out_time = e.out_time;

        // Get Weekday
        let weekdayName = await getWeekday(e.monthDate);
        entry.weekday = weekdayName;

        // printing work hours
        let totalHrs = await calculateDailyWorkHours(e.in_time, e.out_time);
        entry.work_hours = totalHrs.toFixed(1);

        // printing pay Hours (i.e work hour - lunch hours)
        let payHrs = await calculateDailyPayHours(e.in_time, e.out_time);
        entry.pay_hours = payHrs.toFixed(1);

        // Printing Daily Pay
        let dailyPay = await dailyPayment(
          e.employee_type,
          e.monthly_basic_pay,
          total_salary_days,
          e.regular_duty_hours,
          e.holiday_duty_hours,
          e.holiday_status
        );
        entry.day_pay = dailyPay.toFixed(1);
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

// Calculating daily pay
async function dailyPayment(
  employee_type,
  monthly_basic_pay,
  total_salary_days,
  regular_duty_hours,
  holiday_duty_hours,
  holiday_status
) {
  return new Promise((resolve) => {
    // For Fixed Salaried Employee
    if (employee_type == "Fixed Salary") {
      resolve(dailyPay);
    } else if (employee_type == "Hourly Salary") {
      let dailyPay = 0;

      resolve(dailyPay);
    } else if (employee_type == "Production Salary") {
      // production salary.......
    } else {
      frappe.msgprint(__("Employee Type is not defined"));
    }
  });
}
