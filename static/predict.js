let imageLoaded = false;
$("#image-selector").change(function () {
	imageLoaded = false;
	let reader = new FileReader();
	reader.onload = function () {
		let dataURL = reader.result;
		$("#selected-image").attr("src", dataURL);
		$("#prediction-list").empty();
		imageLoaded = true;
	}
	
	let file = $("#image-selector").prop('files')[0];
	reader.readAsDataURL(file);
	// console.log(file.name,"url")

});

let model;
let modelLoaded = false;
$( document ).ready(async function () {
	modelLoaded = false;
	$('.progress-bar').show();
    console.log( "Loading model..." );
    model = await tf.loadGraphModel('model/warna/model.json');
    console.log( "Model loaded." );
	$('.progress-bar').hide();
	modelLoaded = true;
});

let modelbentuk;
let modelLoadedbentuk = false;
$( document ).ready(async function () {
	modelLoadedbentuk = false;
	$('.progress-bar').show();
    console.log( "Loading model..." );
    modelbentuk = await tf.loadGraphModel('model/bentuk/model.json');
    console.log( "Model loaded." );
	$('.progress-bar').hide();
	modelLoadedbentuk = true;
});

let modelkristal;
let modelLoadedkristal = false;
$( document ).ready(async function () {
	modelLoadedkristal = false;
	$('.progress-bar').show();
    console.log( "Loading model..." );
    modelkristal = await tf.loadGraphModel('model/kristal/model.json');
    console.log( "Model loaded." );
	$('.progress-bar').hide();
	modelLoadedkristal = true;
});

$("#predict-button").click(async function () {
	if (!modelLoaded) { alert("The model must be loaded first"); return; }
	if (!imageLoaded) { alert("Please select an image first"); return; }
	let warna,bentuk,kristal;
	let image = $('#selected-image').get(0);
	
	// Pre-process the image
	console.log( "Loading image..." );
	let tensor = tf.browser.fromPixels(image, 3)
		.resizeNearestNeighbor([224, 224]) // change the image size
		.expandDims()
		.toFloat()
		.reverse(); // RGB -> BGR
	let predictions = await model.predict(tensor).data();
	console.log(predictions);
	let top5 = Array.from(predictions)
		.map(function (p, i) { // this is Array.map
			return {
				probability: p,
				className: TARGET_CLASSES[i] // we are selecting the value from the obj
			};
		}).sort(function (a, b) {
			return b.probability - a.probability;
		}).slice(0, 1);

	$("#prediction-list").empty();
	top5.forEach(function (p) {
		$("#prediction-list").append(`<li>Warna: ${p.className}: ${p.probability.toFixed(6)}</li>`);
		warna = p.className;
		});
	
	// Predict bentuk
	let predictionsbentuk = await modelbentuk.predict(tensor).data();
	console.log(predictionsbentuk);
	let topbentuk = Array.from(predictionsbentuk)
		.map(function (p, i) { // this is Array.map
			return {
				probabilitybentuk: p,
				className: TARGET_CLASSES_BENTUK[i] // we are selecting the value from the obj
			};
		}).sort(function (a, b) {
			return b.probabilitybentuk - a.probabilitybentuk;
		}).slice(0, 1);
	topbentuk.forEach(function (p) {
			$("#prediction-list").append(`<li>Bentuk: ${p.className}: ${p.probabilitybentuk.toFixed(6)}</li>`);
			bentuk = p.className;
			});
	// Predict kristal
	let predictionskristal = await modelkristal.predict(tensor).data();
	console.log(predictionskristal);
	let topkristal = Array.from(predictionskristal)
		.map(function (p, i) { // this is Array.map
			return {
				probabilitykristal: p,
				className: TARGET_CLASSES_KRISTAL[i] // we are selecting the value from the obj
			};
		}).sort(function (a, b) {
			return b.probabilitykristal - a.probabilitykristal;
		}).slice(0, 1);
	topkristal.forEach(function (p) {
			$("#prediction-list").append(`<li>Kristal: ${p.className}: ${p.probabilitykristal.toFixed(6)}</li>`);
			kristal = p.className;
			});
	// console.log(image,"anjay")

	$.ajax({
		type: "POST",
		dataType: "json",
		encode: true,
		data: {
		nama: $("#image-selector").prop('files')[0].name,
		warna: warna,
		bentuk: bentuk,
		kristal: kristal
		},
		url: "/add-data",
		success: function (reponse) {
			console.log(response,"Anjay aku bisa")
			}
		})
});
