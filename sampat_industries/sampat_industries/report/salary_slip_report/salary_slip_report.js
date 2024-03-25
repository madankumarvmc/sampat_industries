// Copyright (c) 2024, Niraj and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Salary Slip Report"] = {
  filters: [
    {
      fieldname: "start_date",
      label: __("Month Start Date"),
      fieldtype: "Date",
    },
    {
      fieldname: "end_date",
      label: __("Month End Date"),
      fieldtype: "Date",
      reqd: 1,
    },
  ],
};
