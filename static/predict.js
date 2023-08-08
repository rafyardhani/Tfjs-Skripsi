rekomendasi_penanganan = {
  0: [
    "Pemisahan flok antara unggas muda dari unggas tua. Unggas muda ditempatkan pada flok tertentu yang bebas dari litter yang mengandung oocyst.",
    "Meningkatkan sanitasi dan kebersihan kandang",
    "Pembersihan dan kontrol litter/sekam. Litter sebaiknya diganti atau ditambah secara teratur dengan tujuan mengurangi konsentrasi feses atau cemaran oocys dalam litter. Litter diusahakan selalu dalam keadaan kering untuk mencegah oocyst bersporulasi.",
    "Menjaga kecukupan udara dan ruang bagi unggas dengan mengatur ventilasi udara dan kepadatan ternak.",
    "Isolasi dan mengobati unggas pada flok yang sakit dan memberikan pakan ternak yang mengandung coccidiocidal /coccidiostat tergantung tingkat keparahan penyakit pada satu flok.",
    "Pengobatan Coccidiosis dapat dilakukan dengan pemberian obat-obatan yang bersifat coccidiostat atau coccidiocidal.",
    "Pemberian coccidiocidal untuk mengobati kejadian Coccidiosis dinilai lebih berhasil daripada pemberian coccidiostat.",
    "Pemberian obat-obatan coccidiostat dilakukan dengan mencampurkan ke dalam pakan atau air minum.",
    "Terdapat banyak sediaan yang dapat digunakan untuk mengobati Coccidiosis pada unggas antara lain amprolium, clopidol, asam folat antagonis, halofuginone hydrobromida, ionophore, nicarbazine, nitrobenzamida, sulfaquinoxalin dan robenidine."
  ],
  1: [
    "Pemberian pakan berkualitas",
    "Air bersih dan segar",
    "Jaga kebersihan kandang secara teratur dengan membersihkan kotoran, sisa makanan, dan bahan organik lainnya.",
    "Terapkan langkah-langkah biosekuriti yang ketat untuk mencegah masuknya penyakit dari luar ke kandang ayam Anda.",
    "Hindari perubahan lingkungan yang drastis, seperti perpindahan kandang atau pergantian grup ayam yang terlalu sering.",
    "Pastikan kandang dan lingkungan ayam memberikan kenyamanan dan perlindungan dari cuaca ekstrem."

  ],
  2: [
    "Membuat kondisi badan ayam cepat membaik dan merangsang nafsu makannya dengan memberikan tambahan vitamin dan mineral.",
    "Mencegah infeksi sekunder dengan pemberian antibiotik.",
    "Pencegahan penyakit  dapat  dilakukan  dengan  vaksinasi  secara   teratur.",
    "Menjaga kebersihan dan sanitasi kandang.",
    "Ayam yang terinfeksi harus segera diisolasi dari ayam lainnya untuk mencegah penyebaran penyakit."
  ],
  3: [
    "Penyuntikan antibiotik seperti cocillin, neo terramycin ke dada ayam, namun obat-obat ini hanya efektif untuk pencegahan kematian anak ayam, tetapi tidak dapat menghilangkan penyakit tersebut. ",
    "Sebaiknya ayam yang sudah terlanjur terinfeksi parah dimusnahkan untuk menghindari adanya carrier yang bersifat kronis. ",
    "Sebelum kandang dipakai harus dibersihkan dan dilabur dengan kapur atau disemprot dengan salah satu diantara NaOH 2%, formalin 1-2% Giocide atau difumigasi dengan campuran formalin dan KMn04. Bila memakai litter, harus diusahakan agar tetap kering dan tetap dijaga kebersihan serta ventilasi yang baik. ",
    "Kandang hendaknya selalu kena sinar matahari dan diusahakan bebas dari hewan-hewan yang dapat memindahkan penyakit pullorum seperti burung gereja dan sebagainya."
  ]
}

