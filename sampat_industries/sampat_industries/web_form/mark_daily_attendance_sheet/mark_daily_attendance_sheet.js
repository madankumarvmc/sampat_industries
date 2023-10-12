frappe.ready(function() {
	// bind events here
    // Add more styling as required
	var  y = document.querySelectorAll('.control-value.like-disabled-input')
	y.forEach(function(element) {
		element.style.backgroundColor = 'rgba(119, 136, 153, 0.3)';
		
	});


	var x = document.querySelector('.page_content');
	x.style.maxWidth = '1400px';

	var a = document.querySelector('#page-production-entry-sheet');
	a.style.backgroundColor = 'lightslategray'

	var b = document.querySelector('.breadcrumb-item a');
		b.style.color = 'yellow'

	var c = document.querySelector('.breadcrumb-item.active');
	c.style.color = 'yellow'


	// Select the form container using querySelector
    var formContainer = document.querySelector('.form-container');

    // Apply CSS styles using JavaScript
    formContainer.style.display = 'flex';
    formContainer.style.flexWrap = 'wrap';
    formContainer.style.justifyContent = 'space-between';

    // Select all forms with the class "form"
    var forms = document.querySelectorAll('.form');
	console.log(forms)
    // Apply CSS styles to each form
    forms.forEach(function(form) {
		form.style.display = 'flex';
        // form.style.width = 'calc(50% - 10px)';
        // form.style.marginRight = '10px';
        // form.style.marginBottom = '10px';
    });

})