
const uplimg = document.getElementById('uplimg');
const allExtCon = document.getElementById('allExt');
const upltype = document.getElementById('uplType');
const allqltPor = document.getElementById('qltPortionR');
const allqltRang = document.getElementById('qrange');
const thumsTagsPor = document.getElementById("thums_tag");
const imgToView = document.getElementById('c_view_image');
const dnlBtnPopup = document.getElementById('dnlBtnPopup');
const popupCont = document.getElementById('popupContid');
const cViewControl = document.getElementById('cControlPor');
const alffil = document.getElementById('alfilss');
var linkArr = Array();
var myob = {};
var areExtras = false;
document.getElementById('refreshButton').onclick = function(){
    location.reload();
}
uplimg.accept = "image/png, image/jpg, image/jpeg, image/x-icon, image/apng, image/gif, image/avif, image/webp";
upltype.onchange = (e) => {
    refresherAll([1,1,1,0]);
    if (upltype.value == 0 || upltype.value == 1) {
        uplimg.accept = "image/png, image/jpg, image/jpeg, image/x-icon, image/apng, image/gif, image/avif, image/webp";
    }
    else if (upltype.value == 2) {
        uplimg.accept = "image/svg+xml";
    }
}

dnlBtnPopup.onclick = () => {
    let thumsTags1 = thumsTagsPor.querySelectorAll(".img_thumb_tag");
    if (thumsTags1.length === 0) {
        window.alert("There are No photos Uploaded!");
    }
    else if (thumsTags1.length === 1) {
        download_indi(thumsTags1[0].querySelectorAll('button')[1]);
    }
    else {
        popupShower();
    };
}
// for the close of popupCont
popupCont.querySelectorAll('button')[0].onclick = () => {
    popupShower();
}

uplimg.onchange = async () => {
    refresherAll();
    let ls = "";
    for (let i = 0; i < uplimg.files.length; i++) {
        if (upltype.value == 2) {
            let svdet = await getDetails2(uplimg.files[i]);
            if (svdet[1] == 1) areExtras = true;
            ls += createThumbTag(i, svdet[0], svdet[1], svdet[2], svdet[3]);
        }
        else if (upltype.value == 0 || upltype.value == 1) {
            areExtras = false;
            ls += createThumbTag(i, 0, 0, 0, 0);
        }
    }
    thumsTagsPor.innerHTML = ls;
    viewControlShow();
    allTagSetter(thumsTagsPor, 2, allqltRang.value);
    allTagSetter(thumsTagsPor, 1, allExtCon.value);
    hidingallRange();

}

function viewControlShow() {

    if (areExtras) {
        cViewControl.style.transform = "scale(1,1)";
    }
    else {
        cViewControl.style.transform = "scale(0,1)";
    }
}

function hidingallRange() {

    let thumsTags1 = thumsTagsPor.querySelectorAll(".img_thumb_tag");
    if (allExtCon.value == "jpeg" || allExtCon.value == "jpg" || allExtCon.value == "avif" || allExtCon.value == "webp") {
        hidingall("flex");
    }
    else {
        hidingall("none");
    }
    function hidingall(t) {
        for (let j = 0; j < thumsTags1.length; j++) {
            thumsTags1[j].querySelectorAll('.th_controls_sub')[1].style.display = t;
        }
    }
}

allExtCon.onchange = (e) => {
    let thumsTags = thumsTagsPor.querySelectorAll(".img_thumb_tag");
    if (thumsTags.length != 0) {
        allTagSetter(thumsTagsPor, 1, allExtCon.value);
        allTagSetter(thumsTagsPor, 2, allqltRang.value);
    }
    if (allExtCon.value == "jpeg" || allExtCon.value == "jpg" || allExtCon.value == "avif" || allExtCon.value == "webp") {
        allqltPor.style.display = "flex";
        hidingall("flex");
    }
    else {
        allqltPor.style.display = "none";
        hidingall("none");
    }

    function hidingall(t) {
        for (let j = 0; j < thumsTags.length; j++) {
            thumsTags[j].querySelectorAll('.th_controls_sub')[1].style.display = t;
        }
    }
}

allqltRang.oninput = (e) => {
    let thumsTags = thumsTagsPor.querySelectorAll(".img_thumb_tag");
    allTagSetter(thumsTagsPor, 2, allqltRang.value);
    if (thumsTags.length != 0) {
        let rtxt = allqltRang.parentNode.querySelector('.th_range_txt');
        rtxt.innerHTML = allqltRang.value + "%";

    }
}



