// Copyright (c) 2023, Niraj and contributors
// For license information, please see license.txt
/* eslint-disable */

// frappe.query_reports["Daily Attendance Report"] = {
// 	"filters": [

// 	]
// };

frappe.query_reports["Daily Attendance Report"] = {
    "filters": [
        // {
        //     "fieldname": "date",
        //     "label": __("Date"),
        //     "fieldtype": "Date",
        //     // "default": frappe.datetime.get_today(),
        //     "reqd": 0
        // },
        {
            "fieldname": "company",
            "label": __("Company"),
            "fieldtype": "Link",
            "options": "Company",
			"default": "Sampat Industries",
            "reqd": 1
        },
        {
            "fieldname": "from_date",
            "label": __("From Date"),
            "fieldtype": "Date",
            "reqd": 1
        },
        {
            "fieldname": "to_date",
            "label": __("To Date"),
            "fieldtype": "Date",
            "reqd": 1
        }
    ]
};
