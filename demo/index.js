import tus from 'tus-js-client';

const input = $(document.getElementById('file'));

input.change(e => {
	// Get the selected file from the input element
	const file = e.target.files[0];

  // Create a new tus upload
	const upload = new tus.Upload(file, {
		endpoint: 'http://localhost:8800/api/uploads/',
		onError(error) {
			input.val('');
			console.log('upload failed:', error);
		},
		onProgress(bytesUploaded, bytesTotal) {
			const percentage = (bytesUploaded / bytesTotal * 100).toFixed(2);
			console.log(bytesUploaded, bytesTotal, `${percentage}%`);
		},
		onSuccess() {
			input.val('');
			console.log('download %s from %s', upload.file.name, upload.url);
		},
	});

	// Start the upload
	upload.start();
});

// jquery example
// const input = $(document.getElementById('file'));
//
// input.change(() => {
// 	const options = { endpoint: 'http://localhost:8800/api/uploads' };
// 	tus
// 		.upload(this.files[0], options)
// 		.fail(error => {
// 			console.log('upload failed', error);
// 		})
// 		.always(() => {
// 			input.val('');
// 		})
// 		.progress((e, bytesUploaded, bytesTotal) => {
// 			console.log('progress %s/%s', bytesUploaded, bytesTotal);
// 		})
// 		.done((url, file) => {
// 			console.log(url);
// 			console.log(file.name);
// 		});
// });
