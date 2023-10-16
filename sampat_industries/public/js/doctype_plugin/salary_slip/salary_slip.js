frappe.ui.form.on('Salary Slip', {

    end_date: function(frm) {
        //   frm.add_custom_button(__('Generate Work Hours'), function(){
            totalWorkHours(frm)
            totalWorkDays(frm)
            getEmployeeSalaryDetails(frm)

            
        // });
      },
    
    after_save: function(frm) {
        frm.doc.net_pay += frm.doc.gross_salary
        frm.doc.rounded_total += frm.doc.gross_salary
    },


    refresh: function(frm) {
        frm.add_custom_button(__('Get Salary'), function(){
            addToChild(frm)
        })
    }
})



function totalWorkHours(frm){
    const employee = frm.doc.employee
    const start_date = frm.doc.start_date
    const end_date = frm.doc.end_date
    frappe.call({
        method: "sampat_industries.public.js.doctype_plugin.salary_slip.salary_slip.get_daily_working_hours",
        args: {employee, start_date , end_date },
        callback: (r) => {
            let total_work_seconds = 0
            let regular_work_seconds = 0
            let holiday_work_seconds = 0
            // console.log(r.message)
            for (let i = 0; i < r.message.length; i++) {
                if (r.message[i].parentfield == 'holidays'){
                    let hms = r.message[i].WORK_HOURS;
                    let a = hms.split(':'); 
                    let seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]); 
                    holiday_work_seconds += seconds
                } else {
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

        },
    })
}

function totalWorkDays(frm){
    const employee = frm.doc.employee
    const start_date = frm.doc.start_date
    const end_date = frm.doc.end_date
    frappe.call({
        method: "sampat_industries.public.js.doctype_plugin.salary_slip.salary_slip.get_total_working_days",
        args:{employee, start_date , end_date},
        callback: (r) => {
            let countAbsent = 0
            
            for (let i = 0; i < r.message.length; i++){
                // console.log(r.message[i].status)
                if(r.message[i].status == "Absent"){
                    countAbsent += 1
                }
                frm.refresh_fields()
            }
            let extraAbsentDays = countAbsent
            // let x = 
            let newPaymentDays =  frm.doc.payment_days - extraAbsentDays

            frm.set_value('payment_days', newPaymentDays)
            frm.set_value('penalty_days', extraAbsentDays)

            // let grossPay = frm.doc.earnings[0].amount


            // frm.set_value('gross_pay', grossPay)
            
        }
    })
}

function getEmployeeSalaryDetails(frm){
    const employee = frm.doc.employee
    frappe.call({
        method: "sampat_industries.public.js.doctype_plugin.salary_slip.salary_slip.get_employee_salary_details",
        args: {employee},
        callback: (r) => {
            console.log(r.message[0])
            frm.set_value('monthly_basic_pay', r.message[0].monthly_basic_pay);
            frm.set_value('daily_duty_hours', r.message[0].regular_duty_hours);
            frm.set_value('holiday_duty_hours', r.message[0].holiday_duty_hrs);
            frm.set_value('pf_salary', r.message[0].pf_salary);
            frm.set_value('employee_type', r.message[0].employee_type);
        }
    })
}


function addToChild(frm){
    let gross_monthly_salary = (frm.doc.monthly_basic_pay/frm.doc.total_working_days)*(frm.doc.payment_days)
    
    if (frm.doc.earnings[0] == undefined){
        let e_row1 = frm.add_child('earnings', {
            salary_component: 'Gross Monthly Salary',
            amount: gross_monthly_salary
        });
        frm.refresh_field('earnings');


    let pf_deduction_amount = frm.doc.pf_salary * 0.0075

    let d_row1 = frm.add_child('deductions', {
        salary_component: 'Provident Fund',
        amount: pf_deduction_amount
    });
    frm.refresh_field('deductions');


    frm.set_value('gross_salary', gross_monthly_salary);
    frm.set_value('total_deduction', pf_deduction_amount);


    frm.set_value('net_pay', (gross_monthly_salary) - (pf_deduction_amount));
    }
    
}