// download function for individual image
function download_indi(l) {
    let parentC = l.parentNode.parentNode.parentNode;
    let formatOfImg = parentC.querySelector("select").value;
    let quality = parentC.querySelector("input[type=range]").value;
    let imgID = parentC.getAttribute('data-id');
    let svgStatus = parentC.getAttribute('data-svg-status');
    let svgExtSts = parentC.getAttribute('data-ExtImg-status');
    let svDimsn = parentC.getAttribute('data-img-dms');
    let wi = parseFloat(svDimsn.split(",")[0]);
    let hi = parseFloat(svDimsn.split(",")[1]);
    convertImage2(uplimg.files[imgID], [parseInt(svgStatus), parseInt(svgExtSts), wi, hi], formatOfImg, quality).then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `qkTor_${(uplimg.files[imgID].name).split(".")[0]}.${formatOfImg}`;
        link.click();
    });



}

function download_bundle() {
    let zip = new JSZip();
    let promises = [];
    let images = uplimg.files;
    let filename = correctingFilename(popupCont.querySelector('input[type=text]').value);
    let prgbar = popupCont.querySelector('.popProgressBarCo');
    let prgbarText = popupCont.querySelector('.popProgressText');
    let parentC = thumsTagsPor.querySelectorAll(".img_thumb_tag");
    for (let i = 0; i < images.length; i++) {
        let formatOfImg = parentC[i].querySelector("select").value;
        let quality = parentC[i].querySelector("input[type=range]").value;
        let imgID = parentC[i].getAttribute('data-id');
        let svgStatus = parentC[i].getAttribute('data-svg-status');
        let svgExtSts = parentC[i].getAttribute('data-ExtImg-status');
        let svDimsn = parentC[i].getAttribute('data-img-dms');
        let wi = parseFloat(svDimsn.split(",")[0]);
        let hi = parseFloat(svDimsn.split(",")[1]);
        let prgPercent = parseInt((i+1) / images.length) * 100;
        promises.push(convertImage2(images[i], [parseInt(svgStatus), parseInt(svgExtSts), wi, hi], formatOfImg, quality).then((blob) => {
            zip.file(`${images[i].name.split('.')[0]}.${formatOfImg}`, blob);
        }));
        prgbar.style.width = prgPercent + "%";
        prgbarText.innerHTML = prgPercent + "%";
    }

    Promise.all(promises).then(() => {
        zip.generateAsync({ type: 'blob' }).then((content) => {
            if(saveAs(content, filename))
            setTimeout(function(){popupShower()}, 300);
        })
    })

}

function correctingFilename(t = "qkTor_images.zip") {
    let fname = t;
    let fname1 = fname.split('.')[0];
    let fname2, filenmes;
    if (fname != "") {
        if (fname.split('.')[1]) {
            if (fname.split('.')[1].toLowerCase() == "zip") {
                fname2 = fname.split('.')[1].toLowerCase();
            }
            else {
                fname2 = "zip";
            }
        }
        else {
            fname2 = "zip";
        }
        return fname1 + "." + fname2;
    }
    else {
        return "qkTor_Images.zip";
    }
}

function convertImage2(image, imageDets = [0, 0, 0, 0], format, quality = 80) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (imageDets[0] == 1 || imageDets[0] == 2) {

            getDataText(image, (e) => {
                let newimg = new Image();
                newimg.onload = () => {
                    blobImage(newimg, imageDets[2], imageDets[3]);
                }
                let svgCorrectData = correctingSvg(e);
                let svgImageData = (imageDets[0] === 1) ? afterChangeOfSvg(svgCorrectData["data"]) : NotifyErrorSvg(image.name, svgCorrectData["data"]);
                newimg.src = svgImageData;
            });
        }
        if (imageDets[0] == 0) {
            const img = new Image();
            img.onload = () => {
                blobImage(img, img.width, img.height);
            };
            img.src = URL.createObjectURL(image);
        }
        function blobImage(imgs, w, h) {
            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(imgs, 0, 0);
            if (format == 'jpeg' || format == 'jpg' || format == 'webp' || format == 'avif') {
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, `image/${format}`, quality);
            }
            else {
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, `image/${format}`);
            }
        }
    });
}

function refresherAll(arrAll = [0, 0, 0, 0]){
   linkArr = [];
   myob = {};
   if(arrAll[0] == 1){
    uplimg.value = "";
   }
   if(arrAll[1] == 1){
    thumsTagsPor.innerHTML = "";
   }
   if(arrAll[2] == 1){
    cViewControl.style.transform = "scale(0,0)";
   }
   
}

