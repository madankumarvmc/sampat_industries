// Copyright (c) 2024, Niraj and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Production Sheet Report"] = {
  filters: [
    {
      fieldname: "month_start_date",
      label: __("Month Start Date"),
      fieldtype: "Date",
      reqd: 1,
    },
    {
      fieldname: "month_end_date",
      label: __("Month End Date"),
      fieldtype: "Date",
      reqd: 1,
    },
    {
      fieldname: "employee",
      label: __("Employee"),
      fieldtype: "Link",
      options: "Employee",
      reqd: 0,
    },
  ],
};
