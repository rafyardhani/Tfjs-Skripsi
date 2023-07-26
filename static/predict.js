let imageLoaded = false;
$('#image-selector').change(function () {
  imageLoaded = false;
  let reader = new FileReader();
  reader.onload = function () {
    let dataURL = reader.result;
    $('#result-image').attr('src', dataURL);
    $("#result-image").attr("hidden",false);
    $("#placeholder-result-image").attr("hidden",true);
    
    $('#prediction-list').empty();
    $('#prediction-diagnosis').empty();
    imageLoaded = true;
  };

  let file = $('#image-selector').prop('files')[0];
  reader.readAsDataURL(file);
});

let model;
let modelLoaded = false;
$(document).ready(async function () {
  modelLoaded = false;
  $('#loading-result-image').show();
  model = await tf.loadGraphModel('model/warna/model.json');
  $('#loading-result-image').hide();
  modelLoaded = true;
});

let modelbentuk;
let modelLoadedbentuk = false;
$(document).ready(async function () {
  modelLoadedbentuk = false;
  $('#loading-result-image').show();
  modelbentuk = await tf.loadGraphModel('model/bentuk/model.json');
  $('#loading-result-image').hide();
  modelLoadedbentuk = true;
});

let modelkristal;
let modelLoadedkristal = false;
$(document).ready(async function () {
  modelLoadedkristal = false;
  $('#loading-result-image').show();
  modelkristal = await tf.loadGraphModel('model/kristal/model.json');
  $('#loading-result-image').hide();
  modelLoadedkristal = true;
});

$('#predict-button').click(async function () {
  if (!modelLoaded) {
    alert('The model must be loaded first');
    return;
  }
  if (!imageLoaded) {
    alert('Please select an image first');
    return;
  }
  $('#prediction-diagnosis').empty();
  let warna, bentuk, kristal;
  let image = $('#result-image').get(0);
  $("#placeholder-result-prediksi").attr("hidden",true);
  $("#loading-result-image").attr("hidden",false);
  $("#result-image-container").attr("hidden",false);
  // Pre-process the image
  let tensor = tf.browser
    .fromPixels(image, 3)
    .resizeNearestNeighbor([224, 224]) // change the image size
    .expandDims()
    .toFloat()
    .reverse(); // RGB -> BGR
  let predictions = await model.predict(tensor).data();
  let top5 = Array.from(predictions)
    .map(function (p, i) {
      // this is Array.map
      return {
        probability: p,
        className: TARGET_CLASSES[i], // we are selecting the value from the obj
      };
    })
    .sort(function (a, b) {
      return b.probability - a.probability;
    })
    .slice(0, 1);

  $('#prediction-list').empty();
  top5.forEach(function (p) {
    if (p.probability < 0.93) {
      $('#prediction-list').append(
        `<li class="text-black font-black font-medium">Warna: Tidak Diketahui</li>`
      );
    } else {
      $('#prediction-list').append(
        `<li class="text-black font-black font-medium">Warna: ${
          p.className
        }: ${p.probability.toFixed(6)}</li>`
      );
    }
    
    warna = p.className;
    rate_warna = p.probability;
  });

  // Predict bentuk
  let predictionsbentuk = await modelbentuk.predict(tensor).data();
  let topbentuk = Array.from(predictionsbentuk)
    .map(function (p, i) {
      // this is Array.map
      return {
        probabilitybentuk: p,
        className: TARGET_CLASSES_BENTUK[i], // we are selecting the value from the obj
      };
    })
    .sort(function (a, b) {
      return b.probabilitybentuk - a.probabilitybentuk;
    })
    .slice(0, 1);
  topbentuk.forEach(function (p) {
    if (p.probabilitybentuk < 0.93) {
      $('#prediction-list').append(
        `<li class="text-black font-black font-medium">Bentuk: Tidak Diketahui</li>`
      );
    } else {
      $('#prediction-list').append(
        `<li class="text-black font-black font-medium">Bentuk: ${
          p.className
        }: ${p.probabilitybentuk.toFixed(6)}</li>`
      );
    }
    
    bentuk = p.className;
    rate_bentuk = p.probabilitybentuk;
  });
  // Predict kristal
  let predictionskristal = await modelkristal.predict(tensor).data();
  let topkristal = Array.from(predictionskristal)
    .map(function (p, i) {
      // this is Array.map
      return {
        probabilitykristal: p,
        className: TARGET_CLASSES_KRISTAL[i], // we are selecting the value from the obj
      };
    })
    .sort(function (a, b) {
      return b.probabilitykristal - a.probabilitykristal;
    })
    .slice(0, 1);
  topkristal.forEach(function (p) {
    if (p.probabilitykristal < 0.93) {
      $('#prediction-list').append(
        `<li class="text-black font-black font-medium"> Kristal: Tidak Diketahui</li>`
      );
    } else {
      $('#prediction-list').append(
        `<li class="text-black font-black font-medium"> Kristal: ${
          p.className
        }: ${p.probabilitykristal.toFixed(6)}</li>`
      );
    }
    
    kristal = p.className;
    rate_kristal = p.probabilitykristal;
  });
  if (rate_warna < 0.93 || rate_bentuk < 0.93 || rate_kristal < 0.93) {
    $('#prediction-diagnosis').append(
      `<p class="text-black font-black font-medium"> Harap Masukkan Citra Kotoran Ayam Yang lebih jelas </p>`
    );
  } else {
    switch (warna) {
      case 'coklat muda':
        warna_encode = 0;
        break;
      case 'coklat tua':
        warna_encode = 1;
        break;
      case 'hijau muda':
        warna_encode = 2;
        break;
      default:
        warna_encode = 3;
        break;
    }
  
    switch (bentuk) {
      case 'cair':
        bentuk_encode = 0;
        break;
      default:
        bentuk_encode = 1;
        break;
    }
  
    switch (kristal) {
      case 'tidak':
        kristal_encode = 0;
        break;
      default:
        kristal_encode = 1;
        break;
    }
    let hasil, hasil_encode;
    $.ajax({
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({
        features: [warna_encode, bentuk_encode, kristal_encode],
      }),
      url: 'http://127.0.0.1:5000/predict',
      beforeSend: function () {
        $('#loading-result-image').show();
      },
  
      success: function (response) {
        $('#loading-result-image').hide();
        hasil_encode = response.prediction;
        switch (hasil_encode) {
          case 0:
            hasil = 'cocci';
            break;
          case 1:
            hasil = 'healthy';
            break;
          case 2:
            hasil = 'ncd';
            break;
          default:
            hasil = 'salmo';
            break;
        }
        $('#prediction-diagnosis').append(
          `<p class="text-black font-black font-medium"> Kondisi Kesehatan: ${hasil} </p>`
        );
      },
    });
  }
  
});
