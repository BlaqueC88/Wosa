export function submitPayfastForm(
	url: string,
	fields: { name: string; value: string }[]
) {
	const form=document.createElement("form");

	form.method="POST";
	form.action=url;

	for(const field of fields) {
		const input=document.createElement("input");

		input.type="hidden";
		input.name=field.name;
		input.value=field.value;
		form.appendChild(input);
	}

	document.body.appendChild(form);
	form.submit();
}