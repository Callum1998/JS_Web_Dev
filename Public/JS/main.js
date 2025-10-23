function initialise() {
  window.alert("Hello World");

  document.getElementById("printHere").innerHTML = "PRINT HERE";

  dateTime();
  preload();
}

function dateTime() {
  document.getElementById("dateTime").innerHTML = Date();
}

function totup(myForm) {
  let total = 0;
  for (let i = 0; i < myForm.elements.entry.length; i++) {
    total += parseFloat(myForm.elements.entry[i].value);
  }
  total = total * (1 - myForm.elements.d1.value / 100);

  document.getElementById("totalled").innerHTML = total.toFixed(2);
}

function totup2(myForm) {
  let total = 0;
  for (let i = 0; i < myForm.elements.entry.length; i++) {
    total += parseFloat(myForm.elements.entry[i].value);
  }
  total = total * (1 - myForm.elements.d1.value / 100);

  document.getElementById("totalled2").innerHTML = total.toFixed(2);
}

var faces = [6];

function preload() {
  faces[0] = new Image();
  faces[0].src = "Assets/dice-1.png";
  faces[1] = new Image();
  faces[1].src = "Assets/dice-2.png";
  faces[2] = new Image();
  faces[2].src = "Assets/dice-3.png";
  faces[3] = new Image();
  faces[3].src = "Assets/dice-4.png";
  faces[4] = new Image();
  faces[4].src = "Assets/dice-5.png";
  faces[5] = new Image();
  faces[5].src = "Assets/dice-6.png";
}

function roll(imgElement) {
  let number = Math.floor(Math.random() * 6);
  imgElement.src = faces[number].src;
  console.log(number);
}


