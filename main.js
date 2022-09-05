var index;
var list;

window.addEventListener('load', function () {
    list = document.getElementById("list");

    fetch("./pdfData.json")
        .then((response) => response.json())
        .then((data) => main(data))
})

function main(json) {
    index = json;

    let subjects = {}

    for(pdf of json.index) {
        if(!(pdf.Subject in subjects)) {
            let container = document.createElement("li");
            let subject = document.createElement("ul");
            
            container.innerText = pdf.Subject;
            container.appendChild(subject);
            subjects[pdf.Subject] = subject;
            list.appendChild(container);
        }
        let root = subjects[pdf.Subject]

        let item = document.createElement("li");

        //item.id = "pdflink"
        item.className = "pdflink"
        item.innerText = pdf.Title;
        item.setAttribute("data-url", "./" + pdf.Path);
        item.onclick = function() {
            pdfViewer.src = this.getAttribute('data-url');
        }

        root.appendChild(item);
        //list.appendChild(item);
    }
}