function ImageView(el) {

    let imgthumtag = el.parentNode.parentNode.parentNode;
    let svgStatus = imgthumtag.getAttribute("data-svg-status");
    let svgExtraStatus = imgthumtag.getAttribute("data-ExtImg-status");

    if (svgStatus == 1) {
        getDataText(uplimg.files[imgthumtag.getAttribute('data-id')], (j) => {
            let svgCorct = correctingSvg(j);
            imgToView.src = afterChangeOfSvg(svgCorct.data);
        })
    }
    else if (svgStatus == 2) {
        getDataText(uplimg.files[imgthumtag.getAttribute('data-id')], (j) => {
            let svgCorct = correctingSvg(j);
            imgToView.src = NotifyErrorSvg(uplimg.files[imgthumtag.getAttribute('data-id')].name, svgCorct.data);
        })
    }
    else if (svgStatus == 0) {
        let reader = new FileReader();
        reader.onload = (e) => {
            imgToView.src = e.target.result;
        }
        reader.readAsDataURL(uplimg.files[imgthumtag.getAttribute('data-id')]);
    }
}


// function for getting error svg photo 
function NotifyErrorSvg(filename = "Not Mentioned!", fileError = "Svg Is Errored!") {
    let sh = fileError.length;
    let txl = "";
    if (sh > 35) {
        let rowj = parseInt(sh / 35);
        let extRowj = (parseInt(sh % 35) == 0) ? 0 : 1;
        let allRowj = rowj + extRowj;
        let a = 15;
        let starts = 0;
        let end = 35;
        let rowidth = 145;
        for (let i = 0; i < allRowj; i++) {
            txl += `<text x="55" y="${rowidth}" fill="#2a7fff" font-weight="bolder" font-size="12" font-family="consolas">${fileError.slice(starts, end)}</text>`;
            rowidth += a;
            starts = end;
            end += 35;
        }
    }
    else {
        txl += fileError;
    }
    let svgtext = `<svg width="300" height="250">
    <defs>
        <pattern id="tile" x="0" y="0" width="25" height="25" patternUnits="userSpaceOnUse">
                <rect width="10" height="10" x="3" y="3" fill="#ff000052"></rect>
                <rect width="10" height="10" x="16" y="3" fill="#2a7fff5e"></rect>
                <rect width="10" height="10" x="3" y="16" fill="#c837ab52"></rect>
                <rect width="10" height="10" x="16" y="16" fill="#12c2485c"></rect>
        </pattern>
    </defs>
    <rect width="300" height="250" fill="white"></rect>      
    <path d="M0,0L0,100C75,130,150,100,225,70L300,100L300,0Z" fill="url(#tile)"></path>   
    <text x="40" y="100" fill="red" font-weight="bolder" font-size="40" font-family="consolas">SVG Error!</text>
    <text x="10" y="130" fill="#c837ab" font-weight="bolder" font-size="12" font-family="consolas">File-Name: ${filename}</text>
    <text x="10" y="145" fill="#2a7fff" font-weight="bolder" font-size="12" font-family="consolas">Error: </text>${txl}
    </svg>`;
    let corSvg = correctingSvg(svgtext);
    return afterChangeOfSvg(corSvg.data);
}


function createThumbTag(n, svgSt, svgExtSt, svWidth, svHeight) {
    let fulnam = uplimg.files[n].name;
    let spName = fulnam.split('.');
    let noteColor = (svgSt == 2) ? "red" : "black";
    return `
        <div style="border: 2px solid ${noteColor}; box-shadow: 1px 3px 0px ${noteColor}" class="img_thumb_tag" data-id="${n}" data-svg-status="${svgSt}" data-ExtImg-status="${svgExtSt}" data-img-dms="${svWidth},${svHeight}">
        <div class="th_name_txt" style="color: ${noteColor}"><b>File-Name: </b><span>${textCompacter(spName[0])}<span>.${spName[1]}</span></span></div>
        <div class="th_controls">
            <div class="th_controls_sub">
                <select onchange="tagSelectChange(this)" name="individualExtSelect${n}">
                        <option value="jpeg">Convert To JPEG</option>
                        <option value="jpg">Convert To JPG</option>
                        <option value="png" selected>Convert To PNG</option>
                        <option value="avif">Convert To AVIF</option>
                        <option value="bmp">Convert To BMP</option>
                        <option value="webp">Convert To WEBP</option>
                        <option value="apng">Convert To APNG</option>
                        <option value="x-icon">Convert To ICO</option>
                </select>
                <button title="View Image" onclick="ImageView(this)"><img
                        src="./assets/view.png" /></button>
                <button title="Convert & Download" onclick="download_indi(this)"><img
                        src="./assets/dnl.png" /></button>
                    </div>
            <div class="th_controls_sub" style="display:none;">
                <input type="range" min="0" oninput="quality_rng_sub(this)" name="thRange${n}" max="100" value="80" />
                <div class="th_range_txt">80%</div>
            </div>
            <div style="width: 100%; height: 10px"></div>
            </div>
    </div>
        `;
}

