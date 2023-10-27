// Copyright (c) 2023, Niraj and contributors
// For license information, please see license.txt

frappe.ui.form.on("Generate Salaries", {
  end_date: async function (frm) {
    if (frm.doc.employee_salary_sheet == undefined) {
      await getAllEmployees(frm);
    } else {
      frappe.msgprint(
        __(
          "Salary Sheet already created. Refresh Page, if not saved or Create a New Sheet, If already Saved"
        )
      );
    }
  },
});

async function getAllEmployees(frm) {
  let start_date = frm.doc.start_date;
  let end_date = frm.doc.end_date;

  // CALCULATE TOTAL SALARY DAYS
  let date1 = new Date(frm.doc.start_date);
  let date2 = new Date(frm.doc.end_date);

  var time_difference = date2.getTime() - date1.getTime();
  //calculate days difference by dividing total milliseconds in a day
  var days_difference = time_difference / (1000 * 60 * 60 * 24);
  let total_salary_days = days_difference + 1;

  // Initialize Employee Salary Array
  let employeeSalaryArray = [];

  let regular_day_work_hours = 0;
  let fixed_employee_deficit_hours = 0;
  let holiday_work_hours = 0;

  let present_days = 0;
  let present_on_holiday = 0;
  let absent_days = 0;
  let leave_days = 0;

  let holiday_days = 0;
  holiday_days = await getHolidayDetails(start_date, end_date);

  frm.set_value("working_days", total_salary_days);
  frm.set_value("holidays", holiday_days);

  frappe
    .call({
      method:
        "sampat_industries.sampat_industries.doctype.generate_salaries.generate_salaries.get_working_hours",
      args: { start_date, end_date },
    })
    .done((r) => {
      console.log(r);

      // Create temporary employee
      let temp_employee = r.message[0].employee;
      let temp_employee_type = r.message[0].employee_type;

      let monthly_basic_salary = r.message[0].monthly_basic_pay;

      let per_day_salary = monthly_basic_salary / total_salary_days;

      let regular_day_per_hour_pay =
        per_day_salary / r.message[0].regular_duty_hours;

      let holiday_per_hour_pay =
        per_day_salary / r.message[0].holiday_duty_hours;

      for (const e of r.message) {
        // Select Employee to calculate salary
        if (temp_employee != e.employee) {
          console.log(
            "employee " +
              temp_employee +
              "\ntemp_employee_type " +
              temp_employee_type +
              "\n Regular Day Work Hours  " +
              regular_day_work_hours +
              "\n Fixed Employee Deficit Hours" +
              fixed_employee_deficit_hours +
              "\n Holiday Work Hours  " +
              holiday_work_hours +
              "\n Holiday Days  " +
              holiday_days +
              "\n Present Days  " +
              present_days +
              "\n Absent Days  " +
              absent_days +
              "\n Leave Days  " +
              leave_days +
              "\n Present On Holidays " +
              present_on_holiday +
              "\n Payment Days(Fixed Salary)" +
              (present_days - present_on_holiday + holiday_days) +
              "\n Total Salary Days  " +
              total_salary_days +
              "\n Per Day Salary " +
              per_day_salary +
              "\n Regular Day Per Hour Salary " +
              regular_day_per_hour_pay +
              "\n Holiday Per Hour Salary " +
              holiday_per_hour_pay
          );

          // Salary Calculation

          let regular_day_month_salary = 0;
          let holiday_work_salary = 0;
          let holiday_salary = 0;

          let fixed_salary_payment_days =
            present_days - present_on_holiday + holiday_days;

          // Salary Calculations For Hourly Paid Employee

          if (temp_employee_type == "Hourly Salary") {
            holiday_salary = holiday_days * per_day_salary;

            regular_day_month_salary =
              regular_day_work_hours * regular_day_per_hour_pay;

            holiday_work_salary = holiday_work_hours * holiday_per_hour_pay;
          }

          if (temp_employee_type == "Fixed Salary") {
            let deficit_hours_amount =
              fixed_employee_deficit_hours * regular_day_per_hour_pay;

            regular_day_month_salary =
              fixed_salary_payment_days * per_day_salary - deficit_hours_amount;
          }

          console.log("\n Regular Day Salary  " + regular_day_month_salary);
          console.log("\n Holiday Work Day Salary  " + holiday_work_salary);
          console.log("\n Holiday Salary  " + holiday_salary);

          let gross_salary =
            regular_day_month_salary + holiday_work_salary + holiday_salary;

          console.log("Gross Salary " + gross_salary);

          // Calculate Deductions

          // ESI Deduction
          let esi_deduction = monthly_basic_salary * 0.0075;

          // Absent Penalty Deduction
          let absent_penalty_deduction = absent_days * per_day_salary;

          // Total Deductions
          let total_deductions = esi_deduction + absent_penalty_deduction;

          // Net Salary Calculation
          let net_salary = gross_salary - total_deductions;

          //Create Entry In the Child Table

          let entry = frm.add_child("employee_salary_sheet");

          entry.employee = temp_employee;
          entry.gross_salary = gross_salary.toFixed(2);
          entry.total_deductions = total_deductions.toFixed(2);
          entry.net_salary = net_salary.toFixed(2);

          // Change temp_employee
          temp_employee = e.employee;
          temp_employee_type = e.employee_type;

          // change per_day_salary , regular_day_per_hour_pay, monthly_basic_salary
          per_day_salary = e.monthly_basic_pay / total_salary_days;

          if (per_day_salary && e.regular_duty_hours) {
            regular_day_per_hour_pay = per_day_salary / e.regular_duty_hours;
          } else {
            regular_day_per_hour_pay = 0;
          }

          if (per_day_salary && e.holiday_duty_hours) {
            holiday_per_hour_pay = per_day_salary / e.holiday_duty_hours;
          } else {
            holiday_per_hour_pay = 0;
          }

          monthly_basic_salary = e.monthly_basic_pay;

          // zero the variables value
          regular_day_work_hours = 0;
          fixed_employee_deficit_hours = 0;
          holiday_work_hours = 0;

          present_days = 0;
          present_on_holiday = 0;
          absent_days = 0;
          leave_days = 0;
        }

        // Regular Day Calculations
        if (e.holiday_status == null) {
          // Calculate total working hours for the employee
          let inTime = moment.duration(e.in_time);
          let outTime = moment.duration(e.out_time);
          let totalWorkingHours = outTime.subtract(inTime);

          // Convert totalWorkingHours to numeric hours
          let totalHrs =
            totalWorkingHours.hours() + totalWorkingHours.minutes() / 60;

          // Accumulate the working hours
          regular_day_work_hours += totalHrs;

          // Accumulate deficit hours
          if (totalHrs < e.regular_duty_hours) {
            fixed_employee_deficit_hours += e.regular_duty_hours - totalHrs;
          }
        }

        // Holidays Calculations
        if (e.holiday_status == "holidays") {
          // Calculate total working hours for the employee
          let inTime = moment.duration(e.in_time);
          let outTime = moment.duration(e.out_time);
          let totalWorkingHours = outTime.subtract(inTime);

          // Convert totalWorkingHours to numeric hours
          let totalHrs =
            totalWorkingHours.hours() + totalWorkingHours.minutes() / 60;

          // Accumulate the working hours
          holiday_work_hours += totalHrs;

          // Calculate number of present on holidays
          if (e.attendance_status == "Present") {
            present_on_holiday += 1;
          }
        }
        if (e.attendance_status == "Present") {
          present_days += 1;
        }
        if (e.attendance_status == "Absent") {
          absent_days += 1;
        }
        if (e.attendance_status == "On Leave") {
          leave_days += 1;
        }
      }
      refresh_field("employee_salary_sheet");
    });
}

