// Copyright (c) 2023, Niraj and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Salary Sheet Report"] = {
  filters: [
    {
      fieldname: "start_date",
      label: __("Start Date"),
      fieldtype: "Date",
      reqd: 1,
    },
    {
      fieldname: "end_date",
      label: __("End Date"),
      fieldtype: "Date",
      reqd: 1,
    },
  ],
};