function quality_rng_sub(el) {
    let rtxt = el.parentNode.querySelector('.th_range_txt');
    rtxt.innerHTML = el.value + "%";
}

function tagSelectChange(el) {
    let elparent = el.parentNode.parentNode.parentNode;
    let subControltg = elparent.querySelectorAll('.th_controls_sub')[1];
    if (el.value == "jpeg" || el.value == "jpg" || el.value == "avif" || el.value == "webp") {
        subControltg.style.display = "flex";
    }
    else {
        subControltg.style.display = "none";
    }
}

function allTagSetter(tag, n, val) {
    // n = 1 is select and n = 2 is range 
    let thums = tag.querySelectorAll('.img_thumb_tag');
    if (thums.length != 0) {
        for (let i = 0; i < thums.length; i++) {
            if (n == 1) {
                thums[i].querySelectorAll('.th_controls_sub')[0].querySelector('select').value = val;
            }
            if (n == 2) {
                thums[i].querySelectorAll('.th_controls_sub')[1].querySelector('input').value = val;
                thums[i].querySelectorAll('.th_controls_sub')[1].querySelector('.th_range_txt').innerHTML = val + "%";
            }
        }
    }
}

function textCompacter(t) {
    if (t.length > 12) {
        let tx = "";
        for (let i = 0; i < 12; i++) {
            tx += t[i];
        }
        return tx + "...";
    }
    else
        return t;

}


function popupShower() {
    let prgbar = popupCont.querySelector('.popProgressBarCo');
    let prgbarText = popupCont.querySelector('.popProgressText');
    prgbar.style.width = "0%";
    prgbarText.innerHTML = "0%";
    if (popupCont.classList.contains('show')) {
        popupCont.classList.remove('show');
    }
    else popupCont.classList.add('show');
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == popupCont) {
        if (popupCont.classList.contains('show')) {
            popupCont.classList.remove('show');
        }
    }
}




// function for uploaiding extra to link images 
function uplo(l) {
    let parentC = l.parentNode.parentNode;
    let name_f = parentC.querySelector('.extraUplsText');
    if (nameCompare(l.files[0].name, getFileName(name_f.innerText))) {
        parentC.style.border = "2px solid #2a7fff";
        name_f.style.color = "#2a7fff";
        parentC.setAttribute('data-will', '1');
        geneToImgArr(myob, l.files[0], parentC.getAttribute('data-nu'));
    }
    else {
        parentC.style.border = "2px solid red";
        name_f.style.color = "red";
        parentC.setAttribute('data-will', '0');
    }
}


function afterChangeOfSvg(svg) {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svg, 'image/svg+xml');
    let imgTag = svgDoc.querySelectorAll('image');
    let feimgTag = svgDoc.querySelectorAll('feImage');

    subFunc(imgTag);
    subFunc(feimgTag);
    let svgl = new XMLSerializer().serializeToString(svgDoc);
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgl);


    function subFunc(tag) {
        if (tag.length != 0) {
            for (let i = 0; i < tag.length; i++) {
                let linka = tag[i].getAttribute('xlink:href');
                if (linkArr.includes(linka) && linka !== "") {
                    if (myob["exImg" + linkArr.indexOf(linka)]) {
                        tag[i].setAttribute('xlink:href', myob["exImg" + linkArr.indexOf(linka)]);
                    }
                    else {
                        tag[i].setAttribute('xlink:href', linka);
                    }
                }
            }
        }
    }
}

function getDetails2(f) {
    return new Promise((resolve, reject) => {
        let attrArray = Array();
        getDataText(f, (e) => {
            let doc = correctingSvg(e);
            if (!doc["status"]) {
                attrArray[0] = 2;
                attrArray[1] = 0;
                attrArray[2] = 300;
                attrArray[3] = 250;

            }
            else {
                let docDetails = extractImgTag2(doc["data"]);
                attrArray[0] = 1;
                attrArray[1] = docDetails["imgtagPresence"];
                attrArray[2] = docDetails["w"];
                attrArray[3] = docDetails["h"];
            }
            resolve(attrArray);
        })
    })
}


function geneToImgArr(arObj, f, tagn) {
    getDataURL2(f, (e) => {
        arObj["exImg" + tagn] = e;
    })
}


