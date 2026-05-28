export const withLineNumbers = (input: string) =>
	input
		.split('\n')
		.map((line, i) => `${i + 1}| ${line}`)
		.join('\n');
