frappe.ui.form.on('Salary Slip', {

    end_date: function(frm) {
        //   frm.add_custom_button(__('Generate Work Hours'), function(){
            // totalWorkHours(frm)
            // totalWorkDays(frm)
            getEmployeeSalaryDetails(frm)
            

            
        // });
      },

    refresh: function(frm) {
        frm.add_custom_button(__('Get Salary'), function(){
            if (frm.doc.employee_type == "Fixed Salary"){
                addFixedSalriedEmployeePay(frm)
            }
            console.log(frm.doc.employee_type)
            if (frm.doc.employee_type == "Hourly Salary"){
                addHourlySalriedEmployeePay(frm)
            }
            
            
        })
    }
})



function totalWorkHours(frm, daily_duty_hours){
    const employee = frm.doc.employee
    const start_date = frm.doc.start_date
    const end_date = frm.doc.end_date
    console.log(daily_duty_hours)
    frappe.call({
        method: "sampat_industries.public.js.doctype_plugin.salary_slip.salary_slip.get_daily_working_hours",
        args: {employee, start_date , end_date },
        callback: (r) => {
            let total_work_seconds = 0
            let regular_work_seconds = 0
            let holiday_work_seconds = 0
            let holiday_work_days = 0
            let regular_work_days = 0
            let total_holiday_days = 0
            let regular_ot_hours = 0
            let penalty_days = 0
            console.log(r.message)
            for (let i = 0; i < r.message.length; i++) {
                if (r.message[i].parentfield == 'holidays'){
                    holiday_work_days += 1
                    let hms = r.message[i].WORK_HOURS;
                    let a = hms.split(':'); 
                    let seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]); 
                    holiday_work_seconds += seconds
                } else {
                    regular_work_days += 1
                    let hms = r.message[i].WORK_HOURS;
                    let a = hms.split(':'); 
                    let seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]); 
                    regular_work_seconds += seconds
                }
            }
            
            let regular_work_hrs = regular_work_seconds/(3600);
            let holiday_work_hrs = holiday_work_seconds/(3600);
            let total_work_hrs = regular_work_hrs + holiday_work_hrs;
            frm.set_value('total_work_hours', total_work_hrs);
            frm.refresh_field('total_work_hours');
            frm.set_value('regular_work_hours', regular_work_hrs);
            frm.refresh_field('regular_work_hours');
            frm.set_value('holiday_work_hours', holiday_work_hrs);
            frm.refresh_field('holiday_work_hours');
            
            // calculate penalty days
            penalty_days = frm.doc.absent_days
            
            frm.set_value('penalty_days', penalty_days);
            frm.refresh_field('penalty_days');

            // Calculate regular work days and holiday days
            frm.set_value('regular_work_days', regular_work_days);
            frm.refresh_field('regular_work_days');

            total_holiday_days = frm.doc.total_working_days - (regular_work_days + frm.doc.absent_days + frm.doc.leave_without_pay)
            
            frm.set_value('holiday_days', total_holiday_days);
            frm.refresh_field('holiday_days');
            
            

            // calculate ot hours

            console.log(regular_work_hrs ,regular_work_days , daily_duty_hours)
            regular_ot_hours = regular_work_hrs - (regular_work_days * daily_duty_hours)
            frm.set_value('regular_ot_hours', regular_ot_hours);
            frm.refresh_field('regular_ot_hours');

            frm.set_value('holidays_ot_hours', holiday_work_hrs);
            frm.refresh_field('holidays_ot_hours');
        },
    })
}

// function totalWorkDays(frm){
//     const employee = frm.doc.employee
//     const start_date = frm.doc.start_date
//     const end_date = frm.doc.end_date
//     frappe.call({
//         method: "sampat_industries.public.js.doctype_plugin.salary_slip.salary_slip.get_total_working_days",
//         args:{employee, start_date , end_date},
//         callback: (r) => {
//             let countAbsent = 0
            
//             for (let i = 0; i < r.message.length; i++){
//                 // console.log(r.message[i].status)
//                 if(r.message[i].status == "Absent"){
//                     countAbsent += 1
//                 }
//                 frm.refresh_fields()
//             }
//             let extraAbsentDays = countAbsent
//             // let x = 
//             // let newPaymentDays =  frm.doc.payment_days - extraAbsentDays

//             // frm.set_value('payment_days', newPaymentDays)
//             frm.set_value('penalty_days', extraAbsentDays)

//             // let grossPay = frm.doc.earnings[0].amount


//             // frm.set_value('gross_pay', grossPay)
            