function getDataURL2(f, callback) {
    const reader = new FileReader();
    reader.onload = () => {
        callback(reader.result);
    }
    reader.readAsDataURL(f);
}
function getDataText(f, callback) {
    const reader = new FileReader();
    reader.onload = () => {
        callback(reader.result);
    }
    reader.readAsText(f);
}

function nameCompare(a, b) {
    let a1 = a.split('.');
    let b1 = b.split('.');
    if (a1[0].toLowerCase() == b1[0].toLowerCase() && a1[1].toLowerCase() == b1[1].toLowerCase()) {
        return true;
    }
    else return false;
}
function getFileName(f) {
    if (f.includes('/')) {
        let k = f.split('/');
        let klen = k.length;
        return k[klen - 1];
    }
    else return f;
}

function extractImgTag2(svg) {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svg, 'image/svg+xml');
    const svgElement = svgDoc.querySelector('svg');
    let imgTag = svgDoc.querySelectorAll('image');
    let feimgTag = svgDoc.querySelectorAll('feImage');
    let width, height, img1Presense = false, img2Presense = false;
    if (imgTag.length != 0) {
        img1Presense = true;
        for (let i = 0; i < imgTag.length; i++) {
            if (imgTag[i].getAttribute('xlink:href') != "" && imgTag[i].getAttribute('xlink:href').length <= 150) {
                let linka = imgTag[i].getAttribute('xlink:href');
                if (!linkArr.includes(linka)) {
                    linkArr.push(linka);
                }
            }
        }
    }
    else {
        img1Presense = false;
    }
    if (feimgTag.length != 0) {
        img2Presense = true;
        for (let j = 0; j < feimgTag.length; j++) {
            if (feimgTag[j].getAttribute('xlink:href') != "" && feimgTag[j].getAttribute('xlink:href').length <= 150) {
                let linkb = feimgTag[j].getAttribute('xlink:href');
                if (!linkArr.includes(linkb)) {
                    linkArr.push(linkb);
                }
            }
        }
    }
    else {
        img2Presense = false;
    }

    if (svgElement.hasAttribute('width') && svgElement.hasAttribute('height')) {
        width = parseFloat(svgElement.getAttribute("width"));
        height = parseFloat(svgElement.getAttribute("height"));
    }
    else if (svgElement.hasAttribute("viewBox")) {
        let viewBox = svgElement.getAttribute("viewBox").split(" ");
        width = parseFloat(viewBox[2]);
        height = parseFloat(viewBox[3]);
    }
    else {
        width = 300;
        height = 200;
    }

    showeExtraImgLink();
    return { w: width, h: height, imgtagPresence: (img1Presense || img2Presense) ? 1 : 0 };
}

// for showing the extra image to upload for linking to svg 

function showeExtraImgLink() {
    let sl = "";
    let tagis = (n, e) => {
        return `
            <div class="extraUpls" data-nu="${e}">
                <div class="extraUplsText" title="${n}" data-extras-name="${n}">${getFileName(n)}</div>
                <label>
                    <div class="extraUplsImg"></div>
                    <input type="file" name="extraUplsfil" onchange="uplo(this)" accept="image/png, image/jpg, image/jpeg, image/x-icon, image/apng, image/gif, image/avif, image/webp, image/svg+xml"/>
                </label>
            </div>
            `;
    };
    if (linkArr.length != 0) {
        for (let i = 0; i < linkArr.length; i++) {
            sl += tagis(linkArr[i], i);
        }
        alffil.innerHTML = sl;
    }
}

// for validating svgs and checking whether they are correct or not 

function correctingSvg(svg) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svg, 'image/svg+xml');
    const errorNode = doc.querySelector('parsererror');
    if (errorNode) {
        return { status: false, data: errorNode.textContent };
    }
    else {
        let svgd = doc.querySelector('svg');
        if (!svgd) {
            return { status: false, data: "Missing SVG Root." };
        }
        else {
            if (!svgd.hasAttribute('xmlns')) {
                svgd.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            }

            if (!svgd.hasAttribute('xmlns:xlink')) {
                svgd.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
            }
            let serializer = new XMLSerializer();
            let r = serializer.serializeToString(doc);
            if (!r.trim().startsWith('<?xml')) {
                r = '<?xml version="1.0" encoding="UTF-8"?>\n' + r;
            }

            return { status: true, data: r };
        }

    }
    return { status: false, data: "Something Went Wrong!" };
}


function openHelp(n = "o"){
     if(n == "o")
    document.getElementById('helpPopID').style.transform = "scale(1)";
     if(n == "c")
    document.getElementById('helpPopID').style.transform = "scale(0)";
}