let imageLoaded = false;
$('#image-selector').change(function () {
  imageLoaded = false;
  let reader = new FileReader();
  reader.onload = function () {
    let dataURL = reader.result;
    $('#result-image').attr('src', dataURL);
    $("#result-image").attr("hidden",false);
    $("#placeholder-result-image").attr("hidden",true);
    
    
    imageLoaded = true;
  };
  let file = $('#image-selector').prop('files')[0];
  
  if (!file.type.startsWith('image/')) {
    alert('Tipe file yang dipilih bukan gambar.');
    imageLoaded = false;
    return ;
  }else{
    reader.readAsDataURL(file);
  }
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

$('#overlay-modal').click(async function(){
  $("#overlay-modal").attr("hidden",true);
})
$('#predict-button').click(async function () {
  $('#prediction-list').empty();
  $('#predictions-list').empty();
  $('#prediction-diagnosis').empty();
  $('#predict-list').empty();
  $('#predict-diagnosis').empty();
  if (!modelLoaded) {
    alert('The model must be loaded first');
    return;
  }
  if (!imageLoaded) {
    $("#overlay-modal").attr("hidden",false);
    return;
  }
  $('#prediction-diagnosis').empty();
  let warna, bentuk, kristal;
  let image = $('#result-image').get(0);
  $("#placeholder-result-prediksi").attr("hidden",true);
  $("#loading-result-image").attr("hidden",false);
  $("#result-image-container").attr("hidden",false);
  $("#placeholder-predictions").attr("hidden",true);
  $("#predictions").attr("hidden",false);
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
        `<li class="text-black ">Warna: Tidak Diketahui</li>`
      );
      $('#predict-list').append(
        `<li class="text-black ">Warna: Tidak Diketahui</li>`
      );
    } else {
      $('#prediction-list').append(
        `<li class="text-black ">Warna: ${
          p.className
        }: ${p.probability.toFixed(5)*100}%</li>`
      );
      $('#predict-list').append(
        `<li class="text-black ">Warna: ${
          p.className
        }: ${p.probability.toFixed(5)*100}%</li>`
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
        `<li class="text-black ">Bentuk: Tidak Diketahui</li>`
      );
      $('#predict-list').append(
        `<li class="text-black ">Bentuk: Tidak Diketahui</li>`
      );
    } else {
      $('#prediction-list').append(
        `<li class="text-black ">Bentuk: ${
          p.className
        }: ${p.probabilitybentuk.toFixed(5)*100}%</li>`
      );
      $('#predict-list').append(
        `<li class="text-black ">Bentuk: ${
          p.className
        }: ${p.probabilitybentuk.toFixed(5)*100}%</li>`
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
        `<li class="text-black "> Kristal: Tidak Diketahui</li>`
      );
      $('#predict-list').append(
        `<li class="text-black "> Kristal: Tidak Diketahui</li>`
      );
    } else {
      $('#prediction-list').append(
        `<li class="text-black "> Kristal: ${
          p.className
        }: ${p.probabilitykristal.toFixed(5)*100}%</li>`
      );
      $('#predict-list').append(
        `<li class="text-black "> Kristal: ${
          p.className
        }: ${p.probabilitykristal.toFixed(5)*100}%</li>`
      );
    }
    
    kristal = p.className;
    rate_kristal = p.probabilitykristal;
  });
  if (rate_warna < 0.93 || rate_bentuk < 0.93 || rate_kristal < 0.93) {
    $('#prediction-diagnosis').append(
      `<p class="text-black "> Harap Masukkan Citra Kotoran Ayam Yang lebih jelas </p>`
    );
    $('#predict-diagnosis').append(
      `<p class="text-black "> Harap Masukkan Citra Kotoran Ayam Yang lebih jelas </p>`
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
      url: 'http://ec2-54-95-118-77.ap-northeast-1.compute.amazonaws.com/predict',
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
          `<li class="text-black ">Kondisi Kesehatan: ${hasil} </li>`
        );
        $('#predict-diagnosis').append(
          `<li class="text-black ">Kondisi Kesehatan: ${hasil} </li>`
          );
        rekomendasi_penanganan[hasil_encode].forEach((val) => {
          // console.log(val)
          $('#predictions-list').append(
            `<li class="text-black"> - ${val} </li>`
          )
        })
      },
    });
    
}
    $("#overlay-modal-predict").attr("hidden",false);
    $('#overlay-modal-predict').click(async function(){
      $("#overlay-modal-predict").attr("hidden",true);
    })
});