//         }
//     })
// }

function getEmployeeSalaryDetails(frm){
    const employee = frm.doc.employee
    frappe.call({
        method: "sampat_industries.public.js.doctype_plugin.salary_slip.salary_slip.get_employee_salary_details",
        args: {employee},
        callback: (r) => {
            const daily_duty_hours = r.message[0].regular_duty_hours;
            // Call totalWorkHours function and pass daily_duty_hours as a parameter
            totalWorkHours(frm, daily_duty_hours);

            frm.set_value('monthly_basic_pay', r.message[0].monthly_basic_pay);
            frm.set_value('daily_duty_hours', r.message[0].regular_duty_hours);
            frm.set_value('holiday_duty_hours', r.message[0].holiday_duty_hrs);
            frm.set_value('pf_salary', r.message[0].pf_salary);
            frm.set_value('employee_type', r.message[0].employee_type);
        }
    })
}


function addFixedSalriedEmployeePay(frm) {
    let gross_monthly_salary = (frm.doc.monthly_basic_pay / frm.doc.total_working_days) * (frm.doc.payment_days);

    let pf_deduction_amount = 0;
    let penalty_deduction_amount = 0;
    let deductionAmount = 0;

    if (frm.doc.earnings[0] == undefined) {
        let e_row1 = frm.add_child('earnings', {
            salary_component: 'Gross Monthly Salary',
            amount: gross_monthly_salary
        });
        frm.refresh_field('earnings');

        pf_deduction_amount = frm.doc.pf_salary * 0.0075;

        let d_row1 = frm.add_child('deductions', {
            salary_component: 'Provident Fund',
            amount: pf_deduction_amount
        });

        penalty_deduction_amount = (frm.doc.monthly_basic_pay / frm.doc.total_working_days) * (frm.doc.penalty_days);

        let d_row2 = frm.add_child('deductions', {
            salary_component: 'Holiday Penalty',
            amount: penalty_deduction_amount
        });
        frm.refresh_field('deductions');
    }

    deductionAmount = pf_deduction_amount + penalty_deduction_amount;

    console.log(gross_monthly_salary);
    if(frm.doc.gross_salary == 0){
        frm.set_value('gross_salary', gross_monthly_salary);
    }
    if(frm.doc.deduction_amount == 0){
        frm.set_value('deduction_amount', deductionAmount);
    }
    if(frm.doc.total_net_pay == 0){
        frm.set_value('total_net_pay', grossSalary - deductionAmount);
    }
    
}


function addHourlySalriedEmployeePay(frm){

    let grossSalary = 0
    let overtime_pay = 0

    let gross_monthly_salary = (frm.doc.monthly_basic_pay / frm.doc.total_working_days) * frm.doc.payment_days;

    let regular_overtime_pay = ((frm.doc.monthly_basic_pay / frm.doc.total_working_days)/frm.doc.daily_duty_hours) * frm.doc.regular_ot_hours;

    let holiday_overtime_pay = ((frm.doc.monthly_basic_pay / frm.doc.total_working_days)/frm.doc.holiday_duty_hours) * frm.doc.holidays_ot_hours;
    console.log(holiday_overtime_pay)


    overtime_pay = regular_overtime_pay + holiday_overtime_pay

    let pf_deduction_amount = 0;
    let penalty_deduction_amount = 0;
    let deductionAmount = 0;

    if (frm.doc.earnings[0] == undefined) {
        let e_row1 = frm.add_child('earnings', {
            salary_component: 'Gross Monthly Salary',
            amount: gross_monthly_salary
        });
        let e_row2 = frm.add_child('earnings', {
            salary_component: 'Overtime Pay',
            amount: overtime_pay
        });
        frm.refresh_field('earnings');

        pf_deduction_amount = frm.doc.pf_salary * 0.0075;

        let d_row1 = frm.add_child('deductions', {
            salary_component: 'Provident Fund',
            amount: pf_deduction_amount
        });
        frm.refresh_field('deductions');
    }


    grossSalary = gross_monthly_salary + overtime_pay
    deductionAmount = pf_deduction_amount + penalty_deduction_amount;

    console.log(gross_monthly_salary);
    if(frm.doc.gross_salary == 0){
        frm.set_value('gross_salary', grossSalary);
    }
    if(frm.doc.deduction_amount == 0){
        frm.set_value('deduction_amount', deductionAmount);
    }
    if(frm.doc.total_net_pay == 0){
        frm.set_value('total_net_pay', grossSalary - deductionAmount);
    }
}