async function getHolidayDetails(start_date, end_date) {
  return new Promise((resolve, reject) => {
    let number_of_holidays = 0;

    frappe
      .call({
        method:
          "sampat_industries.sampat_industries.doctype.generate_salaries.generate_salaries.get_holidays",
        args: { start_date, end_date },
      })
      .done((r) => {
        $.each(r.message, function (_i, e) {
          number_of_holidays += 1;
        });
        resolve(number_of_holidays);
      });
  });
}

frappe.ui.form.on("Employee Salary Sheet", {
  gross_salary: function (frm, cdt, cdn) {
    calculateNetSalary(frm, cdt, cdn);
  },

  total_deductions: function (frm, cdt, cdn) {
    calculateNetSalary(frm, cdt, cdn);
  },

  advance_deductions: function (frm, cdt, cdn) {
    calculateNetSalary(frm, cdt, cdn);
  },
});

function calculateNetSalary(frm, cdt, cdn) {
  const child = locals[cdt][cdn];
  const grossSalary = child.gross_salary;
  const totalDeductions = child.total_deductions;
  const advance_deductions = child.advance_deductions;
  let netSalary = 0;

  console.log("Working!!!!!!");

  if (grossSalary && totalDeductions) {
    if (advance_deductions) {
      netSalary = grossSalary - totalDeductions - advance_deductions;
    } else {
      netSalary = grossSalary - totalDeductions;
    }

    frappe.model.set_value(cdt, cdn, "net_salary", netSalary);
    frm.refresh_field("net_salary");
  }
}
